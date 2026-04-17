import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './common/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CommuniquesModule } from './communiques/communiques.module';
import { AgoraModule } from './agora/agora.module';
import { FcmModule } from './fcm/fcm.module';
import { ReseauModule } from './reseau/reseau.module';
import { AmplificationModule } from './amplification/amplification.module';
import { ImpactModule } from './impact/impact.module';
import { PaymentsModule } from './payments/payments.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { JournalistsModule } from './journalists/journalists.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { SocialModule } from './social/social.module';
import { AgendaModule } from './agenda/agenda.module';
import { StudioModule } from './studio/studio.module';
import { InboxModule } from './inbox/inbox.module';
import { CrmModule } from './crm/crm.module';
import { BriefsModule } from './briefs/briefs.module';
import { JournalistProfileModule } from './journalist-profile/journalist-profile.module';
import { JournalistAgendaModule } from './journalist-agenda/journalist-agenda.module';
import { JournalistRevenuesModule } from './journalist-revenues/journalist-revenues.module';
import { JournalistDirectoryModule } from './journalist-directory/journalist-directory.module';
import { ForumModule } from './forum/forum.module';
import { JournalistNotificationsModule } from './journalist-notifications/journalist-notifications.module';
import { AdminSubscriptionsModule } from './admin-subscriptions/admin-subscriptions.module';
import { AdminUsageModule } from './admin-usage/admin-usage.module';
import { AdminAccreditationsModule } from './admin-accreditations/admin-accreditations.module';
import { AdminAlertsModule } from './admin-alerts/admin-alerts.module';
import { OdooSyncModule } from './odoo-sync/odoo-sync.module';
import { VeilleModule } from './veille/veille.module';
import { AnalyticsReportsModule } from './analytics-reports/analytics-reports.module';
import { CitizenModule } from './citizen/citizen.module';
import { ArchiveModule } from './archive/archive.module';
import { AccreditModule } from './accredit/accredit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CommuniquesModule,
    AgoraModule,
    FcmModule,
    ReseauModule,
    AmplificationModule,
    ImpactModule,
    PaymentsModule,
    InstitutionsModule,
    JournalistsModule,
    NotificationsModule,
    AdminModule,
    SocialModule,
    AgendaModule,
    StudioModule,
    InboxModule,
    CrmModule,
    BriefsModule,
    JournalistProfileModule,
    JournalistAgendaModule,
    JournalistRevenuesModule,
    JournalistDirectoryModule,
    ForumModule,
    JournalistNotificationsModule,
    AdminSubscriptionsModule,
    AdminUsageModule,
    AdminAccreditationsModule,
    AdminAlertsModule,
    OdooSyncModule,
    VeilleModule,
    AnalyticsReportsModule,
    CitizenModule,
    ArchiveModule,
    AccreditModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
