import { Controller, Get, Post, Delete, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { VeilleService } from './veille.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('veille')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VeilleController {
  constructor(private readonly service: VeilleService) {}

  // ── Keywords ─────────────────────────────────────────

  @Post('keywords')
  @Roles('INSTITUTION', 'AGENCY', 'ADMIN')
  createKeyword(@Req() req: any, @Body() body: any) {
    return this.service.createKeyword(body.institutionId, {
      keyword: body.keyword,
      weight: body.weight,
      alertThreshold: body.alertThreshold,
    });
  }

  @Get('keywords')
  listKeywords(@Query('institutionId') institutionId: string) {
    return this.service.listKeywords(institutionId);
  }

  @Delete('keywords/:id')
  @Roles('INSTITUTION', 'AGENCY', 'ADMIN')
  deleteKeyword(@Param('id') id: string) {
    return this.service.deleteKeyword(id);
  }

  // ── Mentions ─────────────────────────────────────────

  @Get('mentions')
  listMentions(@Query() query: any) {
    return this.service.listMentions(query.institutionId, query);
  }

  // ── Alerts ───────────────────────────────────────────

  @Get('alerts')
  listAlerts(@Query('institutionId') institutionId: string) {
    return this.service.listAlerts(institutionId);
  }

  @Patch('alerts/:id/acknowledge')
  acknowledgeAlert(@Param('id') id: string, @Req() req: any) {
    return this.service.acknowledgeAlert(id, req.user.id);
  }

  // ── Rapport ──────────────────────────────────────────

  @Get('rapport')
  getRapport(@Query('institutionId') institutionId: string, @Query('period') period: 'daily' | 'weekly') {
    return this.service.generateRapport(institutionId, period || 'daily');
  }
}
