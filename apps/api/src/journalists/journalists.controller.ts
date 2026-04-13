import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JournalistsService } from './journalists.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('journalists')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JournalistsController {
  constructor(private readonly service: JournalistsService) {}

  @Get('me')
  @Roles('JOURNALIST')
  getProfile(@Req() req: any) {
    return this.service.getProfile(req.user.id);
  }

  @Put('me')
  @Roles('JOURNALIST')
  updateProfile(@Req() req: any, @Body() body: any) {
    return this.service.updateProfile(req.user.id, body);
  }

  @Get('me/devices')
  @Roles('JOURNALIST')
  getDevices(@Req() req: any) {
    return this.service.getDevices(req.user.id);
  }

  @Post('me/devices')
  @Roles('JOURNALIST')
  registerDevice(@Req() req: any, @Body() body: any) {
    return this.service.registerDevice(req.user.id, body);
  }

  @Delete('me/devices/:deviceId')
  @Roles('JOURNALIST')
  removeDevice(@Req() req: any, @Param('deviceId') deviceId: string) {
    return this.service.removeDevice(req.user.id, deviceId);
  }

  @Get('me/mobile-money')
  @Roles('JOURNALIST')
  getMobileMoney(@Req() req: any) {
    return this.service.getMobileMoney(req.user.id);
  }

  @Put('me/mobile-money')
  @Roles('JOURNALIST')
  updateMobileMoney(@Req() req: any, @Body() body: any) {
    return this.service.updateMobileMoney(req.user.id, body);
  }

  @Get('me/accreditations')
  @Roles('JOURNALIST')
  getAccreditations(@Req() req: any) {
    return this.service.getAccreditations(req.user.id);
  }

  @Get('me/earnings')
  @Roles('JOURNALIST')
  getEarnings(@Req() req: any, @Query() query: any) {
    return this.service.getEarnings(req.user.id, query);
  }
}
