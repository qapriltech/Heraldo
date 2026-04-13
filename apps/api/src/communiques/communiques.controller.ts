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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommuniquesService } from './communiques.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('communiques')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommuniquesController {
  constructor(private readonly service: CommuniquesService) {}

  @Post()
  @Roles('INSTITUTION', 'AGENCY', 'ADMIN')
  create(@Req() req: any, @Body() body: any) {
    return this.service.create(req.user.id, {
      title: body.title,
      chapeau: body.chapeau,
      bodyContent: body.bodyContent,
      contactPresse: body.contactPresse,
      institutionId: body.institutionId,
    });
  }

  @Get()
  findAll(@Req() req: any, @Query() query: any) {
    return this.service.findAll(req.user.id, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles('INSTITUTION', 'AGENCY', 'ADMIN')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @Roles('INSTITUTION', 'AGENCY', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Get(':id/hash')
  getHash(@Param('id') id: string) {
    return this.service.computeHash(id);
  }

  @Post(':id/diffuse')
  @Roles('INSTITUTION', 'AGENCY', 'ADMIN')
  diffuse(@Param('id') id: string, @Body() body: any) {
    return this.service.diffuse(id, {
      journalistIds: body.journalistIds,
      channels: body.channels,
    });
  }

  @Get(':id/diffusion-status')
  getDiffusionStatus(@Param('id') id: string) {
    return this.service.getDiffusionStatus(id);
  }
}
