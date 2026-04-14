import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminSubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    const subscription = await this.prisma.subscription.create({
      data: {
        institutionId: data.institutionId,
        plan: data.plan,
        formula: data.formula,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        active: false,
        autoRenew: data.autoRenew ?? true,
        communiquesPerMonth: data.communiquesPerMonth ?? 4,
        agoraRoomsPerMonth: data.agoraRoomsPerMonth ?? 1,
        maxAgencyClients: data.maxAgencyClients ?? 0,
        paymentStatus: data.paymentStatus ?? 'pending',
        notes: data.notes,
      },
    });

    await this.prisma.subscriptionHistory.create({
      data: {
        subscriptionId: subscription.id,
        eventType: 'CREATED',
        toStatus: 'created',
        triggeredBy: data.triggeredBy,
        details: { source: 'admin' },
      },
    });

    return subscription;
  }

  async findAll(query: any) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status === 'active') where.active = true;
    else if (query.status === 'suspended') where.suspendedAt = { not: null };
    else if (query.status === 'cancelled') where.cancelledAt = { not: null };
    if (query.formula) where.formula = query.formula;
    if (query.payment_status) where.paymentStatus = query.payment_status;

    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { institution: true },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        institution: true,
        history: { orderBy: { occurredAt: 'desc' } },
      },
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription ${id} not found`);
    }
    return subscription;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.subscription.update({
      where: { id },
      data: {
        ...(data.formula !== undefined && { formula: data.formula }),
        ...(data.autoRenew !== undefined && { autoRenew: data.autoRenew }),
        ...(data.communiquesPerMonth !== undefined && {
          communiquesPerMonth: data.communiquesPerMonth,
        }),
        ...(data.agoraRoomsPerMonth !== undefined && {
          agoraRoomsPerMonth: data.agoraRoomsPerMonth,
        }),
        ...(data.maxAgencyClients !== undefined && {
          maxAgencyClients: data.maxAgencyClients,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.paymentStatus !== undefined && {
          paymentStatus: data.paymentStatus,
        }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.subscription.delete({ where: { id } });
  }

  async activate(id: string) {
    const sub = await this.findOne(id);
    if (sub.active && !sub.suspendedAt) {
      throw new BadRequestException('Subscription is already active');
    }

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: {
        active: true,
        suspendedAt: null,
        suspensionReason: null,
      },
    });

    await this.prisma.subscriptionHistory.create({
      data: {
        subscriptionId: id,
        eventType: 'ACTIVATED',
        fromStatus: sub.active ? 'active' : 'inactive',
        toStatus: 'active',
      },
    });

    return updated;
  }

  async suspend(id: string, reason?: string) {
    const sub = await this.findOne(id);
    if (!sub.active) {
      throw new BadRequestException('Subscription is not active');
    }

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: {
        active: false,
        suspendedAt: new Date(),
        suspensionReason: reason ?? null,
      },
    });

    await this.prisma.subscriptionHistory.create({
      data: {
        subscriptionId: id,
        eventType: 'SUSPENDED',
        fromStatus: 'active',
        toStatus: 'suspended',
        details: reason ? { reason } : undefined,
      },
    });

    return updated;
  }

  async reactivate(id: string) {
    const sub = await this.findOne(id);
    if (!sub.suspendedAt) {
      throw new BadRequestException('Subscription is not suspended');
    }

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: {
        active: true,
        suspendedAt: null,
        suspensionReason: null,
      },
    });

    await this.prisma.subscriptionHistory.create({
      data: {
        subscriptionId: id,
        eventType: 'REACTIVATED',
        fromStatus: 'suspended',
        toStatus: 'active',
      },
    });

    return updated;
  }

  async cancel(id: string, reason?: string) {
    const sub = await this.findOne(id);
    if (sub.cancelledAt) {
      throw new BadRequestException('Subscription is already cancelled');
    }

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: {
        active: false,
        cancelledAt: new Date(),
        cancellationReason: reason ?? null,
      },
    });

    await this.prisma.subscriptionHistory.create({
      data: {
        subscriptionId: id,
        eventType: 'CANCELLED',
        fromStatus: sub.active ? 'active' : 'suspended',
        toStatus: 'cancelled',
        details: reason ? { reason } : undefined,
      },
    });

    return updated;
  }

  async upgrade(id: string, data: any) {
    const sub = await this.findOne(id);
    if (!data.formula) {
      throw new BadRequestException('New formula is required');
    }
    const oldFormula = sub.formula;

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: {
        formula: data.formula,
        plan: data.plan ?? sub.plan,
        ...(data.communiquesPerMonth !== undefined && {
          communiquesPerMonth: data.communiquesPerMonth,
        }),
        ...(data.agoraRoomsPerMonth !== undefined && {
          agoraRoomsPerMonth: data.agoraRoomsPerMonth,
        }),
        ...(data.maxAgencyClients !== undefined && {
          maxAgencyClients: data.maxAgencyClients,
        }),
      },
    });

    await this.prisma.subscriptionHistory.create({
      data: {
        subscriptionId: id,
        eventType: 'UPGRADED',
        fromFormula: oldFormula,
        toFormula: data.formula,
        triggeredBy: data.triggeredBy,
      },
    });

    return updated;
  }

  async renew(id: string) {
    const sub = await this.findOne(id);

    const currentEnd = new Date(sub.endDate);
    const newEnd = new Date(currentEnd);
    newEnd.setFullYear(newEnd.getFullYear() + 1);

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: {
        endDate: newEnd,
        active: true,
        suspendedAt: null,
        suspensionReason: null,
        cancelledAt: null,
        cancellationReason: null,
      },
    });

    await this.prisma.subscriptionHistory.create({
      data: {
        subscriptionId: id,
        eventType: 'RENEWED',
        fromStatus: sub.active ? 'active' : 'inactive',
        toStatus: 'active',
        details: {
          previousEndDate: currentEnd.toISOString(),
          newEndDate: newEnd.toISOString(),
        },
      },
    });

    return updated;
  }

  async findExpiring(query: any) {
    const page = parseInt(query?.page, 10) || 1;
    const limit = parseInt(query?.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const now = new Date();
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

    const where = {
      active: true,
      cancelledAt: null,
      endDate: { gte: now, lte: sixtyDaysFromNow },
    };

    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { endDate: 'asc' },
        include: { institution: true },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOverdue(query: any) {
    const page = parseInt(query?.page, 10) || 1;
    const limit = parseInt(query?.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const where = { paymentStatus: 'overdue' };

    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { institution: true },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
