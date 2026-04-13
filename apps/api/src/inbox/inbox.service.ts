import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class InboxService {
  constructor(private readonly prisma: PrismaService) {}

  async listChannels(userId: string) {
    throw new Error('Not implemented');
  }

  async connectChannel(userId: string, type: string, data: any) {
    throw new Error('Not implemented');
  }

  async disconnectChannel(id: string) {
    throw new Error('Not implemented');
  }

  async listMessages(userId: string, query: any) {
    throw new Error('Not implemented');
  }

  async getMessage(id: string) {
    throw new Error('Not implemented');
  }

  async updateMessage(id: string, data: any) {
    throw new Error('Not implemented');
  }

  async replyToMessage(id: string, userId: string, body: any) {
    throw new Error('Not implemented');
  }

  async archiveMessage(id: string) {
    throw new Error('Not implemented');
  }

  async getStats(userId: string) {
    throw new Error('Not implemented');
  }

  async handleWhatsappWebhook(body: any) {
    throw new Error('Not implemented');
  }

  async handleGmailWebhook(body: any) {
    throw new Error('Not implemented');
  }
}
