import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ReseauService {
  constructor(private readonly prisma: PrismaService) {}

  async searchJournalists(query: any) {
    throw new Error('Not implemented');
  }

  async getJournalistProfile(id: string) {
    throw new Error('Not implemented');
  }

  async createAccreditation(institutionId: string, journalistId: string, data: any) {
    throw new Error('Not implemented');
  }

  async listAccreditations(institutionId: string, query: any) {
    throw new Error('Not implemented');
  }

  async updateAccreditation(id: string, data: any) {
    throw new Error('Not implemented');
  }

  async revokeAccreditation(id: string) {
    throw new Error('Not implemented');
  }

  async verifyAccreditation(id: string) {
    throw new Error('Not implemented');
  }
}
