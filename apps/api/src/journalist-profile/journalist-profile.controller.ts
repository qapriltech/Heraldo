import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JournalistProfileService } from './journalist-profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('journalist-profile')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JournalistProfileController {
  constructor(private readonly service: JournalistProfileService) {}

  @Get('me')
  @Roles('JOURNALIST')
  getMyProfile(@Req() req: any) {
    return this.service.getMyProfile(req.user.id);
  }

  @Patch('me')
  @Roles('JOURNALIST')
  updateMyProfile(@Req() req: any, @Body() body: any) {
    return this.service.updateMyProfile(req.user.id, body);
  }

  @Post('me/photo')
  @Roles('JOURNALIST')
  uploadPhoto(@Req() req: any, @Body() body: any) {
    return this.service.uploadPhoto(req.user.id, body);
  }

  @Get('me/completion')
  @Roles('JOURNALIST')
  getCompletion(@Req() req: any) {
    return this.service.getCompletion(req.user.id);
  }

  @Get('me/publications')
  @Roles('JOURNALIST')
  getMyPublications(@Req() req: any, @Query() query: any) {
    return this.service.getMyPublications(req.user.id, query);
  }

  @Post('me/publications')
  @Roles('JOURNALIST')
  createPublication(@Req() req: any, @Body() body: any) {
    return this.service.createPublication(req.user.id, body);
  }

  @Patch('me/publications/:id')
  @Roles('JOURNALIST')
  updatePublication(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.service.updatePublication(req.user.id, id, body);
  }

  @Delete('me/publications/:id')
  @Roles('JOURNALIST')
  deletePublication(@Req() req: any, @Param('id') id: string) {
    return this.service.deletePublication(req.user.id, id);
  }

  @Get('public/:slug')
  getPublicProfile(@Param('slug') slug: string) {
    return this.service.getPublicProfile(slug);
  }
}
