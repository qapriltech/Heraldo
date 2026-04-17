import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AnalyticsReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Overview KPIs ─────────────────────────────────────

  async getOverview(institutionId: string) {
    const stats = await this.prisma.analyticsCommuniqueStats.findMany({
      where: { communiqueId: { in: (await this.prisma.communique.findMany({ where: { institutionId }, select: { id: true } })).map(c => c.id) } },
    });

    const totalCommuniques = stats.length;
    const avgOpenRate = totalCommuniques > 0 ? stats.reduce((s, c) => s + c.openRate, 0) / totalCommuniques : 0;
    const totalArticles = stats.reduce((s, c) => s + c.articlesGenerated, 0);
    const totalReach = stats.reduce((s, c) => s + c.estimatedReach, 0);
    const delays = stats.filter(c => c.avgPublicationDelayHours != null).map(c => c.avgPublicationDelayHours!);
    const avgDelay = delays.length > 0 ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;

    return {
      totalCommuniques,
      avgOpenRate: Math.round(avgOpenRate * 100) / 100,
      totalArticlesGenerated: totalArticles,
      totalEstimatedReach: totalReach,
      avgPublicationDelayHours: Math.round(avgDelay * 10) / 10,
    };
  }

  // ── Per-communique stats ──────────────────────────────

  async getCommuniqueStats(institutionId: string, query: { page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const communiques = await this.prisma.communique.findMany({
      where: { institutionId },
      select: { id: true, title: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const ids = communiques.map(c => c.id);
    const stats = await this.prisma.analyticsCommuniqueStats.findMany({
      where: { communiqueId: { in: ids } },
    });
    const statsMap = new Map(stats.map(s => [s.communiqueId, s]));

    const data = communiques.map(c => ({
      ...c,
      stats: statsMap.get(c.id) || { openRate: 0, clickRate: 0, articlesGenerated: 0, estimatedReach: 0 },
    }));

    const total = await this.prisma.communique.count({ where: { institutionId } });

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  // ── Journalist ranking ────────────────────────────────

  async getJournalistRanking(institutionId: string) {
    // Rank journalists by number of articles/publications linked to this institution
    const targets = await this.prisma.communiqueTarget.findMany({
      where: { communique: { institutionId } },
    });

    // Collect unique journalist IDs
    const journalistIds = [...new Set(targets.filter(t => t.journalistId).map(t => t.journalistId!))];
    const journalists = await this.prisma.journalist.findMany({
      where: { id: { in: journalistIds } },
      include: { user: { select: { fullName: true } } },
    });
    const journalistNames = new Map(journalists.map(j => [j.id, j.user.fullName]));

    const journalistMap = new Map<string, { id: string; name: string; articles: number; openCount: number }>();
    for (const t of targets) {
      if (!t.journalistId) continue;
      const existing = journalistMap.get(t.journalistId) || {
        id: t.journalistId,
        name: journalistNames.get(t.journalistId) || 'Inconnu',
        articles: 0,
        openCount: 0,
      };
      existing.articles += 1;
      if (t.openedAt) existing.openCount += 1;
      journalistMap.set(t.journalistId, existing);
    }

    const ranking = Array.from(journalistMap.values()).sort((a, b) => b.articles - a.articles);
    return ranking.slice(0, 50);
  }

  // ── Generate report ───────────────────────────────────

  async generateReport(institutionId: string, reportType: 'weekly' | 'monthly' | 'quarterly') {
    const now = new Date();
    const periodStart = new Date(now);
    if (reportType === 'weekly') periodStart.setDate(periodStart.getDate() - 7);
    else if (reportType === 'monthly') periodStart.setMonth(periodStart.getMonth() - 1);
    else periodStart.setMonth(periodStart.getMonth() - 3);

    const overview = await this.getOverview(institutionId);

    const report = await this.prisma.analyticsReport.create({
      data: {
        institutionId,
        reportType,
        periodStart,
        periodEnd: now,
        data: overview as any,
        pdfUrl: null, // PDF generation placeholder
      },
    });

    return report;
  }

  // ── PDF placeholder ───────────────────────────────────

  async getRapportPdf(institutionId: string) {
    const latest = await this.prisma.analyticsReport.findFirst({
      where: { institutionId },
      orderBy: { generatedAt: 'desc' },
    });

    if (!latest) return { message: 'Aucun rapport genere. Utilisez POST /analytics/rapport/generate.' };
    return { reportId: latest.id, pdfUrl: latest.pdfUrl, generatedAt: latest.generatedAt };
  }
}
