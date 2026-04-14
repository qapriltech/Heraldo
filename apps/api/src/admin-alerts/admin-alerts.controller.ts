import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminAlertsService } from './admin-alerts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('admin/alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminAlertsController {
  constructor(private readonly service: AdminAlertsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Patch(':id/acknowledge')
  acknowledge(@Param('id') id: string) {
    return this.service.acknowledge(id);
  }

  @Patch(':id/resolve')
  resolve(@Param('id') id: string, @Body('notes') notes?: string) {
    return this.service.resolve(id, notes);
  }

  @Get('stats')
  getStats() {
    return this.service.getStats();
  }
}
