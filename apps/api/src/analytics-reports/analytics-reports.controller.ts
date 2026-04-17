import { Controller, Get, Post, Query, Body, Req, UseGuards } from '@nestjs/common';
import { AnalyticsReportsService } from './analytics-reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsReportsController {
  constructor(private readonly service: AnalyticsReportsService) {}

  @Get('overview')
  getOverview(@Query('institutionId') institutionId: string) {
    return this.service.getOverview(institutionId);
  }

  @Get('communiques')
  getCommuniqueStats(@Query() query: any) {
    return this.service.getCommuniqueStats(query.institutionId, query);
  }

  @Get('journalistes')
  getJournalistRanking(@Query('institutionId') institutionId: string) {
    return this.service.getJournalistRanking(institutionId);
  }

  @Get('rapport/pdf')
  getRapportPdf(@Query('institutionId') institutionId: string) {
    return this.service.getRapportPdf(institutionId);
  }

  @Post('rapport/generate')
  @Roles('INSTITUTION', 'AGENCY', 'ADMIN')
  generateReport(@Body() body: any) {
    return this.service.generateReport(body.institutionId, body.reportType || 'monthly');
  }
}
