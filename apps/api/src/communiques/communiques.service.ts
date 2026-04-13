import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class CommuniquesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async findAll(institutionId: string, query: any) {
    throw new Error('Not implemented');
  }

  async findOne(id: string) {
    throw new Error('Not implemented');
  }

  async update(id: string, data: any) {
    throw new Error('Not implemented');
  }

  async delete(id: string) {
    throw new Error('Not implemented');
  }

  async generateFormat(id: string, format: 'pdf' | 'html' | 'txt') {
    throw new Error('Not implemented');
  }

  async computeHash(id: string) {
    throw new Error('Not implemented');
  }

  async diffuse(id: string, channels: string[]) {
    throw new Error('Not implemented');
  }

  async getDiffusionStatus(id: string) {
    throw new Error('Not implemented');
  }
}
