import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ArchiveService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Search / List ─────────────────────────────────────

  async listDocuments(
    institutionId: string,
    query: { q?: string; documentType?: string; from?: string; to?: string; tags?: string; page?: number; limit?: number },
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = { institutionId };
    if (query.documentType) where.documentType = query.documentType;
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { contentText: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }
    if (query.tags) {
      where.tags = { hasSome: query.tags.split(',') };
    }

    const [data, total] = await Promise.all([
      this.prisma.archiveDocument.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.archiveDocument.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  // ── Create + SHA-256 ──────────────────────────────────

  async createDocument(institutionId: string, data: {
    title: string;
    documentType: string;
    contentText?: string;
    sourceEntityType?: string;
    sourceEntityId?: string;
    isPublic?: boolean;
    tags?: string[];
    fileUrl?: string;
    metadata?: any;
  }) {
    const content = `${data.title}|${data.contentText || ''}|${new Date().toISOString()}`;
    const sha256Hash = crypto.createHash('sha256').update(content).digest('hex');

    return this.prisma.archiveDocument.create({
      data: {
        institutionId,
        title: data.title,
        documentType: data.documentType,
        contentText: data.contentText || null,
        sourceEntityType: data.sourceEntityType || null,
        sourceEntityId: data.sourceEntityId || null,
        sha256Hash,
        certifiedAt: new Date(),
        isPublic: data.isPublic ?? false,
        tags: data.tags || [],
        fileUrl: data.fileUrl || null,
        metadata: data.metadata || null,
      },
    });
  }

  // ── Get one ───────────────────────────────────────────

  async getDocument(id: string) {
    const doc = await this.prisma.archiveDocument.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document introuvable');
    return doc;
  }

  // ── Certificate ───────────────────────────────────────

  async getCertificate(id: string) {
    const doc = await this.prisma.archiveDocument.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document introuvable');
    return {
      id: doc.id,
      title: doc.title,
      sha256Hash: doc.sha256Hash,
      certifiedAt: doc.certifiedAt,
      documentType: doc.documentType,
    };
  }

  // ── Import existing docs ──────────────────────────────

  async importDocuments(institutionId: string, documents: { title: string; documentType: string; contentText?: string; tags?: string[]; fileUrl?: string }[]) {
    const results = [];
    for (const doc of documents) {
      const created = await this.createDocument(institutionId, doc);
      results.push(created);
    }
    return { imported: results.length, documents: results };
  }
}
