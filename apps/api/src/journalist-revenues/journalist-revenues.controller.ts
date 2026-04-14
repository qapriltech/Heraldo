import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JournalistRevenuesService } from './journalist-revenues.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('journalist/revenues')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JournalistRevenuesController {
  constructor(private readonly service: JournalistRevenuesService) {}

  @Get('dashboard')
  @Roles('JOURNALIST')
  getDashboard(@Req() req: any, @Query() query: any) {
    return this.service.getDashboard(req.user.id, query);
  }

  @Get('by-event')
  @Roles('JOURNALIST')
  getByEvent(@Req() req: any, @Query() query: any) {
    return this.service.getByEvent(req.user.id, query);
  }

  @Get('by-institution')
  @Roles('JOURNALIST')
  getByInstitution(@Req() req: any, @Query() query: any) {
    return this.service.getByInstitution(req.user.id, query);
  }

  @Get('pending')
  @Roles('JOURNALIST')
  getPending(@Req() req: any, @Query() query: any) {
    return this.service.getPending(req.user.id, query);
  }

  @Get('chart')
  @Roles('JOURNALIST')
  getChart(@Req() req: any, @Query() query: any) {
    return this.service.getChart(req.user.id, query);
  }

  @Get('fiscal-export')
  @Roles('JOURNALIST')
  getFiscalExport(@Req() req: any, @Query() query: any) {
    return this.service.getFiscalExport(req.user.id, query);
  }
}
