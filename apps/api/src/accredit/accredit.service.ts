import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AccreditService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Issue accreditation ───────────────────────────────

  async issueCard(data: {
    journalistId: string;
    institutionId: string;
    accreditationType: string;
    validFrom: string;
    validUntil?: string;
    eventName?: string;
    issuedBy: string;
  }) {
    const qrCode = crypto.randomBytes(32).toString('hex');

    return this.prisma.accreditationCard.create({
      data: {
        journalistId: data.journalistId,
        institutionId: data.institutionId,
        accreditationType: data.accreditationType,
        validFrom: new Date(data.validFrom),
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        qrCode,
        status: 'active',
        eventName: data.eventName || null,
        issuedBy: data.issuedBy,
      },
    });
  }

  // ── List cards ────────────────────────────────────────

  async listCards(institutionId: string, query: { status?: string; accreditationType?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = { institutionId };
    if (query.status) where.status = query.status;
    if (query.accreditationType) where.accreditationType = query.accreditationType;

    const [data, total] = await Promise.all([
      this.prisma.accreditationCard.findMany({
        where,
        orderBy: { issuedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.accreditationCard.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  // ── Get one ───────────────────────────────────────────

  async getCard(id: string) {
    const card = await this.prisma.accreditationCard.findUnique({ where: { id } });
    if (!card) throw new NotFoundException('Accreditation introuvable');
    return card;
  }

  // ── Verify QR (public) ───────────────────────────────

  async verifyQr(qrCode: string) {
    const card = await this.prisma.accreditationCard.findUnique({ where: { qrCode } });
    if (!card) return { valid: false, message: 'QR code invalide' };

    const now = new Date();
    const isExpired = card.validUntil && card.validUntil < now;
    const isActive = card.status === 'active' && !isExpired;

    return {
      valid: isActive,
      status: card.status,
      accreditationType: card.accreditationType,
      journalistId: card.journalistId,
      institutionId: card.institutionId,
      validFrom: card.validFrom,
      validUntil: card.validUntil,
      eventName: card.eventName,
      expired: !!isExpired,
    };
  }

  // ── Revoke ────────────────────────────────────────────

  async revokeCard(id: string, reason?: string) {
    const card = await this.prisma.accreditationCard.findUnique({ where: { id } });
    if (!card) throw new NotFoundException('Accreditation introuvable');
    if (card.status === 'revoked') throw new BadRequestException('Deja revoquee');

    return this.prisma.accreditationCard.update({
      where: { id },
      data: { status: 'revoked', revokedAt: new Date(), revokedReason: reason || null },
    });
  }

  // ── Stats ─────────────────────────────────────────────

  async getStats(institutionId: string) {
    const [total, active, revoked, expired] = await Promise.all([
      this.prisma.accreditationCard.count({ where: { institutionId } }),
      this.prisma.accreditationCard.count({ where: { institutionId, status: 'active' } }),
      this.prisma.accreditationCard.count({ where: { institutionId, status: 'revoked' } }),
      this.prisma.accreditationCard.count({ where: { institutionId, status: 'active', validUntil: { lt: new Date() } } }),
    ]);

    const byType = await this.prisma.accreditationCard.groupBy({
      by: ['accreditationType'],
      where: { institutionId },
      _count: true,
    });

    return {
      total,
      active: active - expired,
      revoked,
      expired,
      byType: byType.map((t) => ({ type: t.accreditationType, count: t._count })),
    };
  }
}
