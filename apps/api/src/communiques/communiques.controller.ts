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
import { CommuniquesService } from './communiques.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('communiques')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommuniquesController {
  constructor(private readonly service: CommuniquesService) {}

  @Post()
  @Roles('INSTITUTION', 'ADMIN')
  create(@Req() req: any, @Body() body: any) {
    return this.service.create(req.user.id, body);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: any) {
    return this.service.findAll(req.user.institutionId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles('INSTITUTION', 'ADMIN')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @Roles('INSTITUTION', 'ADMIN')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post(':id/generate')
  @Roles('INSTITUTION', 'ADMIN')
  generateFormat(@Param('id') id: string, @Body('format') format: 'pdf' | 'html' | 'txt') {
    return this.service.generateFormat(id, format);
  }

  @Get(':id/hash')
  getHash(@Param('id') id: string) {
    return this.service.computeHash(id);
  }

  @Post(':id/diffuse')
  @Roles('INSTITUTION', 'ADMIN')
  diffuse(@Param('id') id: string, @Body('channels') channels: string[]) {
    return this.service.diffuse(id, channels);
  }

  @Get(':id/diffusion-status')
  getDiffusionStatus(@Param('id') id: string) {
    return this.service.getDiffusionStatus(id);
  }
}
