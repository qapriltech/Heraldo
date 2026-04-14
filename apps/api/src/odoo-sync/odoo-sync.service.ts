import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class OdooSyncService {
  constructor(private readonly prisma: PrismaService) {}

  async handleWebhook(payload: any) {
    throw new Error('Not implemented');
  }

  async getStatus() {
    throw new Error('Not implemented');
  }

  async resync(entityType: string, entityId: string) {
    throw new Error('Not implemented');
  }

  async getQueue(query: any) {
    throw new Error('Not implemented');
  }

  async getErrors(query: any) {
    throw new Error('Not implemented');
  }
}
