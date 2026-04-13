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
import { AgendaService } from './agenda.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('agenda')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgendaController {
  constructor(private readonly service: AgendaService) {}

  @Get('items')
  listItems(@Req() req: any, @Query() query: any) {
    return this.service.listItems(req.user.id, query);
  }

  @Post('items')
  @Roles('INSTITUTION', 'ADMIN')
  createItem(@Req() req: any, @Body() body: any) {
    return this.service.createItem(req.user.id, body);
  }

  @Get('items/:itemId')
  getItem(@Param('itemId') itemId: string) {
    return this.service.getItem(itemId);
  }

  @Patch('items/:itemId')
  @Roles('INSTITUTION', 'ADMIN')
  updateItem(@Param('itemId') itemId: string, @Body() body: any) {
    return this.service.updateItem(itemId, body);
  }

  @Delete('items/:itemId')
  @Roles('INSTITUTION', 'ADMIN')
  deleteItem(@Param('itemId') itemId: string) {
    return this.service.deleteItem(itemId);
  }

  @Post('items/:itemId/link/:type')
  @Roles('INSTITUTION', 'ADMIN')
  linkEntity(@Param('itemId') itemId: string, @Param('type') type: string) {
    return this.service.linkEntity(itemId, type);
  }

  @Delete('items/:itemId/link/:type/:id')
  @Roles('INSTITUTION', 'ADMIN')
  unlinkEntity(
    @Param('itemId') itemId: string,
    @Param('type') type: string,
    @Param('id') id: string,
  ) {
    return this.service.unlinkEntity(itemId, type, id);
  }

  @Get('calendar')
  getCalendar(@Query('year') year: string, @Query('month') month: string) {
    return this.service.getCalendar(year, month);
  }

  @Get('recurring-suggestions')
  getRecurringSuggestions(@Req() req: any) {
    return this.service.getRecurringSuggestions(req.user.id);
  }

  @Patch('items/:itemId/checklist/:taskIdx')
  @Roles('INSTITUTION', 'ADMIN')
  toggleChecklistItem(
    @Param('itemId') itemId: string,
    @Param('taskIdx') taskIdx: string,
  ) {
    return this.service.toggleChecklistItem(itemId, parseInt(taskIdx, 10));
  }
}
