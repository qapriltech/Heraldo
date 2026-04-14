import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminAccreditationsService {
  constructor(private readonly prisma: PrismaService) {}

  async submitPublicRequest(data: any) {
    if (
      !data.firstName ||
      !data.lastName ||
      !data.email ||
      !data.phone ||
      !data.mediaOutletDeclared ||
      !data.specialty ||
      !data.zoneGeo
    ) {
      throw new BadRequestException(
        'firstName, lastName, email, phone, mediaOutletDeclared, specialty, and zoneGeo are required',
      );
    }

    return this.prisma.accreditationRequest.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        mediaOutletDeclared: data.mediaOutletDeclared,
        specialty: data.specialty,
        zoneGeo: data.zoneGeo,
        pressCardUrl: data.pressCardUrl ?? null,
        alternativeProofUrl: data.alternativeProofUrl ?? null,
        acquisitionChannel: data.acquisitionChannel ?? 'direct',
        referrerJournalistId: data.referrerJournalistId ?? null,
        status: 'PENDING',
      },
    });
  }

  async listRequests(query: any) {
    const page = parseInt(query?.page, 10) || 1;
    const limit = parseInt(query?.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.channel) where.acquisitionChannel = query.channel;

    const [data, total] = await Promise.all([
      this.prisma.accreditationRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
      }),
      this.prisma.accreditationRequest.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getRequest(id: string) {
    const request = await this.prisma.accreditationRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException(`Accreditation request ${id} not found`);
    }
    return request;
  }

  async approveRequest(id: string, reviewedBy: string) {
    const request = await this.getRequest(id);
    if (request.status !== 'PENDING' && request.status !== 'IN_REVIEW') {
      throw new BadRequestException(
        `Cannot approve request with status ${request.status}`,
      );
    }

    // Generate slug from name
    const slug = `${request.firstName}-${request.lastName}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Ensure unique slug
    const existingSlug = await this.prisma.journalist.findUnique({
      where: { profileSlug: slug },
    });
    const finalSlug = existingSlug
      ? `${slug}-${Date.now().toString(36)}`
      : slug;

    // Create User and Journalist in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: request.email,
          fullName: `${request.firstName} ${request.lastName}`,
          role: 'JOURNALIST',
          status: 'ACTIVE',
          emailVerified: true,
        },
      });

      const journalist = await tx.journalist.create({
        data: {
          userId: user.id,
          specialties: [request.specialty],
          coverageZone: [request.zoneGeo],
          pressCardUrl: request.pressCardUrl,
          accreditationStatus: 'VALIDATED',
          accreditedAt: new Date(),
          accreditedBy: reviewedBy,
          profileSlug: finalSlug,
        },
      });

      const updatedRequest = await tx.accreditationRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedBy,
          reviewedAt: new Date(),
          journalistId: journalist.id,
        },
      });

      return { request: updatedRequest, user, journalist };
    });

    return result;
  }

  async rejectRequest(id: string, reason: string, reviewedBy: string) {
    const request = await this.getRequest(id);
    if (request.status === 'APPROVED' || request.status === 'REJECTED') {
      throw new BadRequestException(
        `Cannot reject request with status ${request.status}`,
      );
    }

    if (!reason) {
      throw new BadRequestException('Rejection reason is required');
    }

    return this.prisma.accreditationRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedBy,
        reviewedAt: new Date(),
      },
    });
  }

  async holdRequest(id: string, notes: string, reviewedBy: string) {
    const request = await this.getRequest(id);
    if (request.status !== 'PENDING' && request.status !== 'IN_REVIEW') {
      throw new BadRequestException(
        `Cannot put on hold request with status ${request.status}`,
      );
    }

    return this.prisma.accreditationRequest.update({
      where: { id },
      data: {
        status: 'ON_HOLD',
        reviewNotes: notes,
        reviewedBy,
      },
    });
  }

  async revokeAccreditation(journalistId: string, data: any) {
    const journalist = await this.prisma.journalist.findUnique({
      where: { id: journalistId },
    });
    if (!journalist) {
      throw new NotFoundException(`Journalist ${journalistId} not found`);
    }

    if (journalist.accreditationStatus === 'REVOKED') {
      throw new BadRequestException('Accreditation is already revoked');
    }

    if (!data.reasonCategory) {
      throw new BadRequestException('reasonCategory is required');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const revocation = await tx.accreditationRevocation.create({
        data: {
          journalistId,
          reasonCategory: data.reasonCategory,
          reasonDetail: data.reasonDetail ?? null,
          evidenceUrls: data.evidenceUrls ?? [],
          decidedByCommittee: data.decidedByCommittee ?? false,
          revokedBy: data.revokedBy ?? null,
          canReapplyAfter: data.canReapplyAfter
            ? new Date(data.canReapplyAfter)
            : null,
        },
      });

      await tx.journalist.update({
        where: { id: journalistId },
        data: {
          accreditationStatus: 'REVOKED',
          suspensionReason: data.reasonCategory,
        },
      });

      return revocation;
    });

    return result;
  }

  async getStats() {
    const [
      byStatus,
      byChannel,
      byMonth,
    ] = await Promise.all([
      // Count by status
      this.prisma.accreditationRequest.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      // Count by acquisition channel
      this.prisma.accreditationRequest.groupBy({
        by: ['acquisitionChannel'],
        _count: { id: true },
      }),
      // Count by month (submitted)
      this.prisma.accreditationRequest.findMany({
        select: { submittedAt: true },
      }),
    ]);

    // Aggregate monthly counts
    const monthlyCounts: Record<string, number> = {};
    for (const item of byMonth) {
      const month = item.submittedAt.toISOString().slice(0, 7);
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    }

    return {
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      byChannel: byChannel.map((c) => ({
        channel: c.acquisitionChannel,
        count: c._count.id,
      })),
      byMonth: Object.entries(monthlyCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ month, count })),
    };
  }
}
