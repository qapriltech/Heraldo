import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminUsageService {
  constructor(private readonly prisma: PrismaService) {}

  async trackEvent(data: any) {
    if (!data.clientId || !data.eventName || !data.eventCategory) {
      throw new BadRequestException(
        'clientId, eventName and eventCategory are required',
      );
    }

    return this.prisma.usageEvent.create({
      data: {
        clientId: data.clientId,
        userId: data.userId ?? null,
        eventName: data.eventName,
        eventCategory: data.eventCategory,
        eventData: data.eventData ?? null,
        sessionId: data.sessionId ?? null,
        userAgent: data.userAgent ?? null,
        ipAddress: data.ipAddress ?? null,
      },
    });
  }

  async getClientUsage(clientId: string, query: any) {
    const page = parseInt(query?.page, 10) || 1;
    const limit = parseInt(query?.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const where: any = { clientId };
    if (query?.eventCategory) where.eventCategory = query.eventCategory;
    if (query?.from || query?.to) {
      where.occurredAt = {};
      if (query.from) where.occurredAt.gte = new Date(query.from);
      if (query.to) where.occurredAt.lte = new Date(query.to);
    }

    const [data, total] = await Promise.all([
      this.prisma.usageEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { occurredAt: 'desc' },
      }),
      this.prisma.usageEvent.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getClientHealthScore(clientId: string) {
    const existing = await this.prisma.clientHealthScore.findUnique({
      where: { clientId },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // If the score was calculated within the last day, return it
    if (
      existing &&
      existing.calculatedAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ) {
      return existing;
    }

    // Calculate fresh scores
    const eventCount = await this.prisma.usageEvent.count({
      where: { clientId, occurredAt: { gte: thirtyDaysAgo } },
    });

    const distinctCategories = await this.prisma.usageEvent.groupBy({
      by: ['eventCategory'],
      where: { clientId, occurredAt: { gte: thirtyDaysAgo } },
    });

    // activity: count events last 30d, capped at 40
    const activityScore = Math.min(eventCount, 40);
    // engagement: count distinct event categories, capped at 25
    const engagementScore = Math.min(distinctCategories.length * 5, 25);
    // adoption: 20 fixed
    const adoptionScore = 20;
    // payment: 15 fixed
    const paymentScore = 15;
    const totalScore =
      activityScore + engagementScore + adoptionScore + paymentScore;

    let tier: string;
    if (totalScore >= 80) tier = 'champion';
    else if (totalScore >= 60) tier = 'healthy';
    else if (totalScore >= 40) tier = 'standard';
    else tier = 'at_risk';

    const score = await this.prisma.clientHealthScore.upsert({
      where: { clientId },
      update: {
        activityScore,
        engagementScore,
        adoptionScore,
        paymentScore,
        totalScore,
        tier,
        calculatedAt: new Date(),
      },
      create: {
        clientId,
        activityScore,
        engagementScore,
        adoptionScore,
        paymentScore,
        totalScore,
        tier,
      },
    });

    return score;
  }

  async getAtRiskClients(query: any) {
    const page = parseInt(query?.page, 10) || 1;
    const limit = parseInt(query?.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const where = { totalScore: { lt: 50 } };

    const [data, total] = await Promise.all([
      this.prisma.clientHealthScore.findMany({
        where,
        skip,
        take: limit,
        orderBy: { totalScore: 'asc' },
      }),
      this.prisma.clientHealthScore.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getTopUsers(query: any) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const topUsers = await this.prisma.usageEvent.groupBy({
      by: ['clientId'],
      where: { occurredAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    return topUsers.map((row) => ({
      clientId: row.clientId,
      eventCount: row._count.id,
    }));
  }

  async getUpsellOpportunities(query: any) {
    const page = parseInt(query?.page, 10) || 1;
    const limit = parseInt(query?.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // Clients with high usage (score >= 70) are good upsell candidates
    const where = { totalScore: { gte: 70 } };

    const [data, total] = await Promise.all([
      this.prisma.clientHealthScore.findMany({
        where,
        skip,
        take: limit,
        orderBy: { totalScore: 'desc' },
      }),
      this.prisma.clientHealthScore.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getCohortRetention(query: any) {
    // Simplified: return monthly signup counts based on first usage event per client
    const events = await this.prisma.usageEvent.groupBy({
      by: ['clientId'],
      _min: { occurredAt: true },
    });

    const monthlyCohorts: Record<string, number> = {};
    for (const event of events) {
      if (event._min.occurredAt) {
        const month = event._min.occurredAt.toISOString().slice(0, 7);
        monthlyCohorts[month] = (monthlyCohorts[month] || 0) + 1;
      }
    }

    return Object.entries(monthlyCohorts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, newClients: count }));
  }
}
