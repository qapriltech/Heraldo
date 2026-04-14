import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class JournalistNotificationsService {
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

  async getNotifications(userId: string, query: any) {
    const journalist = await this.findJournalist(userId);
    const { page = 1, limit = 20, status, type, priority } = query;
    const skip = (page - 1) * limit;

    const where: any = { journalistId: journalist.id };
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    const [items, total] = await Promise.all([
      this.prisma.journalistNotification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.journalistNotification.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUnreadCount(userId: string) {
    const journalist = await this.findJournalist(userId);

    const count = await this.prisma.journalistNotification.count({
      where: { journalistId: journalist.id, status: 'UNREAD' },
    });

    return { count };
  }

  async markAsRead(userId: string, notificationId: string) {
    const journalist = await this.findJournalist(userId);

    const notification = await this.prisma.journalistNotification.findFirst({
      where: { id: notificationId, journalistId: journalist.id },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.journalistNotification.update({
      where: { id: notificationId },
      data: { status: 'READ', readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    const journalist = await this.findJournalist(userId);

    const result = await this.prisma.journalistNotification.updateMany({
      where: { journalistId: journalist.id, status: 'UNREAD' },
      data: { status: 'READ', readAt: new Date() },
    });

    return { updated: result.count };
  }

  async archive(userId: string, notificationId: string) {
    const journalist = await this.findJournalist(userId);

    const notification = await this.prisma.journalistNotification.findFirst({
      where: { id: notificationId, journalistId: journalist.id },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.journalistNotification.update({
      where: { id: notificationId },
      data: { status: 'ARCHIVED' },
    });
  }

  async getPreferences(userId: string) {
    const journalist = await this.findJournalist(userId);

    const prefs =
      await this.prisma.journalistNotificationPreference.findUnique({
        where: { journalistId: journalist.id },
      });

    if (!prefs) {
      // Return defaults if no preferences set yet
      return {
        journalistId: journalist.id,
        preferences: {},
        doNotDisturbStart: null,
        doNotDisturbEnd: null,
        urgentOverrideDnd: true,
      };
    }

    return prefs;
  }

  async updatePreferences(userId: string, data: any) {
    const journalist = await this.findJournalist(userId);

    return this.prisma.journalistNotificationPreference.upsert({
      where: { journalistId: journalist.id },
      update: {
        preferences: data.preferences,
        doNotDisturbStart: data.doNotDisturbStart,
        doNotDisturbEnd: data.doNotDisturbEnd,
        urgentOverrideDnd: data.urgentOverrideDnd,
      },
      create: {
        journalistId: journalist.id,
        preferences: data.preferences ?? {},
        doNotDisturbStart: data.doNotDisturbStart,
        doNotDisturbEnd: data.doNotDisturbEnd,
        urgentOverrideDnd: data.urgentOverrideDnd ?? true,
      },
    });
  }
}
