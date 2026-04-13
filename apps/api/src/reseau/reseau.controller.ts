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
import { ReseauService } from './reseau.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('reseau')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReseauController {
  constructor(private readonly service: ReseauService) {}

  @Get('journalists')
  searchJournalists(@Query() query: any) {
    return this.service.searchJournalists(query);
  }

  @Get('journalists/:id')
  getJournalistProfile(@Param('id') id: string) {
    return this.service.getJournalistProfile(id);
  }

  @Post('accreditations')
  @Roles('INSTITUTION', 'ADMIN')
  createAccreditation(@Req() req: any, @Body() body: any) {
    return this.service.createAccreditation(req.user.institutionId, body.journalistId, body);
  }

  @Get('accreditations')
  listAccreditations(@Req() req: any, @Query() query: any) {
    return this.service.listAccreditations(req.user.institutionId, query);
  }

  @Put('accreditations/:id')
  @Roles('INSTITUTION', 'ADMIN')
  updateAccreditation(@Param('id') id: string, @Body() body: any) {
    return this.service.updateAccreditation(id, body);
  }

  @Delete('accreditations/:id')
  @Roles('INSTITUTION', 'ADMIN')
  revokeAccreditation(@Param('id') id: string) {
    return this.service.revokeAccreditation(id);
  }

  @Get('accreditations/:id/verify')
  verifyAccreditation(@Param('id') id: string) {
    return this.service.verifyAccreditation(id);
  }
}
