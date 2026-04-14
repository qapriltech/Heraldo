import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AgendaService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveClientId(userId: string): Promise<string> {
    const iu = await this.prisma.institutionUser.findFirst({
      where: { userId },
      select: { institutionId: true },
    });
    if (!iu) throw new BadRequestException('User has no institution');
    return iu.institutionId;
  }

  async listItems(userId: string, query: any) {
    const clientId = await this.resolveClientId(userId);
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const where: any = { clientId };
    if (query.status) where.status = query.status;
    if (query.eventType) where.eventType = query.eventType;
    if (query.priority) where.priority = query.priority;
    if (query.from || query.to) {
      where.eventDate = {};
      if (query.from) where.eventDate.gte = new Date(query.from);
      if (query.to) where.eventDate.lte = new Date(query.to);
    }

    const [data, total] = await Promise.all([
      this.prisma.agendaItem.findMany({
        where,
        orderBy: { eventDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.agendaItem.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async createItem(userId: string, data: any) {
    const clientId = await this.resolveClientId(userId);

    if (!data.title || !data.eventDate || !data.eventType) {
      throw new BadRequestException('title, eventDate and eventType are required');
    }

    return this.prisma.agendaItem.create({
      data: {
        clientId,
        title: data.title,
        description: data.description ?? null,
        eventDate: new Date(data.eventDate),
        eventEndDate: data.eventEndDate ? new Date(data.eventEndDate) : null,
        eventType: data.eventType,
        status: data.status ?? 'planned',
        priority: data.priority ?? 'MEDIUM',
        tags: data.tags ?? [],
        linkedCommuniqueIds: data.linkedCommuniqueIds ?? [],
        linkedAgoraRoomIds: data.linkedAgoraRoomIds ?? [],
        linkedSocialPostIds: data.linkedSocialPostIds ?? [],
        checklist: data.checklist ?? null,
        assigneeUserId: data.assigneeUserId ?? null,
        reminder1dBefore: data.reminder1dBefore ?? true,
        reminder1hBefore: data.reminder1hBefore ?? true,
        createdBy: userId,
      },
    });
  }

  async getItem(itemId: string) {
    const item = await this.prisma.agendaItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Agenda item not found');
    return item;
  }

  async updateItem(itemId: string, data: any) {
    const item = await this.prisma.agendaItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Agenda item not found');

    return this.prisma.agendaItem.update({
      where: { id: itemId },
      data: {
        title: data.title ?? undefined,
        description: data.description ?? undefined,
        eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
        eventEndDate: data.eventEndDate ? new Date(data.eventEndDate) : undefined,
        eventType: data.eventType ?? undefined,
        status: data.status ?? undefined,
        priority: data.priority ?? undefined,
        tags: data.tags ?? undefined,
        checklist: data.checklist ?? undefined,
        assigneeUserId: data.assigneeUserId ?? undefined,
        reminder1dBefore: data.reminder1dBefore ?? undefined,
        reminder1hBefore: data.reminder1hBefore ?? undefined,
      },
    });
  }

  async deleteItem(itemId: string) {
    const item = await this.prisma.agendaItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Agenda item not found');

    return this.prisma.agendaItem.delete({ where: { id: itemId } });
  }

  async linkEntity(itemId: string, type: string) {
    // type is expected as "communique:<id>" | "agoraRoom:<id>" | "socialPost:<id>"
    const item = await this.prisma.agendaItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Agenda item not found');

    const [entityType, entityId] = type.split(':');
    if (!entityId) throw new BadRequestException('Format must be entityType:entityId');

    const fieldMap: Record<string, string> = {
      communique: 'linkedCommuniqueIds',
      agoraRoom: 'linkedAgoraRoomIds',
      socialPost: 'linkedSocialPostIds',
    };
    const field = fieldMap[entityType];
    if (!field) throw new BadRequestException('Unknown entity type');

    const current = (item as any)[field] as string[];
    if (current.includes(entityId)) return item;

    return this.prisma.agendaItem.update({
      where: { id: itemId },
      data: { [field]: [...current, entityId] },
    });
  }

  async unlinkEntity(itemId: string, type: string, id: string) {
    const item = await this.prisma.agendaItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Agenda item not found');

    const fieldMap: Record<string, string> = {
      communique: 'linkedCommuniqueIds',
      agoraRoom: 'linkedAgoraRoomIds',
      socialPost: 'linkedSocialPostIds',
    };
    const field = fieldMap[type];
    if (!field) throw new BadRequestException('Unknown entity type');

    const current = (item as any)[field] as string[];
    return this.prisma.agendaItem.update({
      where: { id: itemId },
      data: { [field]: current.filter((v: string) => v !== id) },
    });
  }

  async getCalendar(year: string, month: string) {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
      throw new BadRequestException('Invalid year or month');
    }

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59, 999);

    const items = await this.prisma.agendaItem.findMany({
      where: {
        eventDate: { gte: startDate, lte: endDate },
      },
      orderBy: { eventDate: 'asc' },
    });

    // Group by day
    const calendar: Record<string, typeof items> = {};
    for (const item of items) {
      const dayKey = item.eventDate.toISOString().slice(0, 10);
      if (!calendar[dayKey]) calendar[dayKey] = [];
      calendar[dayKey].push(item);
    }

    return { year: y, month: m, days: calendar };
  }

  async getRecurringSuggestions(_userId: string) {
    // Static list of Cote d'Ivoire national holidays and recurring events
    return [
      { date: '01-01', title: 'Jour de l\'An', type: 'RECURRING', description: 'Nouvel an' },
      { date: '01-20', title: 'Journee nationale de la paix', type: 'RECURRING', description: 'Journee de la paix en CI' },
      { date: '03-08', title: 'Journee internationale des droits des femmes', type: 'RECURRING', description: 'Droits des femmes' },
      { date: '05-01', title: 'Fete du Travail', type: 'RECURRING', description: 'Fete du travail' },
      { date: '05-29', title: 'Ascension', type: 'RECURRING', description: 'Jeudi de l\'Ascension (variable)' },
      { date: '06-09', title: 'Lundi de Pentecote', type: 'RECURRING', description: 'Pentecote (variable)' },
      { date: '08-07', title: 'Fete de l\'Independance', type: 'RECURRING', description: 'Independance de la Cote d\'Ivoire' },
      { date: '08-15', title: 'Assomption', type: 'RECURRING', description: 'Fete de l\'Assomption' },
      { date: '11-01', title: 'Toussaint', type: 'RECURRING', description: 'Fete de la Toussaint' },
      { date: '11-15', title: 'Journee nationale de la paix (commem.)', type: 'RECURRING', description: 'Commemoration de la paix' },
      { date: '12-25', title: 'Noel', type: 'RECURRING', description: 'Fete de Noel' },
      { date: 'variable', title: 'Aid el-Fitr (fin du Ramadan)', type: 'RECURRING', description: 'Fete musulmane, date variable' },
      { date: 'variable', title: 'Aid el-Kebir (Tabaski)', type: 'RECURRING', description: 'Fete musulmane, date variable' },
      { date: 'variable', title: 'Maoulid (Naissance du Prophete)', type: 'RECURRING', description: 'Fete musulmane, date variable' },
      { date: 'variable', title: 'Lundi de Paques', type: 'RECURRING', description: 'Fete chretienne, date variable' },
    ];
  }

  async toggleChecklistItem(itemId: string, taskIdx: number) {
    const item = await this.prisma.agendaItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Agenda item not found');
    if (!item.checklist || !Array.isArray(item.checklist)) {
      throw new BadRequestException('No checklist on this item');
    }

    const checklist = item.checklist as Array<{ task: string; done: boolean; [k: string]: any }>;
    if (taskIdx < 0 || taskIdx >= checklist.length) {
      throw new BadRequestException('Invalid task index');
    }

    checklist[taskIdx].done = !checklist[taskIdx].done;

    return this.prisma.agendaItem.update({
      where: { id: itemId },
      data: { checklist },
    });
  }
}
