import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class JournalistsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    throw new Error('Not implemented');
  }

  async updateProfile(userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async getDevices(userId: string) {
    throw new Error('Not implemented');
  }

  async registerDevice(userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async removeDevice(userId: string, deviceId: string) {
    throw new Error('Not implemented');
  }

  async getMobileMoney(userId: string) {
    throw new Error('Not implemented');
  }

  async updateMobileMoney(userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async getAccreditations(userId: string) {
    throw new Error('Not implemented');
  }

  async getEarnings(userId: string, query: any) {
    throw new Error('Not implemented');
  }
}
