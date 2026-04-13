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
import { InboxService } from './inbox.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('inbox')
export class InboxController {
  constructor(private readonly service: InboxService) {}

  @Get('channels')
  @UseGuards(JwtAuthGuard, RolesGuard)
  listChannels(@Req() req: any) {
    return this.service.listChannels(req.user.id);
  }

  @Post('channels/:type/connect')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTITUTION', 'ADMIN')
  connectChannel(
    @Req() req: any,
    @Param('type') type: string,
    @Body() body: any,
  ) {
    return this.service.connectChannel(req.user.id, type, body);
  }

  @Delete('channels/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTITUTION', 'ADMIN')
  disconnectChannel(@Param('id') id: string) {
    return this.service.disconnectChannel(id);
  }

  @Get('messages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  listMessages(@Req() req: any, @Query() query: any) {
    return this.service.listMessages(req.user.id, query);
  }

  @Get('messages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getMessage(@Param('id') id: string) {
    return this.service.getMessage(id);
  }

  @Patch('messages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTITUTION', 'ADMIN')
  updateMessage(@Param('id') id: string, @Body() body: any) {
    return this.service.updateMessage(id, body);
  }

  @Post('messages/:id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTITUTION', 'ADMIN')
  replyToMessage(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.service.replyToMessage(id, req.user.id, body);
  }

  @Post('messages/:id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTITUTION', 'ADMIN')
  archiveMessage(@Param('id') id: string) {
    return this.service.archiveMessage(id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getStats(@Req() req: any) {
    return this.service.getStats(req.user.id);
  }

  @Post('webhooks/whatsapp')
  handleWhatsappWebhook(@Body() body: any) {
    return this.service.handleWhatsappWebhook(body);
  }

  @Post('webhooks/gmail')
  handleGmailWebhook(@Body() body: any) {
    return this.service.handleGmailWebhook(body);
  }
}
