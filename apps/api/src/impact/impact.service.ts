import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ImpactService {
  constructor(private readonly prisma: PrismaService) {}

  async generateReport(institutionId: string, data: any) {
    throw new Error('Not implemented');
  }

  async findAllReports(institutionId: string, query: any) {
    throw new Error('Not implemented');
  }

  async findReport(id: string) {
    throw new Error('Not implemented');
  }

  async calculateReach(communiqueId: string) {
    throw new Error('Not implemented');
  }

  async getDashboard(institutionId: string) {
    throw new Error('Not implemented');
  }

  async getMediaCoverage(institutionId: string, period: string) {
    throw new Error('Not implemented');
  }

  async exportReport(id: string, format: string) {
    throw new Error('Not implemented');
  }
}
