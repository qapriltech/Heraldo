import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class StudioService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveClientId(userId: string): Promise<string> {
    const iu = await this.prisma.institutionUser.findFirst({
      where: { userId },
      select: { institutionId: true },
    });
    if (!iu) throw new BadRequestException('User has no institution');
    return iu.institutionId;
  }

  async listTemplates(query: any) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (query.format) where.format = query.format;
    if (query.category) where.category = query.category;

    const [data, total] = await Promise.all([
      this.prisma.studioTemplate.findMany({
        where,
        orderBy: { orderIndex: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.studioTemplate.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getTemplate(id: string) {
    const template = await this.prisma.studioTemplate.findUnique({
      where: { id },
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async upsertBrandKit(userId: string, data: any) {
    const clientId = await this.resolveClientId(userId);

    return this.prisma.clientBrandKit.upsert({
      where: { clientId },
      create: {
        clientId,
        logoUrl: data.logoUrl ?? null,
        logoWhiteUrl: data.logoWhiteUrl ?? null,
        colorPrimary: data.colorPrimary ?? '#0D1B3E',
        colorSecondary: data.colorSecondary ?? '#C8A45C',
        colorAccent: data.colorAccent ?? '#E8742E',
        fontHeading: data.fontHeading ?? 'Georgia',
        fontBody: data.fontBody ?? 'Calibri',
        logoPositionDefault: data.logoPositionDefault ?? 'top_right',
        signatureText: data.signatureText ?? null,
      },
      update: {
        logoUrl: data.logoUrl ?? undefined,
        logoWhiteUrl: data.logoWhiteUrl ?? undefined,
        colorPrimary: data.colorPrimary ?? undefined,
        colorSecondary: data.colorSecondary ?? undefined,
        colorAccent: data.colorAccent ?? undefined,
        fontHeading: data.fontHeading ?? undefined,
        fontBody: data.fontBody ?? undefined,
        logoPositionDefault: data.logoPositionDefault ?? undefined,
        signatureText: data.signatureText ?? undefined,
      },
    });
  }

  async getBrandKit(userId: string) {
    const clientId = await this.resolveClientId(userId);
    const kit = await this.prisma.clientBrandKit.findUnique({
      where: { clientId },
    });
    if (!kit) throw new NotFoundException('Brand kit not found');
    return kit;
  }

  async render(userId: string, data: any) {
    const clientId = await this.resolveClientId(userId);

    if (!data.templateId || !data.title || !data.format) {
      throw new BadRequestException('templateId, title, and format are required');
    }

    const template = await this.prisma.studioTemplate.findUnique({
      where: { id: data.templateId },
    });
    if (!template) throw new NotFoundException('Template not found');

    const visual = await this.prisma.studioVisual.create({
      data: {
        clientId,
        templateId: data.templateId,
        title: data.title,
        format: data.format,
        renderParams: data.renderParams ?? {},
        outputUrl: `https://cdn.heraldo.ci/studio/renders/${Date.now()}-${clientId}.png`,
        thumbnailUrl: `https://cdn.heraldo.ci/studio/thumbs/${Date.now()}-${clientId}.png`,
        createdByUserId: userId,
        usedInPostIds: [],
      },
    });

    return visual;
  }

  async listVisuals(userId: string) {
    const clientId = await this.resolveClientId(userId);

    return this.prisma.studioVisual.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: { template: true },
    });
  }

  async deleteVisual(id: string) {
    const visual = await this.prisma.studioVisual.findUnique({
      where: { id },
    });
    if (!visual) throw new NotFoundException('Visual not found');

    return this.prisma.studioVisual.delete({ where: { id } });
  }

  async uploadImage(userId: string, file: any) {
    if (!file) throw new BadRequestException('No file provided');

    // In production, upload to object storage (S3/GCS).
    // Return a placeholder URL.
    const filename = file.originalname || `upload-${Date.now()}`;
    return {
      url: `https://cdn.heraldo.ci/studio/uploads/${userId}/${filename}`,
      filename,
      size: file.size || 0,
    };
  }
}
