import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OdooSyncService } from './odoo-sync.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller()
export class OdooSyncController {
  constructor(private readonly service: OdooSyncService) {}

  // ---- Public webhook endpoint (no auth) ----

  @Post('v1/webhooks/odoo')
  handleWebhook(@Body() body: any) {
    return this.service.handleWebhook(body);
  }

  // ---- Admin endpoints ----

  @Get('admin/odoo-sync/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getStatus() {
    return this.service.getStatus();
  }

  @Post('admin/odoo-sync/resync/:entityType/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  resync(
    @Param('entityType') entityType: string,
    @Param('id') id: string,
  ) {
    return this.service.resync(entityType, id);
  }

  @Get('admin/odoo-sync/queue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getQueue(@Query() query: any) {
    return this.service.getQueue(query);
  }

  @Get('admin/odoo-sync/errors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getErrors(@Query() query: any) {
    return this.service.getErrors(query);
  }
}
