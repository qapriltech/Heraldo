import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('social')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SocialController {
  constructor(private readonly service: SocialService) {}

  @Get('accounts')
  listAccounts(@Req() req: any) {
    return this.service.listAccounts(req.user.id);
  }

  @Get('oauth/:platform/authorize')
  oauthAuthorize(@Req() req: any, @Param('platform') platform: string) {
    return this.service.oauthAuthorize(req.user.id, platform);
  }

  @Get('oauth/:platform/callback')
  oauthCallback(@Param('platform') platform: string, @Query() query: any) {
    return this.service.oauthCallback(platform, query);
  }

  @Delete('accounts/:accountId')
  disconnectAccount(@Req() req: any, @Param('accountId') accountId: string) {
    return this.service.disconnectAccount(req.user.id, accountId);
  }

  @Post('posts')
  @Roles('INSTITUTION', 'ADMIN')
  createPost(@Req() req: any, @Body() body: any) {
    return this.service.createPost(req.user.id, body);
  }

  @Get('posts')
  listPosts(@Req() req: any, @Query() query: any) {
    return this.service.listPosts(req.user.id, query);
  }

  @Get('posts/:postId')
  getPost(@Param('postId') postId: string) {
    return this.service.getPost(postId);
  }

  @Patch('posts/:postId')
  @Roles('INSTITUTION', 'ADMIN')
  updatePost(@Param('postId') postId: string, @Body() body: any) {
    return this.service.updatePost(postId, body);
  }

  @Delete('posts/:postId')
  @Roles('INSTITUTION', 'ADMIN')
  deletePost(@Param('postId') postId: string) {
    return this.service.deletePost(postId);
  }

  @Post('posts/:postId/publish')
  @Roles('INSTITUTION', 'ADMIN')
  publishPost(@Param('postId') postId: string) {
    return this.service.publishPost(postId);
  }

  @Post('posts/:postId/approve')
  @Roles('INSTITUTION', 'ADMIN')
  approvePost(@Param('postId') postId: string, @Req() req: any) {
    return this.service.approvePost(postId, req.user.id);
  }

  @Get('posts/:postId/stats')
  getPostStats(@Param('postId') postId: string) {
    return this.service.getPostStats(postId);
  }
}
