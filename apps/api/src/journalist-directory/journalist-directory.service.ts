import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class JournalistDirectoryService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: any) {
    throw new Error('Not implemented');
  }

  async getTrending(query: any) {
    throw new Error('Not implemented');
  }

  async getMyFollowers(userId: string, query: any) {
    throw new Error('Not implemented');
  }

  async getMyFollowing(userId: string, query: any) {
    throw new Error('Not implemented');
  }

  async getBySlug(slug: string) {
    throw new Error('Not implemented');
  }

  async follow(userId: string, targetId: string) {
    throw new Error('Not implemented');
  }

  async unfollow(userId: string, targetId: string) {
    throw new Error('Not implemented');
  }
}
