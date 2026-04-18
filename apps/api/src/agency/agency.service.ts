import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AgencyService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helpers ───────────────────────────────────────────────

  private async ensureOwnership(agencyUserId: string, clientId: string) {
    const client = await this.prisma.agencyClient.findUnique({
      where: { id: clientId },
    });
    if (!client) throw new NotFoundException('Client not found');
    if (client.agencyUserId !== agencyUserId) {
      throw new ForbiddenException('Not your client');
    }
    return client;
  }

  // ── Clients CRUD ──────────────────────────────────────────

  async createClient(agencyUserId: string, data: any) {
    if (!data.clientName || !data.clientSector || !data.contactName || !data.contactEmail) {
      throw new BadRequestException(
        'clientName, clientSector, contactName, and contactEmail are required',
      );
    }

    return this.prisma.agencyClient.create({
      data: {
        agencyUserId,
        clientName: data.clientName,
        clientLogo: data.clientLogo ?? null,
        clientSector: data.clientSector,
        clientBrandColor: data.clientBrandColor ?? null,
        clientBrief: data.clientBrief ?? null,
        clientTone: data.clientTone ?? null,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone ?? null,
      },
    });
  }

  async listClients(agencyUserId: string, query: any) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const where: any = { agencyUserId };
    if (query.active !== undefined) {
      where.isActive = query.active === 'true';
    }

    const [data, total] = await Promise.all([
      this.prisma.agencyClient.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { reports: true, timeEntries: true } },
        },
      }),
      this.prisma.agencyClient.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getClient(agencyUserId: string, id: string) {
    const client = await this.prisma.agencyClient.findUnique({
      where: { id },
      include: {
        reports: { orderBy: { generatedAt: 'desc' }, take: 5 },
        whiteLabel: true,
        _count: { select: { reports: true, timeEntries: true } },
      },
    });
    if (!client) throw new NotFoundException('Client not found');
    if (client.agencyUserId !== agencyUserId) {
      throw new ForbiddenException('Not your client');
    }
    return client;
  }

  async updateClient(agencyUserId: string, id: string, data: any) {
    await this.ensureOwnership(agencyUserId, id);

    return this.prisma.agencyClient.update({
      where: { id },
      data: {
        clientName: data.clientName ?? undefined,
        clientLogo: data.clientLogo ?? undefined,
        clientSector: data.clientSector ?? undefined,
        clientBrandColor: data.clientBrandColor ?? undefined,
        clientBrief: data.clientBrief ?? undefined,
        clientTone: data.clientTone ?? undefined,
        contactName: data.contactName ?? undefined,
        contactEmail: data.contactEmail ?? undefined,
        contactPhone: data.contactPhone ?? undefined,
        isActive: data.isActive ?? undefined,
      },
    });
  }

  async deactivateClient(agencyUserId: string, id: string) {
    await this.ensureOwnership(agencyUserId, id);

    return this.prisma.agencyClient.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ── Dashboard ─────────────────────────────────────────────

  async getDashboard(agencyUserId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const clients = await this.prisma.agencyClient.findMany({
      where: { agencyUserId },
      include: {
        _count: { select: { reports: true, timeEntries: true } },
        reports: { orderBy: { generatedAt: 'desc' }, take: 1 },
      },
    });

    const activeClients = clients.filter((c) => c.isActive).length;

    // Aggregate KPIs from latest reports
    let totalCommuniques = 0;
    let totalReach = 0;
    for (const client of clients) {
      if (client.reports.length > 0) {
        totalCommuniques += client.reports[0].communiquesSent;
        totalReach += client.reports[0].estimatedReach;
      }
    }

    // Total time logged this month
    const timeThisMonth = await this.prisma.agencyTimeEntry.aggregate({
      where: {
        agencyClientId: { in: clients.map((c) => c.id) },
        date: { gte: monthStart },
      },
      _sum: { durationMinutes: true },
    });

    return {
      activeClients,
      totalClients: clients.length,
      totalCommuniques,
      totalReach,
      timeLoggedThisMonth: timeThisMonth._sum.durationMinutes ?? 0,
      clients: clients.map((c) => ({
        id: c.id,
        clientName: c.clientName,
        clientSector: c.clientSector,
        clientLogo: c.clientLogo,
        clientBrandColor: c.clientBrandColor,
        isActive: c.isActive,
        reportsCount: c._count.reports,
        timeEntriesCount: c._count.timeEntries,
        lastReport: c.reports[0] ?? null,
        updatedAt: c.updatedAt,
      })),
    };
  }

  // ── Reports ───────────────────────────────────────────────

  async generateReport(agencyUserId: string, clientId: string, data: any) {
    await this.ensureOwnership(agencyUserId, clientId);

    const reportMonth =
      data.reportMonth ??
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    // Calculate stats — aggregate from existing reports or pass supplied values
    const report = await this.prisma.agencyClientReport.create({
      data: {
        agencyClientId: clientId,
        reportMonth,
        communiquesSent: data.communiquesSent ?? 0,
        avgOpenRate: data.avgOpenRate ?? 0,
        estimatedReach: data.estimatedReach ?? 0,
        topJournalists: data.topJournalists ?? null,
        mentions: data.mentions ?? 0,
        recommendations: data.recommendations ?? null,
        pdfUrl: data.pdfUrl ?? null,
      },
    });

    return report;
  }

  async listReports(agencyUserId: string, clientId: string) {
    await this.ensureOwnership(agencyUserId, clientId);

    return this.prisma.agencyClientReport.findMany({
      where: { agencyClientId: clientId },
      orderBy: { generatedAt: 'desc' },
    });
  }

  async getReportPdf(
    agencyUserId: string,
    clientId: string,
    reportId: string,
  ) {
    await this.ensureOwnership(agencyUserId, clientId);

    const report = await this.prisma.agencyClientReport.findUnique({
      where: { id: reportId },
    });
    if (!report || report.agencyClientId !== clientId) {
      throw new NotFoundException('Report not found');
    }

    return { pdfUrl: report.pdfUrl, reportMonth: report.reportMonth };
  }

  // ── Time Entries ──────────────────────────────────────────

  async logTime(agencyUserId: string, clientId: string, data: any) {
    await this.ensureOwnership(agencyUserId, clientId);

    if (!data.description || !data.durationMinutes) {
      throw new BadRequestException(
        'description and durationMinutes are required',
      );
    }

    return this.prisma.agencyTimeEntry.create({
      data: {
        agencyClientId: clientId,
        userId: agencyUserId,
        description: data.description,
        durationMinutes: data.durationMinutes,
        date: data.date ? new Date(data.date) : new Date(),
        billable: data.billable ?? true,
      },
    });
  }

  async listTimeEntries(
    agencyUserId: string,
    clientId: string,
    query: any,
  ) {
    await this.ensureOwnership(agencyUserId, clientId);

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.agencyTimeEntry.findMany({
        where: { agencyClientId: clientId },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.agencyTimeEntry.count({
        where: { agencyClientId: clientId },
      }),
    ]);

    return { data, total, page, limit };
  }

  // ── White Label ───────────────────────────────────────────

  async configureWhiteLabel(
    agencyUserId: string,
    clientId: string,
    data: any,
  ) {
    await this.ensureOwnership(agencyUserId, clientId);

    if (!data.senderName || !data.senderEmail) {
      throw new BadRequestException(
        'senderName and senderEmail are required',
      );
    }

    return this.prisma.agencyWhiteLabel.upsert({
      where: { agencyClientId: clientId },
      create: {
        agencyClientId: clientId,
        senderName: data.senderName,
        senderEmail: data.senderEmail,
        emailSignatureHtml: data.emailSignatureHtml ?? null,
        reportBranding: data.reportBranding ?? 'client',
        logoOverrideUrl: data.logoOverrideUrl ?? null,
      },
      update: {
        senderName: data.senderName ?? undefined,
        senderEmail: data.senderEmail ?? undefined,
        emailSignatureHtml: data.emailSignatureHtml ?? undefined,
        reportBranding: data.reportBranding ?? undefined,
        logoOverrideUrl: data.logoOverrideUrl ?? undefined,
      },
    });
  }

  async getWhiteLabel(agencyUserId: string, clientId: string) {
    await this.ensureOwnership(agencyUserId, clientId);

    const wl = await this.prisma.agencyWhiteLabel.findUnique({
      where: { agencyClientId: clientId },
    });
    if (!wl) throw new NotFoundException('White label config not found');
    return wl;
  }

  // ── Switch Client Context ─────────────────────────────────

  async switchClient(agencyUserId: string, clientId: string) {
    const client = await this.ensureOwnership(agencyUserId, clientId);

    return {
      activeClientId: client.id,
      clientName: client.clientName,
      clientSector: client.clientSector,
      clientBrandColor: client.clientBrandColor,
      message: 'Client context switched successfully',
    };
  }
}
