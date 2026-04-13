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
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('crm')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CrmController {
  constructor(private readonly service: CrmService) {}

  @Get('journalists')
  listJournalists(@Query() query: any) {
    return this.service.listJournalists(query);
  }

  @Get('journalists/:id')
  getJournalist(@Param('id') id: string) {
    return this.service.getJournalist(id);
  }

  @Get('journalists/:id/timeline')
  getJournalistTimeline(@Param('id') id: string, @Query() query: any) {
    return this.service.getJournalistTimeline(id, query);
  }

  @Post('journalists/:id/interactions')
  @Roles('INSTITUTION', 'ADMIN')
  addInteraction(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: any,
  ) {
    return this.service.addInteraction(id, req.user.id, body);
  }

  @Get('journalists/:id/notes')
  listNotes(@Param('id') id: string, @Req() req: any) {
    return this.service.listNotes(id, req.user.id);
  }

  @Post('journalists/:id/notes')
  @Roles('INSTITUTION', 'ADMIN')
  createNote(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.service.createNote(id, req.user.id, body);
  }

  @Patch('notes/:noteId')
  @Roles('INSTITUTION', 'ADMIN')
  updateNote(
    @Param('noteId') noteId: string,
    @Req() req: any,
    @Body() body: any,
  ) {
    return this.service.updateNote(noteId, req.user.id, body);
  }

  @Delete('notes/:noteId')
  @Roles('INSTITUTION', 'ADMIN')
  deleteNote(@Param('noteId') noteId: string, @Req() req: any) {
    return this.service.deleteNote(noteId, req.user.id);
  }

  @Get('birthdays-upcoming')
  getUpcomingBirthdays() {
    return this.service.getUpcomingBirthdays();
  }

  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.service.getDashboard(req.user.id);
  }
}
