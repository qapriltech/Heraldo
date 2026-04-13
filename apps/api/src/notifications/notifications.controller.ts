import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post('push')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INSTITUTION')
  sendPush(@Body('userId') userId: string, @Body() body: any) {
    return this.service.sendPush(userId, body);
  }

  @Post('email')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INSTITUTION')
  sendEmail(@Body('to') to: string, @Body('subject') subject: string, @Body('body') body: string) {
    return this.service.sendEmail(to, subject, body);
  }

  @Post('sms')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INSTITUTION')
  sendSms(@Body('phone') phone: string, @Body('message') message: string) {
    return this.service.sendSms(phone, message);
  }

  @Post('bulk')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INSTITUTION')
  sendBulk(@Body('userIds') userIds: string[], @Body() body: any) {
    return this.service.sendBulk(userIds, body);
  }

  @Get('me')
  getUserNotifications(@Req() req: any, @Query() query: any) {
    return this.service.getUserNotifications(req.user.id, query);
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }

  @Put('me/read-all')
  markAllAsRead(@Req() req: any) {
    return this.service.markAllAsRead(req.user.id);
  }

  @Get('me/unread-count')
  getUnreadCount(@Req() req: any) {
    return this.service.getUnreadCount(req.user.id);
  }
}
