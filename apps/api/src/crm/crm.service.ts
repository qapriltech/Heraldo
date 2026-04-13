import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  async getJournalist(id: string) {
    throw new Error('Not implemented');
  }

  async getJournalistTimeline(id: string, query: any) {
    throw new Error('Not implemented');
  }

  async addInteraction(id: string, userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async listNotes(journalistId: string, userId: string) {
    throw new Error('Not implemented');
  }

  async createNote(journalistId: string, userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async updateNote(noteId: string, userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async deleteNote(noteId: string, userId: string) {
    throw new Error('Not implemented');
  }

  async getUpcomingBirthdays() {
    throw new Error('Not implemented');
  }

  async listJournalists(query: any) {
    throw new Error('Not implemented');
  }

  async getDashboard(userId: string) {
    throw new Error('Not implemented');
  }
}
