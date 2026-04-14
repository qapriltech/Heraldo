import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class JournalistDirectoryService {
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

  async search(query: any) {
    const {
      page = 1,
      limit = 20,
      q,
      specialty,
      zone,
      mediaType,
      tier,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      profileVisibility: { not: 'private' },
      accreditationStatus: 'VALIDATED',
    };

    if (specialty) {
      where.specialties = { has: specialty };
    }
    if (zone) {
      where.coverageZone = { has: zone };
    }
    if (tier) {
      where.tier = tier;
    }
    if (mediaType) {
      where.mediaOrganization = { type: mediaType };
    }
    if (q) {
      where.OR = [
        { user: { fullName: { contains: q, mode: 'insensitive' } } },
        { bio: { contains: q, mode: 'insensitive' } },
        { specialties: { has: q } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.journalist.findMany({
        where,
        select: {
          id: true,
          profileSlug: true,
          profilePhotoUrl: true,
          bio: true,
          specialties: true,
          coverageZone: true,
          tier: true,
          position: true,
          fcmReliabilityScore: true,
          user: {
            select: { fullName: true, avatarUrl: true },
          },
          mediaOrganization: {
            select: { id: true, name: true, type: true, logoUrl: true },
          },
        },
        skip,
        take: limit,
        orderBy: { fcmReliabilityScore: 'desc' },
      }),
      this.prisma.journalist.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getTrending(query: any) {
    const limit = query?.limit ?? 10;

    // Proxy: journalists with highest reliability scores as trending indicator
    const items = await this.prisma.journalist.findMany({
      where: {
        profileVisibility: { not: 'private' },
        accreditationStatus: 'VALIDATED',
      },
      select: {
        id: true,
        profileSlug: true,
        profilePhotoUrl: true,
        bio: true,
        specialties: true,
        tier: true,
        fcmReliabilityScore: true,
        user: {
          select: { fullName: true, avatarUrl: true },
        },
        mediaOrganization: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: { fcmReliabilityScore: 'desc' },
      take: limit,
    });

    return items;
  }

  async getMyFollowers(userId: string, query: any) {
    const journalist = await this.findJournalist(userId);
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = { followedId: journalist.id };

    const [items, total] = await Promise.all([
      this.prisma.journalistFollow.findMany({
        where,
        include: {
          follower: {
            select: {
              id: true,
              profileSlug: true,
              profilePhotoUrl: true,
              user: { select: { fullName: true, avatarUrl: true } },
              mediaOrganization: { select: { name: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.journalistFollow.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getMyFollowing(userId: string, query: any) {
    const journalist = await this.findJournalist(userId);
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = { followerId: journalist.id };

    const [items, total] = await Promise.all([
      this.prisma.journalistFollow.findMany({
        where,
        include: {
          followed: {
            select: {
              id: true,
              profileSlug: true,
              profilePhotoUrl: true,
              user: { select: { fullName: true, avatarUrl: true } },
              mediaOrganization: { select: { name: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.journalistFollow.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getBySlug(slug: string) {
    const journalist = await this.prisma.journalist.findFirst({
      where: { profileSlug: slug },
      include: {
        user: {
          select: { fullName: true, avatarUrl: true },
        },
        mediaOrganization: {
          select: { id: true, name: true, type: true, logoUrl: true },
        },
        publications: {
          where: { isPublic: true },
          orderBy: { publishedAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { followers: true, following: true },
        },
      },
    });

    if (!journalist) {
      throw new NotFoundException('Journalist not found');
    }
    if (journalist.profileVisibility === 'private') {
      throw new NotFoundException('Profile is private');
    }

    const {
      mobileMoneyOperator,
      mobileMoneyNumber,
      ...publicProfile
    } = journalist;

    return publicProfile;
  }

  async follow(userId: string, targetId: string) {
    const journalist = await this.findJournalist(userId);

    if (journalist.id === targetId) {
      throw new Error('Cannot follow yourself');
    }

    // Verify target exists
    const target = await this.prisma.journalist.findUnique({
      where: { id: targetId },
    });
    if (!target) {
      throw new NotFoundException('Target journalist not found');
    }

    return this.prisma.journalistFollow.create({
      data: {
        followerId: journalist.id,
        followedId: targetId,
      },
    });
  }

  async unfollow(userId: string, targetId: string) {
    const journalist = await this.findJournalist(userId);

    const follow = await this.prisma.journalistFollow.findUnique({
      where: {
        followerId_followedId: {
          followerId: journalist.id,
          followedId: targetId,
        },
      },
    });
    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    await this.prisma.journalistFollow.delete({
      where: { id: follow.id },
    });

    return { unfollowed: true };
  }
}
