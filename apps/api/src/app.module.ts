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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
