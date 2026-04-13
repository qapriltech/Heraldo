import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StudioService } from './studio.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('studio')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudioController {
  constructor(private readonly service: StudioService) {}

  @Get('templates')
  listTemplates(@Query() query: any) {
    return this.service.listTemplates(query);
  }

  @Get('templates/:id')
  getTemplate(@Param('id') id: string) {
    return this.service.getTemplate(id);
  }

  @Post('brand-kit')
  @Roles('INSTITUTION', 'ADMIN')
  upsertBrandKit(@Req() req: any, @Body() body: any) {
    return this.service.upsertBrandKit(req.user.id, body);
  }

  @Get('brand-kit')
  getBrandKit(@Req() req: any) {
    return this.service.getBrandKit(req.user.id);
  }

  @Post('render')
  @Roles('INSTITUTION', 'ADMIN')
  render(@Req() req: any, @Body() body: any) {
    return this.service.render(req.user.id, body);
  }

  @Get('visuals')
  listVisuals(@Req() req: any) {
    return this.service.listVisuals(req.user.id);
  }

  @Delete('visuals/:id')
  @Roles('INSTITUTION', 'ADMIN')
  deleteVisual(@Param('id') id: string) {
    return this.service.deleteVisual(id);
  }

  @Post('upload-image')
  @Roles('INSTITUTION', 'ADMIN')
  uploadImage(@Req() req: any, @Body() body: any) {
    return this.service.uploadImage(req.user.id, body);
  }
}
