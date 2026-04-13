import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.service.getDashboard();
  }

  @Get('stats')
  getStats(@Query('period') period: string) {
    return this.service.getStats(period);
  }

  @Get('users')
  listUsers(@Query() query: any) {
    return this.service.listUsers(query);
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.service.getUser(id);
  }

  @Put('users/:id')
  updateUser(@Param('id') id: string, @Body() body: any) {
    return this.service.updateUser(id, body);
  }

  @Post('users/:id/suspend')
  suspendUser(@Param('id') id: string) {
    return this.service.suspendUser(id);
  }

  @Post('users/:id/activate')
  activateUser(@Param('id') id: string) {
    return this.service.activateUser(id);
  }

  @Post('moderation/communiques/:id')
  moderateCommunique(
    @Param('id') id: string,
    @Body('action') action: string,
    @Body('reason') reason?: string,
  ) {
    return this.service.moderateCommunique(id, action, reason);
  }

  @Get('moderation/pending')
  listPendingModeration(@Query() query: any) {
    return this.service.listPendingModeration(query);
  }

  @Post('accreditations/:id')
  manageAccreditation(@Param('id') id: string, @Body('action') action: string) {
    return this.service.manageAccreditation(id, action);
  }

  @Get('accreditations/pending')
  listPendingAccreditations(@Query() query: any) {
    return this.service.listPendingAccreditations(query);
  }

  @Get('system/health')
  getSystemHealth() {
    return this.service.getSystemHealth();
  }

  @Get('audit-log')
  getAuditLog(@Query() query: any) {
    return this.service.getAuditLog(query);
  }
}
