import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminAccreditationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listRequests(query: any) {
    throw new Error('Not implemented');
  }

  async getRequest(id: string) {
    throw new Error('Not implemented');
  }

  async approveRequest(id: string, reviewedBy: string) {
    throw new Error('Not implemented');
  }

  async rejectRequest(id: string, reason: string, reviewedBy: string) {
    throw new Error('Not implemented');
  }

  async holdRequest(id: string, notes: string, reviewedBy: string) {
    throw new Error('Not implemented');
  }

  async revokeAccreditation(journalistId: string, data: any) {
    throw new Error('Not implemented');
  }

  async getStats() {
    throw new Error('Not implemented');
  }

  async submitPublicRequest(data: any) {
    throw new Error('Not implemented');
  }
}
