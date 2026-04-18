import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AgencyService } from './agency.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('agency')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('AGENCY', 'ADMIN')
export class AgencyController {
  constructor(private readonly service: AgencyService) {}

  // ── Clients CRUD ──────────────────────────────────────────

  @Post('clients')
  createClient(@Req() req: any, @Body() body: any) {
    return this.service.createClient(req.user.id, body);
  }

  @Get('clients')
  listClients(@Req() req: any, @Query() query: any) {
    return this.service.listClients(req.user.id, query);
  }

  @Get('clients/:id')
  getClient(@Req() req: any, @Param('id') id: string) {
    return this.service.getClient(req.user.id, id);
  }

  @Patch('clients/:id')
  updateClient(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.service.updateClient(req.user.id, id, body);
  }

  @Delete('clients/:id')
  deactivateClient(@Req() req: any, @Param('id') id: string) {
    return this.service.deactivateClient(req.user.id, id);
  }

  // ── Dashboard ─────────────────────────────────────────────

  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.service.getDashboard(req.user.id);
  }

  // ── Reports ───────────────────────────────────────────────

  @Post('clients/:id/report/generate')
  generateReport(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.service.generateReport(req.user.id, id, body);
  }

  @Get('clients/:id/reports')
  listReports(@Req() req: any, @Param('id') id: string) {
    return this.service.listReports(req.user.id, id);
  }

  @Get('clients/:id/report/:reportId/pdf')
  getReportPdf(
    @Req() req: any,
    @Param('id') id: string,
    @Param('reportId') reportId: string,
  ) {
    return this.service.getReportPdf(req.user.id, id, reportId);
  }

  // ── Time Entries ──────────────────────────────────────────

  @Post('clients/:id/time-entries')
  logTime(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.service.logTime(req.user.id, id, body);
  }

  @Get('clients/:id/time-entries')
  listTimeEntries(
    @Req() req: any,
    @Param('id') id: string,
    @Query() query: any,
  ) {
    return this.service.listTimeEntries(req.user.id, id, query);
  }

  // ── White Label ───────────────────────────────────────────

  @Post('clients/:id/white-label')
  configureWhiteLabel(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.service.configureWhiteLabel(req.user.id, id, body);
  }

  @Get('clients/:id/white-label')
  getWhiteLabel(@Req() req: any, @Param('id') id: string) {
    return this.service.getWhiteLabel(req.user.id, id);
  }

  // ── Switch Client Context ─────────────────────────────────

  @Post('switch/:clientId')
  switchClient(@Req() req: any, @Param('clientId') clientId: string) {
    return this.service.switchClient(req.user.id, clientId);
  }
}
