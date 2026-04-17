import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class VeilleService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Keywords ──────────────────────────────────────────────

  async createKeyword(institutionId: string, data: { keyword: string; weight?: number; alertThreshold?: number }) {
    return this.prisma.veilleKeyword.create({
      data: {
        institutionId,
        keyword: data.keyword,
        weight: data.weight ?? 1,
        alertThreshold: data.alertThreshold ?? 50,
      },
    });
  }

  async listKeywords(institutionId: string) {
    return this.prisma.veilleKeyword.findMany({
      where: { institutionId, active: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteKeyword(id: string) {
    const keyword = await this.prisma.veilleKeyword.findUnique({ where: { id } });
    if (!keyword) throw new NotFoundException('Mot-cle introuvable');
    await this.prisma.veilleKeyword.update({ where: { id }, data: { active: false } });
    return { success: true };
  }

  // ── Mentions ──────────────────────────────────────────────

  async listMentions(
    institutionId: string,
    query: { sentiment?: string; source?: string; from?: string; to?: string; page?: number; limit?: number },
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = { institutionId };
    if (query.sentiment) where.sentiment = query.sentiment;
    if (query.source) where.source = { contains: query.source, mode: 'insensitive' };
    if (query.from || query.to) {
      where.detectedAt = {};
      if (query.from) where.detectedAt.gte = new Date(query.from);
      if (query.to) where.detectedAt.lte = new Date(query.to);
    }

    const [data, total] = await Promise.all([
      this.prisma.veilleMention.findMany({
        where,
        orderBy: { detectedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.veilleMention.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  // ── Alerts ────────────────────────────────────────────────

  async listAlerts(institutionId: string) {
    return this.prisma.veilleAlert.findMany({
      where: { institutionId },
      include: { mention: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async acknowledgeAlert(id: string, userId: string) {
    const alert = await this.prisma.veilleAlert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException('Alerte introuvable');
    return this.prisma.veilleAlert.update({
      where: { id },
      data: { acknowledged: true, acknowledgedAt: new Date(), acknowledgedBy: userId },
    });
  }

  // ── Rapport ───────────────────────────────────────────────

  async generateRapport(institutionId: string, period: 'daily' | 'weekly') {
    const now = new Date();
    const from = new Date(now);
    if (period === 'daily') from.setDate(from.getDate() - 1);
    else from.setDate(from.getDate() - 7);

    const [mentions, alerts] = await Promise.all([
      this.prisma.veilleMention.count({ where: { institutionId, detectedAt: { gte: from } } }),
      this.prisma.veilleAlert.count({ where: { institutionId, createdAt: { gte: from } } }),
    ]);

    const sentimentBreakdown = await this.prisma.veilleMention.groupBy({
      by: ['sentiment'],
      where: { institutionId, detectedAt: { gte: from } },
      _count: true,
    });

    return {
      period,
      from: from.toISOString(),
      to: now.toISOString(),
      totalMentions: mentions,
      totalAlerts: alerts,
      sentimentBreakdown: sentimentBreakdown.map((s) => ({ sentiment: s.sentiment, count: s._count })),
    };
  }
}
