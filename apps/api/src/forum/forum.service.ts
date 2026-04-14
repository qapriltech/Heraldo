import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ForumService {
  constructor(private readonly prisma: PrismaService) {}

  async getChannels(query: any) {
    throw new Error('Not implemented');
  }

  async createChannel(userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async getChannelPosts(channelId: string, query: any) {
    throw new Error('Not implemented');
  }

  async createPost(userId: string, channelId: string, data: any) {
    throw new Error('Not implemented');
  }

  async getPost(postId: string) {
    throw new Error('Not implemented');
  }

  async updatePost(userId: string, postId: string, data: any) {
    throw new Error('Not implemented');
  }

  async deletePost(userId: string, postId: string) {
    throw new Error('Not implemented');
  }

  async reactToPost(userId: string, postId: string, data: any) {
    throw new Error('Not implemented');
  }

  async createReply(userId: string, postId: string, data: any) {
    throw new Error('Not implemented');
  }

  async reportPost(userId: string, postId: string, data: any) {
    throw new Error('Not implemented');
  }

  async pinPost(userId: string, postId: string) {
    throw new Error('Not implemented');
  }
}
