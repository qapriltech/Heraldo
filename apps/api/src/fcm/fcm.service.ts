import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

const HERALDO_COMMISSION_RATE = 15; // 15% — RG-FCM-05

@Injectable()
export class FcmService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Étape 1 — Créer un fonds FCM (RG-FCM-01)
   */
  async createPool(userId: string, data: {
    name: string;
    amountPerArticle?: number;
    amountPerTvReport?: number;
    amountPerRadio?: number;
    amountPerSocialPost?: number;
    publicationDeadlineHours?: number;
    institutionId?: string;
  }) {
    if (!data.name) throw new BadRequestException('Le nom du fonds est obligatoire');

    let institutionId = data.institutionId;
    if (!institutionId) {
      const link = await this.prisma.institutionUser.findFirst({
        where: { userId },
        select: { institutionId: true },
      });
      institutionId = link?.institutionId;
      if (!institutionId) throw new BadRequestException('Institution introuvable');
    }

    const pool = await this.prisma.fcmPool.create({
      data: {
        institutionId,
        name: data.name,
        status: 'PENDING',
        amountPerArticle: data.amountPerArticle || null,
        amountPerTvReport: data.amountPerTvReport || null,
        amountPerRadio: data.amountPerRadio || null,
        amountPerSocialPost: data.amountPerSocialPost || null,
        publicationDeadlineHours: data.publicationDeadlineHours || 48,
      },
    });

    return this.findPool(pool.id);
  }

  /**
   * Lister les fonds FCM
   */
  async findAllPools(userId: string, query: { status?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const userInstitutions = await this.prisma.institutionUser.findMany({
      where: { userId },
      select: { institutionId: true },
    });
    const institutionIds = userInstitutions.map(ui => ui.institutionId);
    const where: any = institutionIds.length > 0 ? { institutionId: { in: institutionIds } } : {};
    if (query.status) where.status = query.status;

    const [pools, total] = await Promise.all([
      this.prisma.fcmPool.findMany({
        where,
        include: {
          institution: { select: { id: true, name: true } },
          _count: { select: { invitations: true, transactions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.fcmPool.count({ where }),
    ]);

    return { data: pools, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * Détail d'un fonds
   */
  async findPool(id: string) {
    const pool = await this.prisma.fcmPool.findUnique({
      where: { id },
      include: {
        institution: { select: { id: true, name: true, logoUrl: true } },
        invitations: {
          include: {
            journalist: {
              select: {
                id: true,
                user: { select: { fullName: true } },
                mediaOrganization: { select: { name: true } },
              },
            },
            proofs: true,
          },
        },
        transactions: { orderBy: { createdAt: 'desc' } },
        _count: { select: { invitations: true, transactions: true } },
      },
    });
    if (!pool) throw new NotFoundException('Fonds FCM introuvable');
    return pool;
  }

  /**
   * Étape 2 — Alimenter le fonds (RG-FCM-01)
   */
  async fundPool(poolId: string, amount: number, paymentMethod: string) {
    const pool = await this.prisma.fcmPool.findUnique({ where: { id: poolId } });
    if (!pool) throw new NotFoundException('Fonds introuvable');
    if (amount <= 0) throw new BadRequestException('Le montant doit être positif');

    // Créer un paiement
    const payment = await this.prisma.payment.create({
      data: {
        institutionId: pool.institutionId,
        amount,
        currency: 'XOF',
        operator: paymentMethod === 'WAVE' ? 'WAVE' : paymentMethod === 'ORANGE' ? 'ORANGE_MONEY' : 'CINETPAY',
        status: 'CONFIRMED', // En dev, on confirme directement
        description: `Alimentation FCM — ${pool.name}`,
        confirmedAt: new Date(),
      },
    });

    // Enregistrer le funding
    await this.prisma.fcmFunding.create({
      data: {
        poolId,
        amount,
        paymentId: payment.id,
      },
    });

    // Mettre à jour le total et le statut
    await this.prisma.fcmPool.update({
      where: { id: poolId },
      data: {
        totalFunded: { increment: amount },
        status: 'FUNDED',
      },
    });

    return { success: true, poolId, amountFunded: amount, totalFunded: pool.totalFunded + amount };
  }

  /**
   * Étape 3 — Inviter des journalistes avec conditions FCM visibles (RG-FCM-02, RG-FCM-03)
   */
  async inviteJournalists(poolId: string, journalistIds: string[]) {
    const pool = await this.prisma.fcmPool.findUnique({ where: { id: poolId } });
    if (!pool) throw new NotFoundException('Fonds introuvable');
    if (pool.status === 'PENDING') throw new BadRequestException('Le fonds doit être alimenté avant d\'inviter');

    const invited = [];
    for (const journalistId of journalistIds) {
      const existing = await this.prisma.fcmInvitation.findFirst({
        where: { poolId, journalistId },
      });
      if (existing) continue;

      const invitation = await this.prisma.fcmInvitation.create({
        data: { poolId, journalistId, status: 'PENDING' },
      });
      invited.push(invitation);
    }

    // Activer le fonds
    if (pool.status === 'FUNDED') {
      await this.prisma.fcmPool.update({
        where: { id: poolId },
        data: { status: 'ACTIVE' },
      });
    }

    // RG-FCM-02: les montants sont déjà dans le pool, visibles via l'API
    console.log(`[FCM] ${invited.length} journalistes invités au fonds "${pool.name}"`);
    return { invited: invited.length, poolId };
  }

  /**
   * Étape 4 — Journaliste soumet une preuve de couverture (RG-FCM-04)
   */
  async submitProof(poolId: string, userId: string, data: {
    proofUrl: string;
    proofType: 'URL' | 'SCREENSHOT' | 'PDF';
    coverageType: 'ARTICLE' | 'TV_REPORT' | 'RADIO' | 'SOCIAL_POST';
  }) {
    const pool = await this.prisma.fcmPool.findUnique({ where: { id: poolId } });
    if (!pool) throw new NotFoundException('Fonds introuvable');

    // Trouver le journaliste
    const journalist = await this.prisma.journalist.findFirst({ where: { userId } });
    if (!journalist) throw new BadRequestException('Profil journaliste introuvable');

    // Vérifier que le journaliste est invité
    const invitation = await this.prisma.fcmInvitation.findFirst({
      where: { poolId, journalistId: journalist.id, status: 'ACCEPTED' },
    });
    if (!invitation) {
      // Auto-accepter l'invitation si PENDING
      const pending = await this.prisma.fcmInvitation.findFirst({
        where: { poolId, journalistId: journalist.id, status: 'PENDING' },
      });
      if (pending) {
        await this.prisma.fcmInvitation.update({
          where: { id: pending.id },
          data: { status: 'ACCEPTED', respondedAt: new Date() },
        });
      } else {
        throw new BadRequestException('Vous n\'êtes pas invité à ce fonds FCM');
      }
    }

    // Déterminer le montant selon le type de couverture
    let amountDue = 0;
    switch (data.coverageType) {
      case 'ARTICLE': amountDue = pool.amountPerArticle || 0; break;
      case 'TV_REPORT': amountDue = pool.amountPerTvReport || 0; break;
      case 'RADIO': amountDue = pool.amountPerRadio || 0; break;
      case 'SOCIAL_POST': amountDue = pool.amountPerSocialPost || 0; break;
    }
    if (amountDue === 0) throw new BadRequestException('Aucun montant configuré pour ce type de couverture');

    const inv = invitation || await this.prisma.fcmInvitation.findFirst({ where: { poolId, journalistId: journalist.id } });

    const proof = await this.prisma.fcmProof.create({
      data: {
        invitationId: inv!.id,
        journalistId: journalist.id,
        proofType: data.proofType,
        proofUrl: data.proofUrl,
        coverageType: data.coverageType,
        amountDue,
        commissionRate: HERALDO_COMMISSION_RATE,
        amountNet: Math.round(amountDue * (1 - HERALDO_COMMISSION_RATE / 100)),
        status: 'PENDING',
      },
    });

    console.log(`[FCM] Preuve soumise par journaliste ${journalist.id} — ${data.coverageType} — ${amountDue} FCFA`);
    return proof;
  }

  /**
   * Étape 5 — Admin valide la preuve → paiement auto (RG-FCM-05)
   */
  async validateProof(poolId: string, proofId: string, data: {
    approved: boolean;
    rejectReason?: string;
    reviewerId: string;
  }) {
    const proof = await this.prisma.fcmProof.findUnique({
      where: { id: proofId },
      include: { journalist: true },
    });
    if (!proof) throw new NotFoundException('Preuve introuvable');
    if (proof.status !== 'PENDING') throw new BadRequestException('Preuve déjà traitée');

    if (data.approved) {
      // Créer la transaction de paiement
      const commissionAmount = Math.round(proof.amountDue * HERALDO_COMMISSION_RATE / 100);
      const amountNet = proof.amountDue - commissionAmount;

      const transaction = await this.prisma.fcmTransaction.create({
        data: {
          poolId,
          journalistId: proof.journalistId,
          amountGross: proof.amountDue,
          commissionAmount,
          amountNet,
          operator: 'WAVE', // TODO: utiliser le Mobile Money du journaliste
          status: 'CONFIRMED',
          paidAt: new Date(),
        },
      });

      // Mettre à jour la preuve
      await this.prisma.fcmProof.update({
        where: { id: proofId },
        data: {
          status: 'VALIDATED',
          reviewedById: data.reviewerId,
          reviewedAt: new Date(),
          amountNet,
          transactionId: transaction.id,
        },
      });

      // Mettre à jour le pool
      await this.prisma.fcmPool.update({
        where: { id: poolId },
        data: {
          totalSpent: { increment: proof.amountDue },
          totalCommission: { increment: commissionAmount },
        },
      });

      console.log(`[FCM] Preuve VALIDÉE — ${amountNet} FCFA versés au journaliste, ${commissionAmount} FCFA commission HERALDO`);

      return {
        success: true,
        proofId,
        status: 'VALIDATED',
        amountGross: proof.amountDue,
        commission: commissionAmount,
        amountNet,
        transactionId: transaction.id,
      };
    } else {
      // Rejet
      await this.prisma.fcmProof.update({
        where: { id: proofId },
        data: {
          status: 'REJECTED',
          reviewedById: data.reviewerId,
          reviewedAt: new Date(),
        },
      });

      // RG-FCM-03: 3 rejets consécutifs → suspension
      const journalist = await this.prisma.journalist.findUnique({ where: { id: proof.journalistId } });
      if (journalist) {
        const newRejects = journalist.consecutiveRejects + 1;
        await this.prisma.journalist.update({
          where: { id: proof.journalistId },
          data: {
            consecutiveRejects: newRejects,
            ...(newRejects >= 3 ? { accreditationStatus: 'SUSPENDED', suspensionReason: 'FCM: 3 preuves rejetées consécutives (RG-FCM-03)' } : {}),
          },
        });
      }

      return { success: true, proofId, status: 'REJECTED', reason: data.rejectReason };
    }
  }

  /**
   * Statistiques d'un fonds
   */
  async getPoolStats(poolId: string) {
    const pool = await this.prisma.fcmPool.findUnique({
      where: { id: poolId },
      include: {
        _count: { select: { invitations: true, transactions: true } },
        invitations: { select: { status: true } },
      },
    });
    if (!pool) throw new NotFoundException('Fonds introuvable');

    const proofs = await this.prisma.fcmProof.findMany({
      where: { invitation: { poolId } },
      select: { status: true },
    });

    const accepted = pool.invitations.filter(i => i.status === 'ACCEPTED').length;
    const pending = pool.invitations.filter(i => i.status === 'PENDING').length;
    const proofsValidated = proofs.filter(p => p.status === 'VALIDATED').length;
    const proofsPending = proofs.filter(p => p.status === 'PENDING').length;
    const proofsRejected = proofs.filter(p => p.status === 'REJECTED').length;
    const remainingBudget = pool.totalFunded - pool.totalSpent;

    return {
      poolId,
      name: pool.name,
      status: pool.status,
      totalFunded: pool.totalFunded,
      totalSpent: pool.totalSpent,
      totalCommission: pool.totalCommission,
      remainingBudget,
      invitations: { total: pool._count.invitations, accepted, pending },
      proofs: { validated: proofsValidated, pending: proofsPending, rejected: proofsRejected },
      transactions: pool._count.transactions,
    };
  }
}
