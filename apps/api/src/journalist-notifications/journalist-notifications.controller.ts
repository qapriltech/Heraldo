import {
  Controller,
  Get,
  Patch,
  Put,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JournalistNotificationsService } from './journalist-notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('journalist-notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JournalistNotificationsController {
  constructor(private readonly service: JournalistNotificationsService) {}

  @Get()
  @Roles('JOURNALIST')
  getNotifications(@Req() req: any, @Query() query: any) {
    return this.service.getNotifications(req.user.id, query);
  }

  @Get('unread-count')
  @Roles('JOURNALIST')
  getUnreadCount(@Req() req: any) {
    return this.service.getUnreadCount(req.user.id);
  }

  @Patch(':id/read')
  @Roles('JOURNALIST')
  markAsRead(@Req() req: any, @Param('id') id: string) {
    return this.service.markAsRead(req.user.id, id);
  }

  @Patch('read-all')
  @Roles('JOURNALIST')
  markAllAsRead(@Req() req: any) {
    return this.service.markAllAsRead(req.user.id);
  }

  @Patch(':id/archive')
  @Roles('JOURNALIST')
  archive(@Req() req: any, @Param('id') id: string) {
    return this.service.archive(req.user.id, id);
  }

  @Get('preferences')
  @Roles('JOURNALIST')
  getPreferences(@Req() req: any) {
    return this.service.getPreferences(req.user.id);
  }

  @Put('preferences')
  @Roles('JOURNALIST')
  updatePreferences(@Req() req: any, @Body() body: any) {
    return this.service.updatePreferences(req.user.id, body);
  }
}
