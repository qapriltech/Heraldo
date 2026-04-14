import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminAlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any) {
    const page = parseInt(query?.page, 10) || 1;
    const limit = parseInt(query?.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.severity) where.severity = query.severity;
    if (query?.status) where.status = query.status;
    if (query?.team) where.assignedToTeam = query.team;

    const [data, total] = await Promise.all([
      this.prisma.adminAlert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.adminAlert.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async acknowledge(id: string) {
    const alert = await this.prisma.adminAlert.findUnique({ where: { id } });
    if (!alert) {
      throw new NotFoundException(`Alert ${id} not found`);
    }

    return this.prisma.adminAlert.update({
      where: { id },
      data: {
        acknowledgedAt: new Date(),
        status: 'acknowledged',
      },
    });
  }

  async resolve(id: string, notes?: string) {
    const alert = await this.prisma.adminAlert.findUnique({ where: { id } });
    if (!alert) {
      throw new NotFoundException(`Alert ${id} not found`);
    }

    return this.prisma.adminAlert.update({
      where: { id },
      data: {
        resolvedAt: new Date(),
        resolutionNotes: notes ?? null,
        status: 'resolved',
      },
    });
  }

  async getStats() {
    const [bySeverity, statusCounts] = await Promise.all([
      this.prisma.adminAlert.groupBy({
        by: ['severity'],
        _count: { id: true },
      }),
      this.prisma.adminAlert.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const statusMap: Record<string, number> = {};
    for (const s of statusCounts) {
      statusMap[s.status] = s._count.id;
    }

    return {
      bySeverity: bySeverity.map((s) => ({
        severity: s.severity,
        count: s._count.id,
      })),
      open: statusMap['open'] ?? 0,
      acknowledged: statusMap['acknowledged'] ?? 0,
      resolved: statusMap['resolved'] ?? 0,
    };
  }
}
