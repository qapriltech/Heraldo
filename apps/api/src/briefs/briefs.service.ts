import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class BriefsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async findAll(userId: string, query: any) {
    throw new Error('Not implemented');
  }

  async findOne(id: string) {
    throw new Error('Not implemented');
  }

  async update(id: string, data: any) {
    throw new Error('Not implemented');
  }

  async regenerate(id: string) {
    throw new Error('Not implemented');
  }

  async generatePdf(id: string) {
    throw new Error('Not implemented');
  }
}
