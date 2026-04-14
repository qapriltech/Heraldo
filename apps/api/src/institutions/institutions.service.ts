import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class InstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Dashboard agrégé — KPIs temps réel
   */
  async getDashboard(userId: string) {
    // Trouver l'institution
    const link = await this.prisma.institutionUser.findFirst({
      where: { userId },
      include: { institution: true },
    });

    const institutionId = link?.institutionId;
    const institution = link?.institution;

    // Compter les communiqués
    const [totalCommuniques, communiquesSent, communiquesDraft] = await Promise.all([
      this.prisma.communique.count({ where: institutionId ? { institutionId } : { createdById: userId } }),
      this.prisma.communique.count({ where: { ...(institutionId ? { institutionId } : { createdById: userId }), status: 'SENT' } }),
      this.prisma.communique.count({ where: { ...(institutionId ? { institutionId } : { createdById: userId }), status: 'DRAFT' } }),
    ]);

    // Communiqués récents
    const recentCommuniques = await this.prisma.communique.findMany({
      where: institutionId ? { institutionId } : { createdById: userId },
      select: { id: true, title: true, status: true, publishedAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Salles AGORA
    const agoraWhere = institutionId ? { institutionId } : {};
    const [totalRooms, roomsLive, roomsScheduled] = await Promise.all([
      this.prisma.agoraRoom.count({ where: agoraWhere }),
      this.prisma.agoraRoom.count({ where: { ...agoraWhere, status: 'LIVE' } }),
      this.prisma.agoraRoom.count({ where: { ...agoraWhere, status: 'SCHEDULED' } }),
    ]);

    const upcomingRooms = await this.prisma.agoraRoom.findMany({
      where: { ...agoraWhere, status: { in: ['SCHEDULED', 'LIVE'] } },
      select: { id: true, title: true, roomType: true, status: true, scheduledAt: true, _count: { select: { participants: true } } },
      orderBy: { scheduledAt: 'asc' },
      take: 3,
    });

    // FCM
    const fcmWhere = institutionId ? { institutionId } : {};
    const fcmPools = await this.prisma.fcmPool.findMany({
      where: fcmWhere,
      select: { totalFunded: true, totalSpent: true, totalCommission: true, status: true },
    });
    const fcmTotalFunded = fcmPools.reduce((s, p) => s + p.totalFunded, 0);
    const fcmTotalSpent = fcmPools.reduce((s, p) => s + p.totalSpent, 0);
    const fcmActivePools = fcmPools.filter(p => p.status === 'ACTIVE').length;

    // Journalistes ciblés (via communiqué targets)
    const totalTargets = await this.prisma.communiqueTarget.count({
      where: { communique: institutionId ? { institutionId } : { createdById: userId } },
    });

    // Portée estimée (simplifié)
    const distributions = await this.prisma.communiqueDistribution.findMany({
      where: { communique: institutionId ? { institutionId } : { createdById: userId } },
      select: { recipientCount: true },
    });
    const totalReach = distributions.reduce((s, d) => s + d.recipientCount, 0);

    // Activité récente
    const recentActivity: any[] = [];
    recentCommuniques.forEach(c => {
      recentActivity.push({
        type: c.status === 'SENT' ? 'communique_sent' : 'communique_draft',
        title: c.title,
        description: c.status === 'SENT' ? 'Diffusé aux médias ciblés' : 'Brouillon en cours',
        date: c.publishedAt || c.createdAt,
        status: c.status === 'SENT' ? 'success' : 'neutral',
      });
    });
    upcomingRooms.forEach(r => {
      recentActivity.push({
        type: 'agora_scheduled',
        title: `Salle AGORA — ${r.title}`,
        description: `${r.roomType} — ${r._count.participants} invité(s)`,
        date: r.scheduledAt,
        status: r.status === 'LIVE' ? 'live' : 'info',
      });
    });
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      institution: institution ? { id: institution.id, name: institution.name, logoUrl: institution.logoUrl } : null,
      kpis: {
        communiques: { total: totalCommuniques, sent: communiquesSent, draft: communiquesDraft },
        agora: { total: totalRooms, live: roomsLive, scheduled: roomsScheduled },
        fcm: { totalFunded: fcmTotalFunded, totalSpent: fcmTotalSpent, activePools: fcmActivePools, remaining: fcmTotalFunded - fcmTotalSpent },
        reach: { totalJournalists: totalTargets, estimatedReach: totalReach * 8500 }, // Estimé x8500 audience moyenne
      },
      recentActivity: recentActivity.slice(0, 8),
      upcomingRooms,
    };
  }

  async create(data: any) { throw new Error('Not implemented'); }
  async findAll(query: any) { throw new Error('Not implemented'); }
  async findOne(id: string) { throw new Error('Not implemented'); }
  async update(id: string, data: any) { throw new Error('Not implemented'); }
  async delete(id: string) { throw new Error('Not implemented'); }
  async getUsers(institutionId: string) { throw new Error('Not implemented'); }
  async addUser(institutionId: string, userId: string, role: string) { throw new Error('Not implemented'); }
  async removeUser(institutionId: string, userId: string) { throw new Error('Not implemented'); }
  async getSubscription(institutionId: string) { throw new Error('Not implemented'); }
  async updateSubscription(institutionId: string, plan: string) { throw new Error('Not implemented'); }
}
