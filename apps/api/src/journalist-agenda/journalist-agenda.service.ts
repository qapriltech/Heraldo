import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class JournalistAgendaService {
  constructor(private readonly prisma: PrismaService) {}

  async getItems(userId: string, query: any) {
    throw new Error('Not implemented');
  }

  async createItem(userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async updateItem(userId: string, itemId: string, data: any) {
    throw new Error('Not implemented');
  }

  async deleteItem(userId: string, itemId: string) {
    throw new Error('Not implemented');
  }

  async getToday(userId: string) {
    throw new Error('Not implemented');
  }

  async getUpcoming(userId: string, query: any) {
    throw new Error('Not implemented');
  }

  async getIcalExport(userId: string) {
    throw new Error('Not implemented');
  }
}
