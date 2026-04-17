import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class CitizenService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Subscribers ───────────────────────────────────────

  async listSubscribers(institutionId: string, query: { page?: number; limit?: number; commune?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = { institutionId, active: true };
    if (query.commune) where.commune = query.commune;

    const [data, total] = await Promise.all([
      this.prisma.citizenSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.citizenSubscriber.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async importSubscribers(institutionId: string, subscribers: { phone: string; commune?: string; quartier?: string; channel?: string }[]) {
    const created = await this.prisma.citizenSubscriber.createMany({
      data: subscribers.map((s) => ({
        institutionId,
        phone: s.phone,
        commune: s.commune || null,
        quartier: s.quartier || null,
        channel: s.channel || 'sms',
        consentDate: new Date(),
      })),
      skipDuplicates: true,
    });

    return { imported: created.count };
  }

  async deleteSubscriber(id: string) {
    const sub = await this.prisma.citizenSubscriber.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException('Abonne introuvable');
    await this.prisma.citizenSubscriber.update({ where: { id }, data: { active: false } });
    return { success: true };
  }

  // ── Messages ──────────────────────────────────────────

  async createMessage(institutionId: string, data: {
    title: string;
    content: string;
    messageType: string;
    channels: string[];
    targetCommunes: string[];
  }) {
    // Count recipients
    const where: any = { institutionId, active: true };
    if (data.targetCommunes.length > 0) {
      where.commune = { in: data.targetCommunes };
    }
    if (data.channels.length > 0 && !data.channels.includes('both')) {
      where.OR = [
        { channel: { in: data.channels } },
        { channel: 'both' },
      ];
    }
    const recipientCount = await this.prisma.citizenSubscriber.count({ where });

    const message = await this.prisma.citizenMessage.create({
      data: {
        institutionId,
        title: data.title,
        content: data.content,
        messageType: data.messageType,
        channels: data.channels,
        targetCommunes: data.targetCommunes,
        recipientCount,
        sentAt: new Date(),
      },
    });

    // TODO: Actual SMS/WhatsApp sending via provider
    console.log(`[CITIZEN] Message "${data.title}" envoye a ${recipientCount} destinataires`);

    return message;
  }

  async listMessages(institutionId: string, query: { page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const [data, total] = await Promise.all([
      this.prisma.citizenMessage.findMany({
        where: { institutionId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.citizenMessage.count({ where: { institutionId } }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getMessageStats(id: string) {
    const message = await this.prisma.citizenMessage.findUnique({ where: { id } });
    if (!message) throw new NotFoundException('Message introuvable');
    return {
      id: message.id,
      title: message.title,
      recipientCount: message.recipientCount,
      channels: message.channels,
      targetCommunes: message.targetCommunes,
      sentAt: message.sentAt,
    };
  }
}
