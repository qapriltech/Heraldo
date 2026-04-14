import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class JournalistProfileService {
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

  async getMyProfile(userId: string) {
    const journalist = await this.prisma.journalist.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            language: true,
            status: true,
          },
        },
        mediaOrganization: true,
      },
    });
    if (!journalist) {
      throw new NotFoundException('Journalist profile not found');
    }
    return journalist;
  }

  async updateMyProfile(userId: string, data: any) {
    const journalist = await this.findJournalist(userId);

    return this.prisma.journalist.update({
      where: { id: journalist.id },
      data: {
        bio: data.bio,
        position: data.position,
        specialties: data.specialties,
        coverageZone: data.coverageZone,
        languages: data.languages,
        yearsExperience: data.yearsExperience,
        previousEmployers: data.previousEmployers,
        education: data.education,
        awards: data.awards,
        websiteUrl: data.websiteUrl,
        twitterHandle: data.twitterHandle,
        linkedinUrl: data.linkedinUrl,
        instagramHandle: data.instagramHandle,
        profileVisibility: data.profileVisibility,
        profileSlug: data.profileSlug,
        mobileMoneyOperator: data.mobileMoneyOperator,
        mobileMoneyNumber: data.mobileMoneyNumber,
        preferredContact: data.preferredContact,
        preferredContactTime: data.preferredContactTime,
        tagsEditorial: data.tagsEditorial,
        coverPhotoUrl: data.coverPhotoUrl,
      },
    });
  }

  async uploadPhoto(userId: string, data: any) {
    const journalist = await this.findJournalist(userId);

    return this.prisma.journalist.update({
      where: { id: journalist.id },
      data: {
        profilePhotoUrl: data.profilePhotoUrl,
      },
    });
  }

  async getCompletion(userId: string) {
    const journalist = await this.prisma.journalist.findFirst({
      where: { userId },
      include: {
        publications: { select: { id: true } },
      },
    });
    if (!journalist) {
      throw new NotFoundException('Journalist profile not found');
    }

    let score = 0;
    const breakdown: Record<string, { points: number; earned: boolean }> = {};

    // photo 10pts
    const hasPhoto = !!journalist.profilePhotoUrl;
    breakdown.photo = { points: 10, earned: hasPhoto };
    if (hasPhoto) score += 10;

    // bio 10pts
    const hasBio = !!journalist.bio && journalist.bio.trim().length > 0;
    breakdown.bio = { points: 10, earned: hasBio };
    if (hasBio) score += 10;

    // experience 5pts
    const hasExperience = journalist.yearsExperience != null && journalist.yearsExperience > 0;
    breakdown.experience = { points: 5, earned: hasExperience };
    if (hasExperience) score += 5;

    // employer 10pts
    const hasEmployer = !!journalist.mediaOrganizationId;
    breakdown.employer = { points: 10, earned: hasEmployer };
    if (hasEmployer) score += 10;

    // 3+ specialties 10pts
    const hasSpecialties = journalist.specialties && journalist.specialties.length >= 3;
    breakdown.specialties = { points: 10, earned: hasSpecialties };
    if (hasSpecialties) score += 10;

    // 2+ languages 5pts
    const hasLanguages = journalist.languages && journalist.languages.length >= 2;
    breakdown.languages = { points: 5, earned: hasLanguages };
    if (hasLanguages) score += 5;

    // 1+ zone 5pts
    const hasZone = journalist.coverageZone && journalist.coverageZone.length >= 1;
    breakdown.coverageZone = { points: 5, earned: hasZone };
    if (hasZone) score += 5;

    // 1+ previous employer 10pts
    const prevEmployers = journalist.previousEmployers as any[];
    const hasPrevEmployer = Array.isArray(prevEmployers) && prevEmployers.length >= 1;
    breakdown.previousEmployers = { points: 10, earned: hasPrevEmployer };
    if (hasPrevEmployer) score += 10;

    // 1+ education 5pts
    const edu = journalist.education as any[];
    const hasEducation = Array.isArray(edu) && edu.length >= 1;
    breakdown.education = { points: 5, earned: hasEducation };
    if (hasEducation) score += 5;

    // 3+ publications 20pts
    const hasPublications = journalist.publications && journalist.publications.length >= 3;
    breakdown.publications = { points: 20, earned: hasPublications };
    if (hasPublications) score += 20;

    // mobile money 10pts
    const hasMobileMoney = !!journalist.mobileMoneyOperator && !!journalist.mobileMoneyNumber;
    breakdown.mobileMoney = { points: 10, earned: hasMobileMoney };
    if (hasMobileMoney) score += 10;

    // Update the stored percentage
    await this.prisma.journalist.update({
      where: { id: journalist.id },
      data: { profileCompletionPct: score },
    });

    return { score, maxScore: 100, breakdown };
  }

  async getMyPublications(userId: string, query: any) {
    const journalist = await this.findJournalist(userId);
    const { page = 1, limit = 20, type, year } = query;
    const skip = (page - 1) * limit;

    const where: any = { journalistId: journalist.id };
    if (type) where.publicationType = type;
    if (year) {
      where.publishedAt = {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${Number(year) + 1}-01-01`),
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.journalistPublication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.journalistPublication.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createPublication(userId: string, data: any) {
    const journalist = await this.findJournalist(userId);

    return this.prisma.journalistPublication.create({
      data: {
        journalistId: journalist.id,
        title: data.title,
        mediaOutletNameRaw: data.mediaOutletNameRaw,
        publicationType: data.publicationType,
        url: data.url,
        previewImageUrl: data.previewImageUrl,
        excerpt: data.excerpt,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        sourceType: 'MANUAL_ENTRY',
        tags: data.tags ?? [],
        isFeatured: data.isFeatured ?? false,
        isPublic: data.isPublic ?? true,
      },
    });
  }

  async updatePublication(userId: string, publicationId: string, data: any) {
    const journalist = await this.findJournalist(userId);

    const publication = await this.prisma.journalistPublication.findFirst({
      where: { id: publicationId, journalistId: journalist.id },
    });
    if (!publication) {
      throw new NotFoundException('Publication not found');
    }

    return this.prisma.journalistPublication.update({
      where: { id: publicationId },
      data: {
        title: data.title,
        mediaOutletNameRaw: data.mediaOutletNameRaw,
        publicationType: data.publicationType,
        url: data.url,
        previewImageUrl: data.previewImageUrl,
        excerpt: data.excerpt,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
        tags: data.tags,
        isFeatured: data.isFeatured,
        isPublic: data.isPublic,
      },
    });
  }

  async deletePublication(userId: string, publicationId: string) {
    const journalist = await this.findJournalist(userId);

    const publication = await this.prisma.journalistPublication.findFirst({
      where: { id: publicationId, journalistId: journalist.id },
    });
    if (!publication) {
      throw new NotFoundException('Publication not found');
    }
    if (publication.sourceType !== 'MANUAL_ENTRY') {
      throw new Error('Only manually added publications can be deleted');
    }

    await this.prisma.journalistPublication.delete({
      where: { id: publicationId },
    });

    return { deleted: true };
  }

  async getPublicProfile(slug: string) {
    const journalist = await this.prisma.journalist.findFirst({
      where: { profileSlug: slug },
      include: {
        user: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
        mediaOrganization: {
          select: {
            id: true,
            name: true,
            type: true,
            logoUrl: true,
          },
        },
        publications: {
          where: { isPublic: true },
          orderBy: { publishedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!journalist) {
      throw new NotFoundException('Profile not found');
    }

    if (journalist.profileVisibility === 'private') {
      throw new NotFoundException('Profile is private');
    }

    // Strip sensitive fields
    const {
      mobileMoneyOperator,
      mobileMoneyNumber,
      ...publicProfile
    } = journalist;

    return publicProfile;
  }
}
