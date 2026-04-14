import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JournalistDirectoryService } from './journalist-directory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('journalist-directory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JournalistDirectoryController {
  constructor(private readonly service: JournalistDirectoryService) {}

  @Get('search')
  @Roles('JOURNALIST', 'ADMIN')
  search(@Query() query: any) {
    return this.service.search(query);
  }

  @Get('trending')
  @Roles('JOURNALIST', 'ADMIN')
  getTrending(@Query() query: any) {
    return this.service.getTrending(query);
  }

  @Get('me/followers')
  @Roles('JOURNALIST')
  getMyFollowers(@Req() req: any, @Query() query: any) {
    return this.service.getMyFollowers(req.user.id, query);
  }

  @Get('me/following')
  @Roles('JOURNALIST')
  getMyFollowing(@Req() req: any, @Query() query: any) {
    return this.service.getMyFollowing(req.user.id, query);
  }

  @Get(':slug')
  @Roles('JOURNALIST', 'ADMIN')
  getBySlug(@Param('slug') slug: string) {
    return this.service.getBySlug(slug);
  }

  @Post(':id/follow')
  @Roles('JOURNALIST')
  follow(@Req() req: any, @Param('id') id: string) {
    return this.service.follow(req.user.id, id);
  }

  @Delete(':id/follow')
  @Roles('JOURNALIST')
  unfollow(@Req() req: any, @Param('id') id: string) {
    return this.service.unfollow(req.user.id, id);
  }
}
