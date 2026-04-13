import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async sendPush(userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async sendEmail(to: string, subject: string, body: string) {
    throw new Error('Not implemented');
  }

  async sendSms(phone: string, message: string) {
    throw new Error('Not implemented');
  }

  async sendBulk(userIds: string[], data: any) {
    throw new Error('Not implemented');
  }

  async getUserNotifications(userId: string, query: any) {
    throw new Error('Not implemented');
  }

  async markAsRead(notificationId: string) {
    throw new Error('Not implemented');
  }

  async markAllAsRead(userId: string) {
    throw new Error('Not implemented');
  }

  async getUnreadCount(userId: string) {
    throw new Error('Not implemented');
  }
}
