import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class BriefsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveClientId(userId: string): Promise<string> {
    const iu = await this.prisma.institutionUser.findFirst({
      where: { userId },
      select: { institutionId: true },
    });
    if (!iu) throw new BadRequestException('User has no institution');
    return iu.institutionId;
  }

  async create(userId: string, data: any) {
    const clientId = await this.resolveClientId(userId);

    if (!data.mediaName || !data.mediaType || !data.interviewTopic || !data.intervieweeName || !data.intervieweeRole || !data.durationMinutes) {
      throw new BadRequestException(
        'mediaName, mediaType, interviewTopic, intervieweeName, intervieweeRole and durationMinutes are required',
      );
    }

    return this.prisma.brief.create({
      data: {
        clientId,
        createdBy: userId,
        mediaName: data.mediaName,
        journalistId: data.journalistId ?? null,
        journalistNameRaw: data.journalistNameRaw ?? null,
        mediaType: data.mediaType,
        interviewTopic: data.interviewTopic,
        interviewContext: data.interviewContext ?? null,
        intervieweeName: data.intervieweeName,
        intervieweeRole: data.intervieweeRole,
        durationMinutes: data.durationMinutes,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        status: 'DRAFT',
      },
    });
  }

  async findAll(userId: string, query: any) {
    const clientId = await this.resolveClientId(userId);
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const where: any = { clientId };
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.brief.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.brief.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const brief = await this.prisma.brief.findUnique({
      where: { id },
    });
    if (!brief) throw new NotFoundException('Brief not found');
    return brief;
  }

  async update(id: string, data: any) {
    const brief = await this.prisma.brief.findUnique({
      where: { id },
    });
    if (!brief) throw new NotFoundException('Brief not found');

    return this.prisma.brief.update({
      where: { id },
      data: {
        mediaName: data.mediaName ?? undefined,
        journalistId: data.journalistId ?? undefined,
        journalistNameRaw: data.journalistNameRaw ?? undefined,
        mediaType: data.mediaType ?? undefined,
        interviewTopic: data.interviewTopic ?? undefined,
        interviewContext: data.interviewContext ?? undefined,
        intervieweeName: data.intervieweeName ?? undefined,
        intervieweeRole: data.intervieweeRole ?? undefined,
        durationMinutes: data.durationMinutes ?? undefined,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        userEdits: data.userEdits ?? undefined,
        status: data.status ?? undefined,
      },
    });
  }

  async regenerate(id: string) {
    const brief = await this.prisma.brief.findUnique({
      where: { id },
    });
    if (!brief) throw new NotFoundException('Brief not found');

    // Mark as GENERATING
    await this.prisma.brief.update({
      where: { id },
      data: { status: 'GENERATING' },
    });

    // Simulate Claude API response with hardcoded structured content
    const generatedContent = {
      likely_questions: [
        {
          question: `Quel est l'objectif principal de ${brief.interviewTopic} ?`,
          suggested_answer: `Notre objectif principal est de [repondre ici avec les elements cles du sujet].`,
          difficulty: 'easy',
        },
        {
          question: `Quels sont les defis rencontres dans la mise en oeuvre de ${brief.interviewTopic} ?`,
          suggested_answer: `Les principaux defis incluent [mentionner les obstacles et les solutions envisagees].`,
          difficulty: 'medium',
        },
        {
          question: `Comment repondez-vous aux critiques concernant ${brief.interviewTopic} ?`,
          suggested_answer: `Nous prenons en compte toutes les remarques. Concretement, [expliquer les actions correctives].`,
          difficulty: 'hard',
        },
        {
          question: `Quels resultats concrets avez-vous obtenus jusqu'a present ?`,
          suggested_answer: `Nous avons atteint [chiffres/resultats mesurables]. Cela demontre notre engagement.`,
          difficulty: 'medium',
        },
        {
          question: `Quelle est la prochaine etape pour ${brief.interviewTopic} ?`,
          suggested_answer: `La prochaine etape est [decrire les plans a court et moyen terme].`,
          difficulty: 'easy',
        },
      ],
      key_messages: [
        `${brief.intervieweeName} est pleinement engage(e) dans ${brief.interviewTopic}.`,
        `Des resultats concrets et mesurables ont ete obtenus.`,
        `La transparence et la redevabilite sont au coeur de notre demarche.`,
        `Nous invitons les citoyens et les medias a suivre l'evolution du projet.`,
      ],
      statistics: [
        { label: 'Budget alloue', value: 'X milliards FCFA', source: 'Ministere des Finances' },
        { label: 'Beneficiaires directs', value: 'X personnes', source: 'Rapport interne' },
        { label: 'Taux de realisation', value: 'X%', source: 'Suivi-evaluation' },
      ],
      media_tips: {
        media_type: brief.mediaType,
        duration_minutes: brief.durationMinutes,
        tone: 'Formel mais accessible',
        dress_code: brief.mediaType === 'TV' ? 'Tenue officielle, couleurs unies' : 'Standard',
        key_phrase_to_repeat: `Notre engagement pour ${brief.interviewTopic} est total.`,
      },
      generated_at: new Date().toISOString(),
    };

    // Save generated content and set status to READY
    return this.prisma.brief.update({
      where: { id },
      data: {
        generatedContent,
        status: 'READY',
      },
    });
  }

  async generatePdf(id: string) {
    const brief = await this.prisma.brief.findUnique({
      where: { id },
    });
    if (!brief) throw new NotFoundException('Brief not found');
    if (!brief.generatedContent) {
      throw new BadRequestException('Brief must be generated before PDF export');
    }

    // In production, render PDF via Puppeteer/wkhtmltopdf and upload to storage.
    // Return a placeholder URL.
    const pdfUrl = `https://cdn.heraldo.ci/briefs/${id}/brief-${Date.now()}.pdf`;

    await this.prisma.brief.update({
      where: { id },
      data: { pdfUrl },
    });

    return { pdfUrl };
  }
}
