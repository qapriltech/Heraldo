import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class JournalistProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    throw new Error('Not implemented');
  }

  async updateMyProfile(userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async uploadPhoto(userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async getCompletion(userId: string) {
    throw new Error('Not implemented');
  }

  async getMyPublications(userId: string, query: any) {
    throw new Error('Not implemented');
  }

  async createPublication(userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async updatePublication(userId: string, publicationId: string, data: any) {
    throw new Error('Not implemented');
  }

  async deletePublication(userId: string, publicationId: string) {
    throw new Error('Not implemented');
  }

  async getPublicProfile(slug: string) {
    throw new Error('Not implemented');
  }
}
