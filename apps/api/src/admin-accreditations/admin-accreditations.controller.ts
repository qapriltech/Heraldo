import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdminAccreditationsService } from './admin-accreditations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller()
export class AdminAccreditationsController {
  constructor(private readonly service: AdminAccreditationsService) {}

  // ---- Public endpoint (no auth) ----

  @Post('v1/public/accreditation-requests')
  submitPublicRequest(@Body() body: any) {
    return this.service.submitPublicRequest(body);
  }

  // ---- Admin endpoints ----

  @Get('admin/accreditations/requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  listRequests(@Query() query: any) {
    return this.service.listRequests(query);
  }

  @Get('admin/accreditations/requests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getRequest(@Param('id') id: string) {
    return this.service.getRequest(id);
  }

  @Post('admin/accreditations/requests/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  approveRequest(@Param('id') id: string, @Req() req: any) {
    return this.service.approveRequest(id, req.user?.id);
  }

  @Post('admin/accreditations/requests/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  rejectRequest(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    return this.service.rejectRequest(id, reason, req.user?.id);
  }

  @Post('admin/accreditations/requests/:id/hold')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  holdRequest(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @Req() req: any,
  ) {
    return this.service.holdRequest(id, notes, req.user?.id);
  }

  @Post('admin/accreditations/:journalistId/revoke')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  revokeAccreditation(
    @Param('journalistId') journalistId: string,
    @Body() body: any,
  ) {
    return this.service.revokeAccreditation(journalistId, body);
  }

  @Get('admin/accreditations/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getStats() {
    return this.service.getStats();
  }
}
