import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class FcmService {
  constructor(private readonly prisma: PrismaService) {}

  async createPool(userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async findAllPools(query: any) {
    throw new Error('Not implemented');
  }

  async findPool(id: string) {
    throw new Error('Not implemented');
  }

  async fundPool(poolId: string, amount: number, paymentMethod: string) {
    throw new Error('Not implemented');
  }

  async inviteJournalists(poolId: string, journalistIds: string[]) {
    throw new Error('Not implemented');
  }

  async submitProof(poolId: string, journalistId: string, data: any) {
    throw new Error('Not implemented');
  }

  async validateProof(poolId: string, proofId: string, approved: boolean) {
    throw new Error('Not implemented');
  }

  async autoPay(poolId: string) {
    throw new Error('Not implemented');
  }

  async getPoolStats(poolId: string) {
    throw new Error('Not implemented');
  }
}
