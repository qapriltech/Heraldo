import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ReseauService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Recherche de journalistes — multi-critères (F-RESEAU-03)
   * RG-RESEAU-01: ne jamais exposer téléphone, email ou Mobile Money
   */
  async searchJournalists(query: {
    search?: string;
    specialty?: string;
    zone?: string;
    mediaType?: string;
    tier?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const where: any = {};

    // Filtre par statut d'accréditation
    if (query.status) {
      where.accreditationStatus = query.status;
    } else {
      where.accreditationStatus = 'VALIDATED'; // Par défaut, que les accrédités
    }

    // Recherche texte (nom, média)
    if (query.search) {
      where.OR = [
        { user: { fullName: { contains: query.search, mode: 'insensitive' } } },
        { mediaOrganization: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    // Filtre par spécialité
    if (query.specialty) {
      where.specialties = { has: query.specialty };
    }

    // Filtre par zone
    if (query.zone) {
      where.coverageZone = { has: query.zone };
    }

    // Filtre par type de média
    if (query.mediaType) {
      where.mediaOrganization = { ...where.mediaOrganization, type: query.mediaType };
    }

    // Filtre par tier
    if (query.tier) {
      where.tier = query.tier;
    }

    const [journalists, total] = await Promise.all([
      this.prisma.journalist.findMany({
        where,
        select: {
          id: true,
          specialties: true,
          coverageZone: true,
          languages: true,
          accreditationStatus: true,
          tier: true,
          tagsEditorial: true,
          fcmReliabilityScore: true,
          // RG-RESEAU-01: PAS de mobileMoneyNumber, PAS de user.email, PAS de phoneEncrypted
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              // email: PAS exposé aux institutions
            },
          },
          mediaOrganization: {
            select: {
              id: true,
              name: true,
              type: true,
              logoUrl: true,
              city: true,
            },
          },
        },
        orderBy: { fcmReliabilityScore: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.journalist.count({ where }),
    ]);

    return {
      data: journalists,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Profil détaillé d'un journaliste (sans données sensibles)
   */
  async getJournalistProfile(id: string) {
    const journalist = await this.prisma.journalist.findUnique({
      where: { id },
      select: {
        id: true,
        specialties: true,
        coverageZone: true,
        languages: true,
        accreditationStatus: true,
        accreditedAt: true,
        tier: true,
        tagsEditorial: true,
        fcmReliabilityScore: true,
        position: true,
        birthday: true,
        preferredContact: true,
        user: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        mediaOrganization: {
          select: { id: true, name: true, type: true, logoUrl: true, city: true },
        },
      },
    });

    if (!journalist) throw new NotFoundException('Journaliste introuvable');
    return journalist;
  }

  /**
   * Seed — créer des journalistes de démonstration
   */
  async seedDemoJournalists() {
    const demoData = [
      { fullName: 'Aminata Coulibaly', email: 'aminata@fraternitin.ci', media: 'Fraternite Matin', mediaType: 'PRESSE_ECRITE', specialties: ['politique', 'economie'], zone: ['abidjan', 'nationale'], tier: 'tier1' },
      { fullName: 'Sekou Diallo', email: 'sekou@rti.ci', media: 'RTI Television', mediaType: 'TV', specialties: ['societe', 'culture'], zone: ['abidjan', 'nationale'], tier: 'tier1' },
      { fullName: 'Marie Konan', email: 'marie@rfi.fr', media: 'RFI Abidjan', mediaType: 'RADIO', specialties: ['international', 'politique'], zone: ['abidjan', 'internationale'], tier: 'tier1' },
      { fullName: 'Ibrahim Traore', email: 'ibrahim@abidjan.net', media: 'Abidjan.net', mediaType: 'WEB', specialties: ['economie', 'tech'], zone: ['abidjan'], tier: 'tier2' },
      { fullName: 'Fatou Bamba', email: 'fatou@intelligent.ci', media: "L'Intelligent d'Abidjan", mediaType: 'PRESSE_ECRITE', specialties: ['societe', 'justice'], zone: ['abidjan'], tier: 'tier2' },
      { fullName: 'Kouadio Yao', email: 'kouadio@nci.ci', media: 'NCI Television', mediaType: 'TV', specialties: ['politique', 'economie', 'sport'], zone: ['abidjan', 'nationale'], tier: 'tier1' },
      { fullName: 'Awa Diaby', email: 'awa@radioci.ci', media: 'Radio Cote d Ivoire', mediaType: 'RADIO', specialties: ['societe', 'education'], zone: ['abidjan', 'bouake'], tier: 'tier2' },
      { fullName: 'Moussa Kone', email: 'moussa@lematinal.ci', media: 'Le Matinal', mediaType: 'PRESSE_ECRITE', specialties: ['politique', 'gouvernance'], zone: ['abidjan', 'yamoussoukro'], tier: 'tier2' },
      { fullName: 'Clarisse Aka', email: 'clarisse@7info.ci', media: '7info.ci', mediaType: 'WEB', specialties: ['economie', 'finance', 'tech'], zone: ['abidjan'], tier: 'tier2' },
      { fullName: 'Jean-Marc Brou', email: 'jm@afp.ci', media: 'AFP Abidjan', mediaType: 'AGENCE_PRESSE', specialties: ['politique', 'international'], zone: ['abidjan', 'nationale', 'internationale'], tier: 'tier1' },
      { fullName: 'Salimata Ouattara', email: 'salimata@vibe.ci', media: 'Vibe Radio', mediaType: 'RADIO', specialties: ['culture', 'musique', 'jeunesse'], zone: ['abidjan'], tier: 'tier3' },
      { fullName: 'Patrick N Guessan', email: 'patrick@linfodrome.ci', media: "L'Infodrome", mediaType: 'WEB', specialties: ['politique', 'societe'], zone: ['abidjan', 'nationale'], tier: 'tier2' },
    ];

    const results = [];
    for (const d of demoData) {
      // Vérifier si existe déjà
      const existing = await this.prisma.user.findUnique({ where: { email: d.email } });
      if (existing) continue;

      // Créer le user
      const user = await this.prisma.user.create({
        data: {
          email: d.email,
          fullName: d.fullName,
          role: 'JOURNALIST',
          status: 'ACTIVE',
          emailVerified: true,
        },
      });

      // Créer ou trouver le média
      let mediaOrg = await this.prisma.mediaOrganization.findFirst({
        where: { name: d.media },
      });
      if (!mediaOrg) {
        mediaOrg = await this.prisma.mediaOrganization.create({
          data: { name: d.media, type: d.mediaType, city: 'Abidjan' },
        });
      }

      // Créer le profil journaliste
      const journalist = await this.prisma.journalist.create({
        data: {
          userId: user.id,
          mediaOrganizationId: mediaOrg.id,
          specialties: d.specialties,
          coverageZone: d.zone,
          languages: ['fr'],
          accreditationStatus: 'VALIDATED',
          accreditedAt: new Date(),
          tier: d.tier,
          fcmReliabilityScore: 70 + Math.random() * 30,
        },
      });

      results.push({ id: journalist.id, name: d.fullName, media: d.media });
    }

    return { seeded: results.length, journalists: results };
  }
}
