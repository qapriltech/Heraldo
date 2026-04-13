import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BriefsService } from './briefs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('briefs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BriefsController {
  constructor(private readonly service: BriefsService) {}

  @Post()
  @Roles('INSTITUTION', 'ADMIN')
  create(@Req() req: any, @Body() body: any) {
    return this.service.create(req.user.id, body);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: any) {
    return this.service.findAll(req.user.id, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('INSTITUTION', 'ADMIN')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Post(':id/regenerate')
  @Roles('INSTITUTION', 'ADMIN')
  regenerate(@Param('id') id: string) {
    return this.service.regenerate(id);
  }

  @Get(':id/pdf')
  generatePdf(@Param('id') id: string) {
    return this.service.generatePdf(id);
  }
}
