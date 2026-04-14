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
import { ForumService } from './forum.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('forum')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ForumController {
  constructor(private readonly service: ForumService) {}

  @Get('channels')
  @Roles('JOURNALIST', 'ADMIN')
  getChannels(@Query() query: any) {
    return this.service.getChannels(query);
  }

  @Post('channels')
  @Roles('JOURNALIST', 'ADMIN')
  createChannel(@Req() req: any, @Body() body: any) {
    return this.service.createChannel(req.user.id, body);
  }

  @Get('channels/:id/posts')
  @Roles('JOURNALIST', 'ADMIN')
  getChannelPosts(@Param('id') id: string, @Query() query: any) {
    return this.service.getChannelPosts(id, query);
  }

  @Post('channels/:id/posts')
  @Roles('JOURNALIST')
  createPost(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.service.createPost(req.user.id, id, body);
  }

  @Get('posts/:id')
  @Roles('JOURNALIST', 'ADMIN')
  getPost(@Param('id') id: string) {
    return this.service.getPost(id);
  }

  @Patch('posts/:id')
  @Roles('JOURNALIST', 'ADMIN')
  updatePost(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.service.updatePost(req.user.id, id, body);
  }

  @Delete('posts/:id')
  @Roles('JOURNALIST', 'ADMIN')
  deletePost(@Req() req: any, @Param('id') id: string) {
    return this.service.deletePost(req.user.id, id);
  }

  @Post('posts/:id/react')
  @Roles('JOURNALIST')
  reactToPost(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.service.reactToPost(req.user.id, id, body);
  }

  @Post('posts/:id/replies')
  @Roles('JOURNALIST')
  createReply(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.service.createReply(req.user.id, id, body);
  }

  @Post('posts/:id/report')
  @Roles('JOURNALIST')
  reportPost(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.service.reportPost(req.user.id, id, body);
  }

  @Post('posts/:id/pin')
  @Roles('ADMIN')
  pinPost(@Req() req: any, @Param('id') id: string) {
    return this.service.pinPost(req.user.id, id);
  }
}
