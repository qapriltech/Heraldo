import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AccreditService } from './accredit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('accredit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccreditController {
  constructor(private readonly service: AccreditService) {}

  @Post('cards')
  @Roles('INSTITUTION', 'AGENCY', 'ADMIN')
  issueCard(@Req() req: any, @Body() body: any) {
    return this.service.issueCard({
      journalistId: body.journalistId,
      institutionId: body.institutionId,
      accreditationType: body.accreditationType || 'annual',
      validFrom: body.validFrom || new Date().toISOString(),
      validUntil: body.validUntil,
      eventName: body.eventName,
      issuedBy: req.user.id,
    });
  }

  @Get('cards')
  listCards(@Query() query: any) {
    return this.service.listCards(query.institutionId, query);
  }

  @Get('cards/:id')
  getCard(@Param('id') id: string) {
    return this.service.getCard(id);
  }

  @Get('verify/:qrCode')
  verifyQr(@Param('qrCode') qrCode: string) {
    return this.service.verifyQr(qrCode);
  }

  @Patch('cards/:id/revoke')
  @Roles('INSTITUTION', 'AGENCY', 'ADMIN')
  revokeCard(@Param('id') id: string, @Body() body: any) {
    return this.service.revokeCard(id, body.reason);
  }

  @Get('stats')
  getStats(@Query('institutionId') institutionId: string) {
    return this.service.getStats(institutionId);
  }
}
