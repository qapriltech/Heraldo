import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ForumService {
  constructor(private readonly prisma: PrismaService) {}

  private async findJournalist(userId: string) {
    const journalist = await this.prisma.journalist.findFirst({
      where: { userId },
    });
    if (!journalist) {
      throw new NotFoundException('Journalist profile not found');
    }
    return journalist;
  }

  async getChannels(query: any) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.forumChannel.findMany({
        skip,
        take: limit,
        orderBy: [{ isOfficial: 'desc' }, { postsCount: 'desc' }],
      }),
      this.prisma.forumChannel.count(),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createChannel(userId: string, data: any) {
    const journalist = await this.findJournalist(userId);

    return this.prisma.forumChannel.create({
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        icon: data.icon,
        isOfficial: false,
        createdById: journalist.id,
        moderatorsIds: [journalist.id],
        membersCount: 1,
        postsCount: 0,
      },
    });
  }

  async getChannelPosts(channelId: string, query: any) {
    const { page = 1, limit = 20, sort = 'recent' } = query;
    const skip = (page - 1) * limit;

    const channel = await this.prisma.forumChannel.findUnique({
      where: { id: channelId },
    });
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const where: any = { channelId, isRemoved: false };

    const orderBy: any[] = [];
    if (sort === 'pinned') {
      orderBy.push({ isPinned: 'desc' });
    }
    orderBy.push({ createdAt: 'desc' });

    const [items, total] = await Promise.all([
      this.prisma.forumPost.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.forumPost.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createPost(userId: string, channelId: string, data: any) {
    const journalist = await this.findJournalist(userId);

    const channel = await this.prisma.forumChannel.findUnique({
      where: { id: channelId },
    });
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const [post] = await this.prisma.$transaction([
      this.prisma.forumPost.create({
        data: {
          channelId,
          authorId: journalist.id,
          title: data.title,
          content: data.content,
          attachedMediaUrls: data.attachedMediaUrls ?? [],
          mentionedJournalistIds: data.mentionedJournalistIds ?? [],
        },
      }),
      this.prisma.forumChannel.update({
        where: { id: channelId },
        data: { postsCount: { increment: 1 } },
      }),
    ]);

    return post;
  }

  async getPost(postId: string) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        replies: {
          where: { isRemoved: false },
          orderBy: { createdAt: 'asc' },
        },
        channel: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!post || post.isRemoved) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async updatePost(userId: string, postId: string, data: any) {
    const journalist = await this.findJournalist(userId);

    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
    });
    if (!post || post.isRemoved) {
      throw new NotFoundException('Post not found');
    }
    if (post.authorId !== journalist.id) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    return this.prisma.forumPost.update({
      where: { id: postId },
      data: {
        title: data.title,
        content: data.content,
        attachedMediaUrls: data.attachedMediaUrls,
        mentionedJournalistIds: data.mentionedJournalistIds,
      },
    });
  }

  async deletePost(userId: string, postId: string) {
    const journalist = await this.findJournalist(userId);

    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.authorId !== journalist.id) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.forumPost.update({
      where: { id: postId },
      data: {
        isRemoved: true,
        removalReason: 'Deleted by author',
      },
    });

    return { deleted: true };
  }

  async reactToPost(userId: string, postId: string, data: any) {
    const journalist = await this.findJournalist(userId);

    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
    });
    if (!post || post.isRemoved) {
      throw new NotFoundException('Post not found');
    }

    const reactions = (post.reactions as Record<string, string[]>) ?? {};
    const emoji = data.emoji as string;

    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }

    const idx = reactions[emoji].indexOf(journalist.id);
    if (idx >= 0) {
      // Toggle off
      reactions[emoji].splice(idx, 1);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    } else {
      // Toggle on
      reactions[emoji].push(journalist.id);
    }

    return this.prisma.forumPost.update({
      where: { id: postId },
      data: { reactions },
    });
  }

  async createReply(userId: string, postId: string, data: any) {
    const journalist = await this.findJournalist(userId);

    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
    });
    if (!post || post.isRemoved) {
      throw new NotFoundException('Post not found');
    }
    if (post.isLocked) {
      throw new ForbiddenException('Post is locked');
    }

    const [reply] = await this.prisma.$transaction([
      this.prisma.forumReply.create({
        data: {
          postId,
          authorId: journalist.id,
          content: data.content,
          parentReplyId: data.parentReplyId ?? null,
          mentionedJournalistIds: data.mentionedJournalistIds ?? [],
        },
      }),
      this.prisma.forumPost.update({
        where: { id: postId },
        data: { repliesCount: { increment: 1 } },
      }),
    ]);

    return reply;
  }

  async reportPost(userId: string, postId: string, data: any) {
    const journalist = await this.findJournalist(userId);

    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.prisma.auditLog.create({
      data: {
        userId,
        action: 'REPORT',
        entity: 'forum_post',
        entityId: postId,
        details: {
          reporterId: journalist.id,
          reason: data.reason,
          description: data.description,
        },
      },
    });
  }

  async pinPost(userId: string, postId: string) {
    const journalist = await this.findJournalist(userId);

    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      include: { channel: true },
    });
    if (!post || post.isRemoved) {
      throw new NotFoundException('Post not found');
    }

    // Check if user is moderator or channel creator
    const channel = post.channel;
    const isModerator =
      channel.moderatorsIds.includes(journalist.id) ||
      channel.createdById === journalist.id;

    if (!isModerator) {
      throw new ForbiddenException(
        'Only moderators or channel creators can pin posts',
      );
    }

    return this.prisma.forumPost.update({
      where: { id: postId },
      data: { isPinned: !post.isPinned },
    });
  }
}
