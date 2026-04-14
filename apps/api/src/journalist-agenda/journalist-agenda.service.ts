import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class JournalistAgendaService {
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

  async getItems(userId: string, query: any) {
    const journalist = await this.findJournalist(userId);
    const { page = 1, limit = 20, status, eventType, from, to } = query;
    const skip = (page - 1) * limit;

    const where: any = { journalistId: journalist.id };
    if (status) where.status = status;
    if (eventType) where.eventType = eventType;
    if (from || to) {
      where.startsAt = {};
      if (from) where.startsAt.gte = new Date(from);
      if (to) where.startsAt.lte = new Date(to);
    }

    const [items, total] = await Promise.all([
      this.prisma.journalistAgendaItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startsAt: 'asc' },
      }),
      this.prisma.journalistAgendaItem.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createItem(userId: string, data: any) {
    const journalist = await this.findJournalist(userId);

    return this.prisma.journalistAgendaItem.create({
      data: {
        journalistId: journalist.id,
        title: data.title,
        description: data.description,
        eventType: data.eventType,
        location: data.location,
        startsAt: new Date(data.startsAt),
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        allDay: data.allDay ?? false,
        linkedAgoraRoomId: data.linkedAgoraRoomId,
        reminderMinutesBefore: data.reminderMinutesBefore ?? [],
        notes: data.notes,
        status: data.status ?? 'SCHEDULED',
        color: data.color,
      },
    });
  }

  async updateItem(userId: string, itemId: string, data: any) {
    const journalist = await this.findJournalist(userId);

    const item = await this.prisma.journalistAgendaItem.findFirst({
      where: { id: itemId, journalistId: journalist.id },
    });
    if (!item) {
      throw new NotFoundException('Agenda item not found');
    }

    return this.prisma.journalistAgendaItem.update({
      where: { id: itemId },
      data: {
        title: data.title,
        description: data.description,
        eventType: data.eventType,
        location: data.location,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
        allDay: data.allDay,
        linkedAgoraRoomId: data.linkedAgoraRoomId,
        reminderMinutesBefore: data.reminderMinutesBefore,
        notes: data.notes,
        status: data.status,
        color: data.color,
      },
    });
  }

  async deleteItem(userId: string, itemId: string) {
    const journalist = await this.findJournalist(userId);

    const item = await this.prisma.journalistAgendaItem.findFirst({
      where: { id: itemId, journalistId: journalist.id },
    });
    if (!item) {
      throw new NotFoundException('Agenda item not found');
    }

    await this.prisma.journalistAgendaItem.delete({
      where: { id: itemId },
    });

    return { deleted: true };
  }

  async getToday(userId: string) {
    const journalist = await this.findJournalist(userId);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.journalistAgendaItem.findMany({
      where: {
        journalistId: journalist.id,
        startsAt: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { startsAt: 'asc' },
    });
  }

  async getUpcoming(userId: string, query: any) {
    const journalist = await this.findJournalist(userId);
    const days = query?.days ?? 7;

    const now = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);

    return this.prisma.journalistAgendaItem.findMany({
      where: {
        journalistId: journalist.id,
        startsAt: { gte: now, lte: end },
      },
      orderBy: { startsAt: 'asc' },
    });
  }

  async getIcalExport(userId: string) {
    const journalist = await this.findJournalist(userId);

    const items = await this.prisma.journalistAgendaItem.findMany({
      where: { journalistId: journalist.id },
      orderBy: { startsAt: 'asc' },
    });

    const formatDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const events = items
      .map(
        (item) =>
          `BEGIN:VEVENT\r\nUID:${item.id}@heraldo\r\nDTSTAMP:${formatDate(new Date())}\r\nDTSTART:${formatDate(item.startsAt)}\r\n${item.endsAt ? `DTEND:${formatDate(item.endsAt)}\r\n` : ''}SUMMARY:${item.title}\r\n${item.description ? `DESCRIPTION:${item.description.replace(/\n/g, '\\n')}\r\n` : ''}${item.location ? `LOCATION:${item.location}\r\n` : ''}STATUS:${item.status === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED'}\r\nEND:VEVENT`,
      )
      .join('\r\n');

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//HERALDO//Journalist Agenda//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      events,
      'END:VCALENDAR',
    ].join('\r\n');
  }
}
