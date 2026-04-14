import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveClientId(userId: string): Promise<string> {
    const iu = await this.prisma.institutionUser.findFirst({
      where: { userId },
      select: { institutionId: true },
    });
    if (!iu) throw new BadRequestException('User has no institution');
    return iu.institutionId;
  }

  async getJournalist(id: string) {
    const journalist = await this.prisma.journalist.findUnique({
      where: { id },
      include: {
        user: { select: { fullName: true, email: true, avatarUrl: true } },
        mediaOrganization: true,
      },
    });
    if (!journalist) throw new NotFoundException('Journalist not found');

    // Enrich with interaction count, last interaction, and score
    const [interactionsCount, lastInteraction, score] = await Promise.all([
      this.prisma.crmInteraction.count({
        where: { journalistId: id },
      }),
      this.prisma.crmInteraction.findFirst({
        where: { journalistId: id },
        orderBy: { occurredAt: 'desc' },
        select: { occurredAt: true, interactionType: true, subject: true },
      }),
      this.prisma.crmJournalistScore.findFirst({
        where: { journalistId: id },
      }),
    ]);

    return {
      ...journalist,
      interactionsCount,
      lastInteraction,
      score,
    };
  }

  async getJournalistTimeline(id: string, query: any) {
    const journalist = await this.prisma.journalist.findUnique({
      where: { id },
    });
    if (!journalist) throw new NotFoundException('Journalist not found');

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const where: any = { journalistId: id };
    if (query.type) where.interactionType = query.type;
    if (query.direction) where.direction = query.direction;

    const [data, total] = await Promise.all([
      this.prisma.crmInteraction.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.crmInteraction.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async addInteraction(id: string, userId: string, data: any) {
    const clientId = await this.resolveClientId(userId);

    const journalist = await this.prisma.journalist.findUnique({
      where: { id },
    });
    if (!journalist) throw new NotFoundException('Journalist not found');

    if (!data.interactionType || !data.direction) {
      throw new BadRequestException('interactionType and direction are required');
    }

    const interaction = await this.prisma.crmInteraction.create({
      data: {
        clientId,
        journalistId: id,
        userId,
        interactionType: data.interactionType,
        direction: data.direction,
        subject: data.subject ?? null,
        contentPreview: data.contentPreview ?? null,
        linkedEntityType: data.linkedEntityType ?? null,
        linkedEntityId: data.linkedEntityId ?? null,
        occurredAt: data.occurredAt ? new Date(data.occurredAt) : new Date(),
      },
    });

    // Update the journalist score record
    await this.prisma.crmJournalistScore.upsert({
      where: {
        clientId_journalistId: { clientId, journalistId: id },
      },
      create: {
        clientId,
        journalistId: id,
        interactionsLast90d: 1,
        lastInteractionAt: new Date(),
      },
      update: {
        interactionsLast90d: { increment: 1 },
        lastInteractionAt: new Date(),
      },
    });

    return interaction;
  }

  async listNotes(journalistId: string, userId: string) {
    return this.prisma.crmPrivateNote.findMany({
      where: {
        journalistId,
        OR: [
          { userId, visibility: 'private' },
          { visibility: 'team' },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createNote(journalistId: string, userId: string, data: any) {
    if (!data.content) throw new BadRequestException('content is required');

    return this.prisma.crmPrivateNote.create({
      data: {
        userId,
        journalistId,
        content: data.content,
        visibility: data.visibility ?? 'private',
      },
    });
  }

  async updateNote(noteId: string, userId: string, data: any) {
    const note = await this.prisma.crmPrivateNote.findUnique({
      where: { id: noteId },
    });
    if (!note) throw new NotFoundException('Note not found');
    if (note.userId !== userId) {
      throw new BadRequestException('You can only edit your own notes');
    }

    return this.prisma.crmPrivateNote.update({
      where: { id: noteId },
      data: {
        content: data.content ?? undefined,
        visibility: data.visibility ?? undefined,
      },
    });
  }

  async deleteNote(noteId: string, userId: string) {
    const note = await this.prisma.crmPrivateNote.findUnique({
      where: { id: noteId },
    });
    if (!note) throw new NotFoundException('Note not found');
    if (note.userId !== userId) {
      throw new BadRequestException('You can only delete your own notes');
    }

    return this.prisma.crmPrivateNote.delete({ where: { id: noteId } });
  }

  async getUpcomingBirthdays() {
    const now = new Date();
    const in14days = new Date();
    in14days.setDate(now.getDate() + 14);

    // Extract month-day and compare. We query all journalists with birthdays set,
    // then filter in memory for the 14-day window (Prisma lacks date-part filtering).
    const journalists = await this.prisma.journalist.findMany({
      where: {
        birthday: { not: null },
      },
      include: {
        user: { select: { fullName: true, avatarUrl: true } },
        mediaOrganization: { select: { name: true } },
      },
    });

    const upcoming = journalists.filter((j) => {
      if (!j.birthday) return false;
      const bd = new Date(j.birthday);
      // Create this year's birthday
      const thisYearBd = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());
      // If it already passed, check next year
      if (thisYearBd < now) {
        thisYearBd.setFullYear(now.getFullYear() + 1);
      }
      return thisYearBd >= now && thisYearBd <= in14days;
    });

    return upcoming.map((j) => ({
      journalistId: j.id,
      fullName: j.user.fullName,
      avatarUrl: j.user.avatarUrl,
      media: j.mediaOrganization?.name ?? null,
      birthday: j.birthday,
    }));
  }

  async listJournalists(query: any) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.tier) where.tier = query.tier;
    if (query.specialty) where.specialties = { has: query.specialty };
    if (query.search) {
      where.user = {
        fullName: { contains: query.search, mode: 'insensitive' },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.journalist.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { fullName: true, email: true, avatarUrl: true } },
          mediaOrganization: { select: { name: true, type: true } },
        },
      }),
      this.prisma.journalist.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getDashboard(userId: string) {
    const clientId = await this.resolveClientId(userId);

    const [
      totalJournalists,
      interactionsThisMonth,
      byTier,
      recentInteractions,
    ] = await Promise.all([
      this.prisma.crmJournalistScore.count({ where: { clientId } }),
      this.prisma.crmInteraction.count({
        where: {
          clientId,
          occurredAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      this.prisma.crmJournalistScore.groupBy({
        by: ['relationTier'],
        where: { clientId },
        _count: { id: true },
      }),
      this.prisma.crmInteraction.findMany({
        where: { clientId },
        orderBy: { occurredAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalJournalists,
      interactionsThisMonth,
      byTier: Object.fromEntries(
        byTier.map((t) => [t.relationTier, t._count.id]),
      ),
      recentInteractions,
    };
  }
}
