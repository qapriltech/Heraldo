import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class RssService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Flux global : les 50 derniers communiqués publiés
   */
  async getGlobalFeed(): Promise<string> {
    const communiques = await this.prisma.communique.findMany({
      where: { status: 'SENT' },
      orderBy: { publishedAt: 'desc' },
      take: 50,
      include: { institution: true },
    });

    return this.buildRssXml({
      title: 'HERALDO — Communiqués de presse',
      description: 'Flux officiel des communiqués de presse diffusés via HERALDO',
      selfUrl: 'https://api.heraldo-press.com/v1/rss/communiques',
      items: communiques,
    });
  }

  /**
   * Flux par institution (recherche par slug, insensible à la casse)
   */
  async getInstitutionFeed(slug: string): Promise<string> {
    const decodedSlug = decodeURIComponent(slug).replace(/-/g, ' ');

    const institutions = await this.prisma.institution.findMany({
      where: {
        name: { contains: decodedSlug, mode: 'insensitive' },
      },
    });

    const institutionIds = institutions.map((i) => i.id);

    const communiques = await this.prisma.communique.findMany({
      where: {
        status: 'SENT',
        institutionId: { in: institutionIds },
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
      include: { institution: true },
    });

    const institutionName = institutions[0]?.name || decodedSlug;

    return this.buildRssXml({
      title: `HERALDO — ${institutionName}`,
      description: `Communiqués de presse de ${institutionName} diffusés via HERALDO`,
      selfUrl: `https://api.heraldo-press.com/v1/rss/institution/${slug}`,
      items: communiques,
    });
  }

  /**
   * Flux par thématique (recherche dans le titre et le corps)
   */
  async getThematiqueFeed(tag: string): Promise<string> {
    const decodedTag = decodeURIComponent(tag);

    const communiques = await this.prisma.communique.findMany({
      where: {
        status: 'SENT',
        OR: [
          { title: { contains: decodedTag, mode: 'insensitive' } },
          { bodyContent: { contains: decodedTag, mode: 'insensitive' } },
        ],
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
      include: { institution: true },
    });

    return this.buildRssXml({
      title: `HERALDO — Thématique : ${decodedTag}`,
      description: `Communiqués de presse sur le thème « ${decodedTag} » diffusés via HERALDO`,
      selfUrl: `https://api.heraldo-press.com/v1/rss/thematique/${tag}`,
      items: communiques,
    });
  }

  /**
   * Construit le XML RSS 2.0 complet
   */
  private buildRssXml(feed: {
    title: string;
    description: string;
    selfUrl: string;
    items: any[];
  }): string {
    const lastBuildDate = new Date().toUTCString();

    const itemsXml = feed.items
      .map((c) => {
        const description = c.chapeau || (c.bodyContent ? c.bodyContent.substring(0, 300) : '');
        const pubDate = c.publishedAt
          ? new Date(c.publishedAt).toUTCString()
          : new Date(c.createdAt).toUTCString();
        const category = c.institution?.name || '';

        return `    <item>
      <title>${escapeXml(c.title)}</title>
      <description>${escapeXml(description)}</description>
      <link>https://heraldo-press.com/communiques/${c.id}</link>
      <guid isPermaLink="false">${c.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(category)}</category>
    </item>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feed.title)}</title>
    <link>https://heraldo-press.com</link>
    <description>${escapeXml(feed.description)}</description>
    <language>fr</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(feed.selfUrl)}" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;
  }
}

/**
 * Échappe les caractères spéciaux XML
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
