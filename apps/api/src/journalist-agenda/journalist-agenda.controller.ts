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
import { JournalistAgendaService } from './journalist-agenda.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('journalist-agenda')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JournalistAgendaController {
  constructor(private readonly service: JournalistAgendaService) {}

  @Get('items')
  @Roles('JOURNALIST')
  getItems(@Req() req: any, @Query() query: any) {
    return this.service.getItems(req.user.id, query);
  }

  @Post('items')
  @Roles('JOURNALIST')
  createItem(@Req() req: any, @Body() body: any) {
    return this.service.createItem(req.user.id, body);
  }

  @Patch('items/:id')
  @Roles('JOURNALIST')
  updateItem(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.service.updateItem(req.user.id, id, body);
  }

  @Delete('items/:id')
  @Roles('JOURNALIST')
  deleteItem(@Req() req: any, @Param('id') id: string) {
    return this.service.deleteItem(req.user.id, id);
  }

  @Get('today')
  @Roles('JOURNALIST')
  getToday(@Req() req: any) {
    return this.service.getToday(req.user.id);
  }

  @Get('upcoming')
  @Roles('JOURNALIST')
  getUpcoming(@Req() req: any, @Query() query: any) {
    return this.service.getUpcoming(req.user.id, query);
  }

  @Get('ical-export')
  @Roles('JOURNALIST')
  getIcalExport(@Req() req: any) {
    return this.service.getIcalExport(req.user.id);
  }
}
