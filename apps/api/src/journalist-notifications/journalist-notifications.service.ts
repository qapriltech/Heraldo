import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class JournalistNotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(userId: string, query: any) {
    throw new Error('Not implemented');
  }

  async getUnreadCount(userId: string) {
    throw new Error('Not implemented');
  }

  async markAsRead(userId: string, notificationId: string) {
    throw new Error('Not implemented');
  }

  async markAllAsRead(userId: string) {
    throw new Error('Not implemented');
  }

  async archive(userId: string, notificationId: string) {
    throw new Error('Not implemented');
  }

  async getPreferences(userId: string) {
    throw new Error('Not implemented');
  }

  async updatePreferences(userId: string, data: any) {
    throw new Error('Not implemented');
  }
}
