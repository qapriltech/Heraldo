import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminUsageService } from './admin-usage.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('admin/usage')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminUsageController {
  constructor(private readonly service: AdminUsageService) {}

  @Post('events')
  trackEvent(@Body() body: any) {
    return this.service.trackEvent(body);
  }

  @Get('clients/:id')
  getClientUsage(@Param('id') id: string, @Query() query: any) {
    return this.service.getClientUsage(id, query);
  }

  @Get('clients/:id/health-score')
  getClientHealthScore(@Param('id') id: string) {
    return this.service.getClientHealthScore(id);
  }

  @Get('at-risk')
  getAtRiskClients(@Query() query: any) {
    return this.service.getAtRiskClients(query);
  }

  @Get('top-users')
  getTopUsers(@Query() query: any) {
    return this.service.getTopUsers(query);
  }

  @Get('upsell-opportunities')
  getUpsellOpportunities(@Query() query: any) {
    return this.service.getUpsellOpportunities(query);
  }

  @Get('cohort-retention')
  getCohortRetention(@Query() query: any) {
    return this.service.getCohortRetention(query);
  }
}
