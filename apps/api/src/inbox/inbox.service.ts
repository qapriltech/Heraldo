import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class InboxService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveClientId(userId: string): Promise<string> {
    const iu = await this.prisma.institutionUser.findFirst({
      where: { userId },
      select: { institutionId: true },
    });
    if (!iu) throw new BadRequestException('User has no institution');
    return iu.institutionId;
  }

  async listChannels(userId: string) {
    const clientId = await this.resolveClientId(userId);
    return this.prisma.inboxChannel.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async connectChannel(userId: string, type: string, data: any) {
    const clientId = await this.resolveClientId(userId);

    if (!data.channelIdentifier) {
      throw new BadRequestException('channelIdentifier is required');
    }

    return this.prisma.inboxChannel.create({
      data: {
        clientId,
        channelType: type as any,
        channelIdentifier: data.channelIdentifier,
        accessTokenEncrypted: data.accessToken ?? null,
        refreshTokenEncrypted: data.refreshToken ?? null,
        webhookSecret: data.webhookSecret ?? null,
        status: 'active',
      },
    });
  }

  async disconnectChannel(id: string) {
    const channel = await this.prisma.inboxChannel.findUnique({
      where: { id },
    });
    if (!channel) throw new NotFoundException('Channel not found');

    return this.prisma.inboxChannel.update({
      where: { id },
      data: { status: 'disconnected' },
    });
  }

  async listMessages(userId: string, query: any) {
    const clientId = await this.resolveClientId(userId);
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const where: any = { clientId };
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.category) where.category = query.category;
    if (query.channelId) where.channelId = query.channelId;
    if (query.search) {
      where.OR = [
        { subject: { contains: query.search, mode: 'insensitive' } },
        { fromName: { contains: query.search, mode: 'insensitive' } },
        { bodyText: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.inboxMessage.findMany({
        where,
        orderBy: { receivedAt: 'desc' },
        skip,
        take: limit,
        include: { channel: true },
      }),
      this.prisma.inboxMessage.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getMessage(id: string) {
    const message = await this.prisma.inboxMessage.findUnique({
      where: { id },
      include: { channel: true },
    });
    if (!message) throw new NotFoundException('Message not found');

    // Auto-mark as READ if UNREAD
    if (message.status === 'UNREAD') {
      await this.prisma.inboxMessage.update({
        where: { id },
        data: { status: 'READ' },
      });
      message.status = 'READ' as any;
    }

    return message;
  }

  async updateMessage(id: string, data: any) {
    const message = await this.prisma.inboxMessage.findUnique({
      where: { id },
    });
    if (!message) throw new NotFoundException('Message not found');

    return this.prisma.inboxMessage.update({
      where: { id },
      data: {
        status: data.status ?? undefined,
        priority: data.priority ?? undefined,
        assignedToUserId: data.assignedToUserId ?? undefined,
        category: data.category ?? undefined,
        internalNote: data.internalNote ?? undefined,
        tags: data.tags ?? undefined,
      },
    });
  }

  async replyToMessage(id: string, userId: string, body: any) {
    const message = await this.prisma.inboxMessage.findUnique({
      where: { id },
      include: { channel: true },
    });
    if (!message) throw new NotFoundException('Message not found');
    if (!body.bodyText) throw new BadRequestException('bodyText is required');

    // Create a response record in the same thread
    const reply = await this.prisma.inboxMessage.create({
      data: {
        clientId: message.clientId,
        channelId: message.channelId,
        threadId: message.threadId || message.id,
        fromName: 'Institution', // will be enriched from user profile in production
        fromAddress: message.channel.channelIdentifier,
        subject: message.subject ? `Re: ${message.subject}` : null,
        bodyText: body.bodyText,
        bodyHtml: body.bodyHtml ?? null,
        receivedAt: new Date(),
        status: 'REPLIED',
        priority: message.priority,
        category: message.category,
      },
    });

    // Mark the original as REPLIED
    await this.prisma.inboxMessage.update({
      where: { id },
      data: { status: 'REPLIED', repliedAt: new Date() },
    });

    return reply;
  }

  async archiveMessage(id: string) {
    const message = await this.prisma.inboxMessage.findUnique({
      where: { id },
    });
    if (!message) throw new NotFoundException('Message not found');

    return this.prisma.inboxMessage.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }

  async getStats(userId: string) {
    const clientId = await this.resolveClientId(userId);

    const [byStatus, byPriority, total] = await Promise.all([
      this.prisma.inboxMessage.groupBy({
        by: ['status'],
        where: { clientId },
        _count: { id: true },
      }),
      this.prisma.inboxMessage.groupBy({
        by: ['priority'],
        where: { clientId },
        _count: { id: true },
      }),
      this.prisma.inboxMessage.count({ where: { clientId } }),
    ]);

    return {
      total,
      byStatus: Object.fromEntries(
        byStatus.map((s) => [s.status, s._count.id]),
      ),
      byPriority: Object.fromEntries(
        byPriority.map((p) => [p.priority, p._count.id]),
      ),
    };
  }

  async handleWhatsappWebhook(body: any) {
    // Minimal webhook handler: create an InboxMessage from incoming WhatsApp payload
    if (!body.clientId || !body.channelId || !body.from || !body.text) {
      throw new BadRequestException('Invalid WhatsApp webhook payload');
    }

    return this.prisma.inboxMessage.create({
      data: {
        clientId: body.clientId,
        channelId: body.channelId,
        externalId: body.messageId ?? null,
        threadId: body.threadId ?? null,
        fromName: body.fromName || body.from,
        fromAddress: body.from,
        bodyText: body.text,
        receivedAt: new Date(),
        status: 'UNREAD',
        priority: 'MEDIUM',
      },
    });
  }

  async handleGmailWebhook(body: any) {
    // Minimal webhook handler: create an InboxMessage from Gmail push notification
    if (!body.clientId || !body.channelId || !body.from || !body.bodyText) {
      throw new BadRequestException('Invalid Gmail webhook payload');
    }

    return this.prisma.inboxMessage.create({
      data: {
        clientId: body.clientId,
        channelId: body.channelId,
        externalId: body.messageId ?? null,
        threadId: body.threadId ?? null,
        fromName: body.fromName || body.from,
        fromAddress: body.from,
        subject: body.subject ?? null,
        bodyText: body.bodyText,
        bodyHtml: body.bodyHtml ?? null,
        attachments: body.attachments ?? null,
        receivedAt: new Date(),
        status: 'UNREAD',
        priority: 'MEDIUM',
      },
    });
  }
}
