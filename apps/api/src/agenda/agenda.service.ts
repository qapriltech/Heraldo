import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AgendaService {
  constructor(private readonly prisma: PrismaService) {}

  async listItems(userId: string, query: any) {
    throw new Error('Not implemented');
  }

  async createItem(userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async getItem(itemId: string) {
    throw new Error('Not implemented');
  }

  async updateItem(itemId: string, data: any) {
    throw new Error('Not implemented');
  }

  async deleteItem(itemId: string) {
    throw new Error('Not implemented');
  }

  async linkEntity(itemId: string, type: string) {
    throw new Error('Not implemented');
  }

  async unlinkEntity(itemId: string, type: string, id: string) {
    throw new Error('Not implemented');
  }

  async getCalendar(year: string, month: string) {
    throw new Error('Not implemented');
  }

  async getRecurringSuggestions(userId: string) {
    throw new Error('Not implemented');
  }

  async toggleChecklistItem(itemId: string, taskIdx: number) {
    throw new Error('Not implemented');
  }
}
