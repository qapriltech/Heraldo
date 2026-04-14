import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReseauService } from './reseau.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { Public } from '../auth/public.decorator';

@Controller('reseau')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReseauController {
  constructor(private readonly service: ReseauService) {}

  @Get('journalists')
  searchJournalists(@Query() query: any) {
    return this.service.searchJournalists(query);
  }

  @Get('journalists/:id')
  getJournalistProfile(@Param('id') id: string) {
    return this.service.getJournalistProfile(id);
  }

  @Post('seed-demo')
  @Roles('ADMIN', 'INSTITUTION')
  seedDemo() {
    return this.service.seedDemoJournalists();
  }
}
