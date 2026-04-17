import { Module } from '@nestjs/common';
import { AnalyticsReportsController } from './analytics-reports.controller';
import { AnalyticsReportsService } from './analytics-reports.service';

@Module({
  controllers: [AnalyticsReportsController],
  providers: [AnalyticsReportsService],
  exports: [AnalyticsReportsService],
})
export class AnalyticsReportsModule {}
