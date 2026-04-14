import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminSubscriptionsService } from './admin-subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminSubscriptionsController {
  constructor(private readonly service: AdminSubscriptionsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('expiring')
  findExpiring(@Query() query: any) {
    return this.service.findExpiring(query);
  }

  @Get('overdue')
  findOverdue(@Query() query: any) {
    return this.service.findOverdue(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/activate')
  activate(@Param('id') id: string) {
    return this.service.activate(id);
  }

  @Post(':id/suspend')
  suspend(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.service.suspend(id, reason);
  }

  @Post(':id/reactivate')
  reactivate(@Param('id') id: string) {
    return this.service.reactivate(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.service.cancel(id, reason);
  }

  @Post(':id/upgrade')
  upgrade(@Param('id') id: string, @Body() body: any) {
    return this.service.upgrade(id, body);
  }

  @Post(':id/renew')
  renew(@Param('id') id: string) {
    return this.service.renew(id);
  }
}
