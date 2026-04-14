import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveClientId(userId: string): Promise<string> {
    const iu = await this.prisma.institutionUser.findFirst({
      where: { userId },
      select: { institutionId: true },
    });
    if (!iu) throw new BadRequestException('User has no institution');
    return iu.institutionId;
  }

  async listAccounts(userId: string) {
    const clientId = await this.resolveClientId(userId);
    return this.prisma.socialAccount.findMany({
      where: { clientId, status: { not: 'DISCONNECTED' } },
      orderBy: { connectedAt: 'desc' },
    });
  }

  async oauthAuthorize(userId: string, platform: string) {
    // In production this would redirect to the OAuth provider.
    // Return a placeholder authorize URL for now.
    return {
      authorizeUrl: `https://oauth.placeholder/${platform.toLowerCase()}/authorize?state=${userId}`,
    };
  }

  async oauthCallback(platform: string, query: any) {
    // In production this would exchange code for tokens.
    // For now, create the account record with placeholder tokens.
    if (!query.clientId || !query.userId) {
      throw new BadRequestException('Missing clientId or userId in callback');
    }
    return this.prisma.socialAccount.create({
      data: {
        clientId: query.clientId,
        platform: platform as any,
        platformAccountId: query.platformAccountId || `placeholder-${Date.now()}`,
        platformAccountName: query.platformAccountName || platform,
        platformAccountUrl: query.platformAccountUrl ?? null,
        accessTokenEncrypted: query.accessToken || 'encrypted-placeholder',
        refreshTokenEncrypted: query.refreshToken ?? null,
        connectedByUserId: query.userId,
      },
    });
  }

  async disconnectAccount(userId: string, accountId: string) {
    const clientId = await this.resolveClientId(userId);
    const account = await this.prisma.socialAccount.findFirst({
      where: { id: accountId, clientId },
    });
    if (!account) throw new NotFoundException('Social account not found');

    return this.prisma.socialAccount.update({
      where: { id: accountId },
      data: { status: 'DISCONNECTED' },
    });
  }

  async createPost(userId: string, data: any) {
    const clientId = await this.resolveClientId(userId);

    if (!data.contentText) {
      throw new BadRequestException('contentText is required');
    }

    return this.prisma.socialPublication.create({
      data: {
        clientId,
        createdByUserId: userId,
        contentText: data.contentText,
        contentMediaUrls: data.contentMediaUrls ?? [],
        targetPlatforms: data.targetPlatforms ?? [],
        targetAccountIds: data.targetAccountIds ?? [],
        status: 'DRAFT',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        approvalRequired: data.approvalRequired ?? false,
        linkedCommuniqueId: data.linkedCommuniqueId ?? null,
        linkedAgendaItemId: data.linkedAgendaItemId ?? null,
      },
    });
  }

  async listPosts(userId: string, query: any) {
    const clientId = await this.resolveClientId(userId);
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const where: any = { clientId };
    if (query.status) where.status = query.status;
    if (query.platform) where.targetPlatforms = { has: query.platform };

    const [data, total] = await Promise.all([
      this.prisma.socialPublication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { platforms: true },
      }),
      this.prisma.socialPublication.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getPost(postId: string) {
    const post = await this.prisma.socialPublication.findUnique({
      where: { id: postId },
      include: { platforms: { include: { socialAccount: true } } },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async updatePost(postId: string, data: any) {
    const post = await this.prisma.socialPublication.findUnique({
      where: { id: postId },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.status !== 'DRAFT' && post.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Only DRAFT or PENDING_APPROVAL posts can be edited');
    }

    return this.prisma.socialPublication.update({
      where: { id: postId },
      data: {
        contentText: data.contentText ?? undefined,
        contentMediaUrls: data.contentMediaUrls ?? undefined,
        targetPlatforms: data.targetPlatforms ?? undefined,
        targetAccountIds: data.targetAccountIds ?? undefined,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        approvalRequired: data.approvalRequired ?? undefined,
      },
    });
  }

  async deletePost(postId: string) {
    const post = await this.prisma.socialPublication.findUnique({
      where: { id: postId },
    });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.socialPublication.delete({ where: { id: postId } });
  }

  async publishPost(postId: string) {
    const post = await this.prisma.socialPublication.findUnique({
      where: { id: postId },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.approvalRequired && !post.approvedByUserId) {
      throw new BadRequestException('Post requires approval before publishing');
    }

    return this.prisma.socialPublication.update({
      where: { id: postId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  async approvePost(postId: string, userId: string) {
    const post = await this.prisma.socialPublication.findUnique({
      where: { id: postId },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Post is not pending approval');
    }

    return this.prisma.socialPublication.update({
      where: { id: postId },
      data: {
        approvedByUserId: userId,
        approvedAt: new Date(),
        status: 'SCHEDULED',
      },
    });
  }

  async getPostStats(postId: string) {
    const post = await this.prisma.socialPublication.findUnique({
      where: { id: postId },
      select: {
        id: true,
        engagementStats: true,
        status: true,
        publishedAt: true,
        platforms: {
          select: {
            platform: true,
            status: true,
            externalPostUrl: true,
            publishedAt: true,
          },
        },
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }
}
