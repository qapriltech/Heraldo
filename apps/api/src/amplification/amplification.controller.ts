import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AmplificationService } from './amplification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('amplification')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AmplificationController {
  constructor(private readonly service: AmplificationService) {}

  @Post('campaigns')
  @Roles('INSTITUTION', 'ADMIN')
  createCampaign(@Req() req: any, @Body() body: any) {
    return this.service.createCampaign(req.user.id, body);
  }

  @Get('campaigns')
  findAllCampaigns(@Req() req: any, @Query() query: any) {
    return this.service.findAllCampaigns(req.user.institutionId, query);
  }

  @Get('campaigns/:id')
  findCampaign(@Param('id') id: string) {
    return this.service.findCampaign(id);
  }

  @Put('campaigns/:id')
  @Roles('INSTITUTION', 'ADMIN')
  updateCampaign(@Param('id') id: string, @Body() body: any) {
    return this.service.updateCampaign(id, body);
  }

  @Delete('campaigns/:id')
  @Roles('INSTITUTION', 'ADMIN')
  deleteCampaign(@Param('id') id: string) {
    return this.service.deleteCampaign(id);
  }

  @Post('campaigns/:id/post')
  @Roles('INSTITUTION', 'ADMIN')
  postToSocial(@Param('id') id: string, @Body('platforms') platforms: string[]) {
    return this.service.postToSocial(id, platforms);
  }

  @Get('campaigns/:id/stats')
  getCampaignStats(@Param('id') id: string) {
    return this.service.getCampaignStats(id);
  }

  @Post('campaigns/:id/schedule')
  @Roles('INSTITUTION', 'ADMIN')
  schedulePost(@Param('id') id: string, @Body('scheduledAt') scheduledAt: string) {
    return this.service.schedulePost(id, scheduledAt);
  }
}
