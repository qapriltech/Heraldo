import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  async listAccounts(userId: string) {
    throw new Error('Not implemented');
  }

  async oauthAuthorize(userId: string, platform: string) {
    throw new Error('Not implemented');
  }

  async oauthCallback(platform: string, query: any) {
    throw new Error('Not implemented');
  }

  async disconnectAccount(userId: string, accountId: string) {
    throw new Error('Not implemented');
  }

  async createPost(userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async listPosts(userId: string, query: any) {
    throw new Error('Not implemented');
  }

  async getPost(postId: string) {
    throw new Error('Not implemented');
  }

  async updatePost(postId: string, data: any) {
    throw new Error('Not implemented');
  }

  async deletePost(postId: string) {
    throw new Error('Not implemented');
  }

  async publishPost(postId: string) {
    throw new Error('Not implemented');
  }

  async approvePost(postId: string, userId: string) {
    throw new Error('Not implemented');
  }

  async getPostStats(postId: string) {
    throw new Error('Not implemented');
  }
}
