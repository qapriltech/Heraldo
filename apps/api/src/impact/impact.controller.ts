import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ImpactService } from './impact.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('impact')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ImpactController {
  constructor(private readonly service: ImpactService) {}

  @Post('reports')
  @Roles('INSTITUTION', 'ADMIN')
  generateReport(@Req() req: any, @Body() body: any) {
    return this.service.generateReport(req.user.institutionId, body);
  }

  @Get('reports')
  findAllReports(@Req() req: any, @Query() query: any) {
    return this.service.findAllReports(req.user.institutionId, query);
  }

  @Get('reports/:id')
  findReport(@Param('id') id: string) {
    return this.service.findReport(id);
  }

  @Get('reach/:communiqueId')
  calculateReach(@Param('communiqueId') communiqueId: string) {
    return this.service.calculateReach(communiqueId);
  }

  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.service.getDashboard(req.user.institutionId);
  }

  @Get('media-coverage')
  getMediaCoverage(@Req() req: any, @Query('period') period: string) {
    return this.service.getMediaCoverage(req.user.institutionId, period);
  }

  @Get('reports/:id/export')
  exportReport(@Param('id') id: string, @Query('format') format: string) {
    return this.service.exportReport(id, format);
  }
}
