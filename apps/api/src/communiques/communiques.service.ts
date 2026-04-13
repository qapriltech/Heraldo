import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class CommuniquesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer un communiqué (brouillon)
   */
  async create(userId: string, data: {
    title: string;
    chapeau?: string;
    bodyContent: string;
    contactPresse?: string;
    institutionId: string;
  }) {
    // Vérifier que le titre et le corps existent (RG-EMI-02)
    if (!data.title || !data.bodyContent) {
      throw new BadRequestException('Le titre et le corps du communiqué sont obligatoires');
    }

    const communique = await this.prisma.communique.create({
      data: {
        institutionId: data.institutionId,
        title: data.title,
        chapeau: data.chapeau || null,
        bodyContent: data.bodyContent,
        contactPresse: data.contactPresse || null,
        status: 'DRAFT',
        createdById: userId,
      },
    });

    // Générer automatiquement les 3 formats (F-EMI-01)
    await this.generateAllFormats(communique.id, data.title, data.chapeau || '', data.bodyContent, data.contactPresse || '');

    return this.findOne(communique.id);
  }

  /**
   * Lister les communiqués d'une institution
   */
  async findAll(userId: string, query: { status?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    // Trouver les institutions de l'utilisateur
    const userInstitutions = await this.prisma.institutionUser.findMany({
      where: { userId },
      select: { institutionId: true },
    });
    const institutionIds = userInstitutions.map(ui => ui.institutionId);

    // Si l'utilisateur n'est rattaché à aucune institution, chercher les communiqués qu'il a créés
    const where: any = institutionIds.length > 0
      ? { institutionId: { in: institutionIds }, ...(query.status ? { status: query.status } : {}) }
      : { createdById: userId, ...(query.status ? { status: query.status } : {}) };

    const [communiques, total] = await Promise.all([
      this.prisma.communique.findMany({
        where,
        include: {
          formats: true,
          targets: true,
          distributions: true,
          institution: { select: { id: true, name: true, logoUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.communique.count({ where }),
    ]);

    return {
      data: communiques,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Détail d'un communiqué
   */
  async findOne(id: string) {
    const communique = await this.prisma.communique.findUnique({
      where: { id },
      include: {
        formats: true,
        targets: true,
        distributions: true,
        attachments: true,
        institution: { select: { id: true, name: true, logoUrl: true, brandColor: true } },
      },
    });

    if (!communique) throw new NotFoundException('Communiqué introuvable');
    return communique;
  }

  /**
   * Modifier un communiqué (brouillon ou en attente uniquement)
   */
  async update(id: string, data: {
    title?: string;
    chapeau?: string;
    bodyContent?: string;
    contactPresse?: string;
  }) {
    const existing = await this.prisma.communique.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Communiqué introuvable');
    if (!['DRAFT', 'PENDING_REVIEW'].includes(existing.status)) {
      throw new BadRequestException('Seul un brouillon peut être modifié');
    }

    const communique = await this.prisma.communique.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.chapeau !== undefined && { chapeau: data.chapeau }),
        ...(data.bodyContent && { bodyContent: data.bodyContent }),
        ...(data.contactPresse !== undefined && { contactPresse: data.contactPresse }),
      },
    });

    // Regénérer les formats si le contenu a changé
    if (data.title || data.bodyContent || data.chapeau) {
      await this.prisma.communiqueFormat_.deleteMany({ where: { communiqueId: id } });
      await this.generateAllFormats(
        id,
        data.title || existing.title,
        data.chapeau ?? existing.chapeau ?? '',
        data.bodyContent || existing.bodyContent,
        data.contactPresse ?? existing.contactPresse ?? '',
      );
    }

    return this.findOne(id);
  }

  /**
   * Supprimer un communiqué
   */
  async delete(id: string) {
    const existing = await this.prisma.communique.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Communiqué introuvable');
    if (existing.status === 'SENT') {
      throw new BadRequestException('Un communiqué diffusé ne peut pas être supprimé');
    }

    await this.prisma.communique.delete({ where: { id } });
    return { success: true, message: 'Communiqué supprimé' };
  }

  /**
   * F-EMI-01 — Génération automatique en 3 formats
   */
  private async generateAllFormats(
    communiqueId: string,
    title: string,
    chapeau: string,
    body: string,
    contact: string,
  ) {
    // Format PRESSE ECRITE — structuré officiel (RG-EMI-02)
    const presseContent = [
      `COMMUNIQUÉ DE PRESSE`,
      ``,
      `${title}`,
      ``,
      chapeau ? `${chapeau}` : '',
      ``,
      body,
      ``,
      `---`,
      contact ? `Contact presse : ${contact}` : '',
      ``,
      `Communiqué diffusé via HÉRALDO`, // RG-EMI-03
    ].filter(Boolean).join('\n');

    // Format WEB SEO — optimisé avec meta
    const metaTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
    const metaDesc = chapeau
      ? (chapeau.length > 155 ? chapeau.substring(0, 152) + '...' : chapeau)
      : body.substring(0, 155) + '...';
    const webContent = [
      `<article>`,
      `<h1>${title}</h1>`,
      chapeau ? `<p class="lead">${chapeau}</p>` : '',
      `<div class="body">${body}</div>`,
      contact ? `<footer><p>Contact : ${contact}</p></footer>` : '',
      `<p class="heraldo-mention">Communiqué diffusé via HÉRALDO</p>`,
      `</article>`,
    ].filter(Boolean).join('\n');

    // Format RÉSEAUX SOCIAUX — 280 caractères + visuel
    const socialText = chapeau
      ? (chapeau.length > 250 ? chapeau.substring(0, 247) + '...' : chapeau)
      : (body.length > 250 ? body.substring(0, 247) + '...' : body);
    const socialContent = `${title}\n\n${socialText}\n\n#HERALDO`;

    await this.prisma.communiqueFormat_.createMany({
      data: [
        {
          communiqueId,
          format: 'PRESSE_ECRITE',
          content: presseContent,
        },
        {
          communiqueId,
          format: 'WEB_SEO',
          content: webContent,
          metaTitle,
          metaDesc,
        },
        {
          communiqueId,
          format: 'RESEAUX_SOCIAUX',
          content: socialContent,
        },
      ],
    });
  }

  /**
   * F-EMI-04 — Certification SHA-256
   */
  async computeHash(id: string) {
    const communique = await this.prisma.communique.findUnique({
      where: { id },
      include: { formats: true },
    });
    if (!communique) throw new NotFoundException('Communiqué introuvable');

    const content = `${communique.id}|${communique.title}|${communique.bodyContent}|${communique.createdAt.toISOString()}`;
    const hash = crypto.createHash('sha256').update(content).digest('hex');

    await this.prisma.communique.update({
      where: { id },
      data: { sha256Hash: hash },
    });

    return { id, sha256Hash: hash, certified: true };
  }

  /**
   * Diffuser un communiqué aux journalistes ciblés
   */
  async diffuse(id: string, data: {
    journalistIds?: string[];
    channels?: string[];
  }) {
    const communique = await this.prisma.communique.findUnique({
      where: { id },
      include: { formats: true, institution: true },
    });
    if (!communique) throw new NotFoundException('Communiqué introuvable');

    // Validation RG-EMI-02 — champs obligatoires
    if (!communique.title || !communique.bodyContent) {
      throw new BadRequestException('Le communiqué doit avoir un titre et un corps (RG-EMI-02)');
    }
    const presseFormat = communique.formats.find(f => f.format === 'PRESSE_ECRITE');
    if (!presseFormat && !communique.chapeau) {
      throw new BadRequestException('Le format presse écrite nécessite un chapeau (RG-EMI-02)');
    }

    // Certification SHA-256 avant diffusion (F-EMI-04)
    if (!communique.sha256Hash) {
      await this.computeHash(id);
    }

    // Créer les targets (journalistes ciblés)
    const journalistIds = data.journalistIds || [];
    if (journalistIds.length > 0) {
      // Récupérer les emails des journalistes
      const journalists = await this.prisma.journalist.findMany({
        where: { id: { in: journalistIds } },
        include: { user: { select: { email: true, fullName: true } } },
      });

      await this.prisma.communiqueTarget.createMany({
        data: journalists.map(j => ({
          communiqueId: id,
          journalistId: j.id,
          email: j.user.email,
          sentAt: new Date(),
        })),
      });
    }

    // Enregistrer la distribution
    const channels = data.channels || ['EMAIL'];
    for (const channel of channels) {
      await this.prisma.communiqueDistribution.create({
        data: {
          communiqueId: id,
          channel,
          recipientCount: journalistIds.length,
          sentAt: new Date(),
        },
      });
    }

    // Mettre à jour le statut
    await this.prisma.communique.update({
      where: { id },
      data: {
        status: 'SENT',
        publishedAt: new Date(),
      },
    });

    // TODO: Envoi réel par email/WhatsApp (Mailgun, WhatsApp Business API)
    console.log(`[EMISSION] Communiqué "${communique.title}" diffusé à ${journalistIds.length} journalistes via ${channels.join(', ')}`);

    return {
      success: true,
      communiqueId: id,
      recipientCount: journalistIds.length,
      channels,
      diffusedAt: new Date().toISOString(),
    };
  }

  /**
   * Statut de diffusion
   */
  async getDiffusionStatus(id: string) {
    const communique = await this.prisma.communique.findUnique({
      where: { id },
      include: {
        targets: true,
        distributions: true,
      },
    });
    if (!communique) throw new NotFoundException('Communiqué introuvable');

    const totalTargets = communique.targets.length;
    const opened = communique.targets.filter(t => t.openedAt).length;

    return {
      communiqueId: id,
      status: communique.status,
      totalRecipients: totalTargets,
      opened,
      openRate: totalTargets > 0 ? Math.round((opened / totalTargets) * 100) : 0,
      distributions: communique.distributions,
    };
  }
}
