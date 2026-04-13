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
import { AgoraService } from './agora.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('agora')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgoraController {
  constructor(private readonly service: AgoraService) {}

  @Post('rooms')
  @Roles('INSTITUTION', 'ADMIN')
  createRoom(@Req() req: any, @Body() body: any) {
    return this.service.createRoom(req.user.id, body);
  }

  @Get('rooms')
  findAllRooms(@Query() query: any) {
    return this.service.findAllRooms(query);
  }

  @Get('rooms/:id')
  findRoom(@Param('id') id: string) {
    return this.service.findRoom(id);
  }

  @Put('rooms/:id')
  @Roles('INSTITUTION', 'ADMIN')
  updateRoom(@Param('id') id: string, @Body() body: any) {
    return this.service.updateRoom(id, body);
  }

  @Delete('rooms/:id')
  @Roles('INSTITUTION', 'ADMIN')
  deleteRoom(@Param('id') id: string) {
    return this.service.deleteRoom(id);
  }

  @Post('rooms/:id/invite')
  @Roles('INSTITUTION', 'ADMIN')
  inviteParticipants(@Param('id') id: string, @Body('userIds') userIds: string[]) {
    return this.service.inviteParticipants(id, userIds);
  }

  @Post('rooms/:id/start')
  @Roles('INSTITUTION', 'ADMIN')
  startRoom(@Param('id') id: string) {
    return this.service.startRoom(id);
  }

  @Post('rooms/:id/end')
  @Roles('INSTITUTION', 'ADMIN')
  endRoom(@Param('id') id: string) {
    return this.service.endRoom(id);
  }

  @Post('rooms/:id/join')
  joinRoom(@Param('id') id: string, @Req() req: any) {
    return this.service.joinRoom(id, req.user.id);
  }

  @Post('rooms/:id/leave')
  leaveRoom(@Param('id') id: string, @Req() req: any) {
    return this.service.leaveRoom(id, req.user.id);
  }

  @Get('rooms/:id/participants')
  getRoomParticipants(@Param('id') id: string) {
    return this.service.getRoomParticipants(id);
  }
}
