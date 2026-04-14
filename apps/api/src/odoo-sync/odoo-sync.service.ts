import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class OdooSyncService {
  constructor(private readonly prisma: PrismaService) {}

  async handleWebhook(payload: any) {
    if (!payload.entityType || !payload.entityId || !payload.action) {
      throw new BadRequestException(
        'entityType, entityId and action are required',
      );
    }

    // Create an inbound sync job
    const job = await this.prisma.odooSyncJob.create({
      data: {
        entityType: payload.entityType,
        entityId: payload.entityId,
        direction: 'inbound',
        action: payload.action,
        payload: payload.data ?? {},
        status: 'processing',
      },
    });

    try {
      // Process based on action type
      switch (payload.action) {
        case 'payment_received': {
          await this.prisma.subscription.updateMany({
            where: {
              OR: [
                { id: payload.entityId },
                { odooInvoiceId: payload.entityId },
              ],
            },
            data: {
              paymentStatus: 'paid',
              paymentReceivedAt: new Date(),
              paymentMethod: payload.data?.paymentMethod ?? null,
            },
          });
          break;
        }

        case 'invoice_overdue': {
          // Find the subscription and suspend it
          const subscriptions = await this.prisma.subscription.findMany({
            where: {
              OR: [
                { id: payload.entityId },
                { odooInvoiceId: payload.entityId },
              ],
            },
          });

          for (const sub of subscriptions) {
            await this.prisma.subscription.update({
              where: { id: sub.id },
              data: {
                paymentStatus: 'overdue',
                active: false,
                suspendedAt: new Date(),
                suspensionReason: 'Invoice overdue — automatic suspension',
              },
            });

            await this.prisma.subscriptionHistory.create({
              data: {
                subscriptionId: sub.id,
                eventType: 'SUSPENDED',
                fromStatus: 'active',
                toStatus: 'suspended',
                triggeredBy: 'odoo_webhook',
                details: {
                  reason: 'invoice_overdue',
                  odooRef: payload.entityId,
                },
              },
            });
          }
          break;
        }

        default:
          // Unknown action — mark job as completed anyway
          break;
      }

      // Mark job as completed
      await this.prisma.odooSyncJob.update({
        where: { id: job.id },
        data: { status: 'completed', completedAt: new Date() },
      });

      return { jobId: job.id, status: 'completed' };
    } catch (error) {
      // Mark job as failed
      await this.prisma.odooSyncJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          lastError: error instanceof Error ? error.message : String(error),
          attempts: { increment: 1 },
        },
      });

      throw error;
    }
  }

  async getStatus() {
    const [lastSuccess, errorCount, pendingCount] = await Promise.all([
      this.prisma.odooSyncJob.findFirst({
        where: { status: 'completed' },
        orderBy: { completedAt: 'desc' },
      }),
      this.prisma.odooSyncJob.count({ where: { status: 'failed' } }),
      this.prisma.odooSyncJob.count({ where: { status: 'pending' } }),
    ]);

    return {
      lastSuccessfulSync: lastSuccess?.completedAt ?? null,
      lastSyncJobId: lastSuccess?.id ?? null,
      errorCount,
      pendingCount,
    };
  }

  async resync(entityType: string, entityId: string) {
    if (!entityType || !entityId) {
      throw new BadRequestException('entityType and entityId are required');
    }

    return this.prisma.odooSyncJob.create({
      data: {
        entityType,
        entityId,
        direction: 'outbound',
        action: 'resync',
        payload: {},
        status: 'pending',
      },
    });
  }

  async getQueue(query: any) {
    const page = parseInt(query?.page, 10) || 1;
    const limit = parseInt(query?.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const where = { status: 'pending' };

    const [data, total] = await Promise.all([
      this.prisma.odooSyncJob.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.odooSyncJob.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getErrors(query: any) {
    const page = parseInt(query?.page, 10) || 1;
    const limit = parseInt(query?.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const where = { status: 'failed' };

    const [data, total] = await Promise.all([
      this.prisma.odooSyncJob.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.odooSyncJob.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
