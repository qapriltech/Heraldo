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
import { InstitutionsService } from './institutions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('institutions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InstitutionsController {
  constructor(private readonly service: InstitutionsService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles('INSTITUTION', 'ADMIN')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @Roles('ADMIN')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Get(':id/users')
  getUsers(@Param('id') id: string) {
    return this.service.getUsers(id);
  }

  @Post(':id/users')
  @Roles('INSTITUTION', 'ADMIN')
  addUser(@Param('id') id: string, @Body('userId') userId: string, @Body('role') role: string) {
    return this.service.addUser(id, userId, role);
  }

  @Delete(':id/users/:userId')
  @Roles('INSTITUTION', 'ADMIN')
  removeUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.service.removeUser(id, userId);
  }

  @Get(':id/subscription')
  getSubscription(@Param('id') id: string) {
    return this.service.getSubscription(id);
  }

  @Put(':id/subscription')
  @Roles('INSTITUTION', 'ADMIN')
  updateSubscription(@Param('id') id: string, @Body('plan') plan: string) {
    return this.service.updateSubscription(id, plan);
  }
}
