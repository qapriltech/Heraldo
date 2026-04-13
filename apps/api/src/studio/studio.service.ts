import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class StudioService {
  constructor(private readonly prisma: PrismaService) {}

  async listTemplates(query: any) {
    throw new Error('Not implemented');
  }

  async getTemplate(id: string) {
    throw new Error('Not implemented');
  }

  async upsertBrandKit(userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async getBrandKit(userId: string) {
    throw new Error('Not implemented');
  }

  async render(userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async listVisuals(userId: string) {
    throw new Error('Not implemented');
  }

  async deleteVisual(id: string) {
    throw new Error('Not implemented');
  }

  async uploadImage(userId: string, file: any) {
    throw new Error('Not implemented');
  }
}
