import { Controller, Get, Post, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { CitizenService } from './citizen.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('citizen')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CitizenController {
  constructor(private readonly service: CitizenService) {}

  @Get('subscribers')
  listSubscribers(@Query() query: any) {
    return this.service.listSubscribers(query.institutionId, query);
  }

  @Post('subscribers/import')
  @Roles('INSTITUTION', 'AGENCY', 'ADMIN')
  importSubscribers(@Body() body: any) {
    return this.service.importSubscribers(body.institutionId, body.subscribers || []);
  }

  @Delete('subscribers/:id')
  @Roles('INSTITUTION', 'AGENCY', 'ADMIN')
  deleteSubscriber(@Param('id') id: string) {
    return this.service.deleteSubscriber(id);
  }

  @Post('messages')
  @Roles('INSTITUTION', 'AGENCY', 'ADMIN')
  createMessage(@Body() body: any) {
    return this.service.createMessage(body.institutionId, {
      title: body.title,
      content: body.content,
      messageType: body.messageType || 'info',
      channels: body.channels || ['sms'],
      targetCommunes: body.targetCommunes || [],
    });
  }

  @Get('messages')
  listMessages(@Query() query: any) {
    return this.service.listMessages(query.institutionId, query);
  }

  @Get('messages/:id/stats')
  getMessageStats(@Param('id') id: string) {
    return this.service.getMessageStats(id);
  }
}
