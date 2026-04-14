import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminAlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any) {
    throw new Error('Not implemented');
  }

  async acknowledge(id: string) {
    throw new Error('Not implemented');
  }

  async resolve(id: string, notes?: string) {
    throw new Error('Not implemented');
  }

  async getStats() {
    throw new Error('Not implemented');
  }
}
