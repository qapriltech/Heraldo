import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class JournalistRevenuesService {
  constructor(private readonly prisma: PrismaService) {}

  private async findJournalist(userId: string) {
    const journalist = await this.prisma.journalist.findFirst({
      where: { userId },
    });
    if (!journalist) {
      throw new NotFoundException('Journalist profile not found');
    }
    return journalist;
  }

  async getDashboard(userId: string, query: any) {
    const journalist = await this.findJournalist(userId);

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const baseWhere = {
      journalistId: journalist.id,
      status: 'CONFIRMED' as const,
    };

    const [totalLifetime, totalThisYear, totalThisMonth, countEvents] =
      await Promise.all([
        this.prisma.fcmTransaction.aggregate({
          where: baseWhere,
          _sum: { amountNet: true },
        }),
        this.prisma.fcmTransaction.aggregate({
          where: { ...baseWhere, paidAt: { gte: startOfYear } },
          _sum: { amountNet: true },
        }),
        this.prisma.fcmTransaction.aggregate({
          where: { ...baseWhere, paidAt: { gte: startOfMonth } },
          _sum: { amountNet: true },
        }),
        this.prisma.fcmTransaction.count({ where: baseWhere }),
      ]);

    return {
      totalLifetime: totalLifetime._sum.amountNet ?? 0,
      totalThisYear: totalThisYear._sum.amountNet ?? 0,
      totalThisMonth: totalThisMonth._sum.amountNet ?? 0,
      countEvents,
    };
  }

  async getByEvent(userId: string, query: any) {
    const journalist = await this.findJournalist(userId);
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.fcmTransaction.findMany({
        where: { journalistId: journalist.id },
        include: {
          pool: {
            select: {
              id: true,
              name: true,
              institution: { select: { id: true, name: true, logoUrl: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.fcmTransaction.count({
        where: { journalistId: journalist.id },
      }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getByInstitution(userId: string, query: any) {
    const journalist = await this.findJournalist(userId);

    const transactions = await this.prisma.fcmTransaction.findMany({
      where: { journalistId: journalist.id, status: 'CONFIRMED' },
      include: {
        pool: {
          select: {
            institutionId: true,
            institution: { select: { id: true, name: true, logoUrl: true } },
          },
        },
      },
    });

    // Aggregate by institution
    const byInstitution = new Map<
      string,
      { institution: any; totalNet: number; count: number }
    >();

    for (const tx of transactions) {
      const instId = tx.pool.institutionId;
      const existing = byInstitution.get(instId);
      if (existing) {
        existing.totalNet += tx.amountNet;
        existing.count += 1;
      } else {
        byInstitution.set(instId, {
          institution: tx.pool.institution,
          totalNet: tx.amountNet,
          count: 1,
        });
      }
    }

    return Array.from(byInstitution.values()).sort(
      (a, b) => b.totalNet - a.totalNet,
    );
  }

  async getPending(userId: string, query: any) {
    const journalist = await this.findJournalist(userId);
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = { journalistId: journalist.id, status: 'PENDING' as const };

    const [items, total] = await Promise.all([
      this.prisma.fcmProof.findMany({
        where,
        include: {
          invitation: {
            select: {
              pool: {
                select: { id: true, name: true },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.fcmProof.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getChart(userId: string, query: any) {
    const journalist = await this.findJournalist(userId);
    const months = query?.months ?? 12;

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const transactions = await this.prisma.fcmTransaction.findMany({
      where: {
        journalistId: journalist.id,
        status: 'CONFIRMED',
        paidAt: { gte: start },
      },
      select: { amountNet: true, paidAt: true },
      orderBy: { paidAt: 'asc' },
    });

    // Build monthly buckets
    const chart: { month: string; total: number }[] = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      chart.push({ month: key, total: 0 });
    }

    for (const tx of transactions) {
      if (!tx.paidAt) continue;
      const key = `${tx.paidAt.getFullYear()}-${String(tx.paidAt.getMonth() + 1).padStart(2, '0')}`;
      const bucket = chart.find((c) => c.month === key);
      if (bucket) bucket.total += tx.amountNet;
    }

    return chart;
  }

  async getFiscalExport(userId: string, query: any) {
    const journalist = await this.findJournalist(userId);
    const year = query?.year ?? new Date().getFullYear();

    const transactions = await this.prisma.fcmTransaction.findMany({
      where: {
        journalistId: journalist.id,
        status: 'CONFIRMED',
        paidAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${Number(year) + 1}-01-01`),
        },
      },
      include: {
        pool: {
          select: {
            name: true,
            institution: { select: { name: true } },
          },
        },
      },
      orderBy: { paidAt: 'asc' },
    });

    return transactions.map((tx) => ({
      id: tx.id,
      date: tx.paidAt,
      institution: tx.pool.institution.name,
      event: tx.pool.name,
      amountGross: tx.amountGross,
      commission: tx.commissionAmount,
      amountNet: tx.amountNet,
      operator: tx.operator,
      reference: tx.mobileMoneyRef,
    }));
  }
}
