import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminUsageService {
  constructor(private readonly prisma: PrismaService) {}

  async trackEvent(data: any) {
    throw new Error('Not implemented');
  }

  async getClientUsage(clientId: string, query: any) {
    throw new Error('Not implemented');
  }

  async getClientHealthScore(clientId: string) {
    throw new Error('Not implemented');
  }

  async getAtRiskClients(query: any) {
    throw new Error('Not implemented');
  }

  async getTopUsers(query: any) {
    throw new Error('Not implemented');
  }

  async getUpsellOpportunities(query: any) {
    throw new Error('Not implemented');
  }

  async getCohortRetention(query: any) {
    throw new Error('Not implemented');
  }
}
