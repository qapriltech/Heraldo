import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class JournalistRevenuesService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string, query: any) {
    throw new Error('Not implemented');
  }

  async getByEvent(userId: string, query: any) {
    throw new Error('Not implemented');
  }

  async getByInstitution(userId: string, query: any) {
    throw new Error('Not implemented');
  }

  async getPending(userId: string, query: any) {
    throw new Error('Not implemented');
  }

  async getChart(userId: string, query: any) {
    throw new Error('Not implemented');
  }

  async getFiscalExport(userId: string, query: any) {
    throw new Error('Not implemented');
  }
}
