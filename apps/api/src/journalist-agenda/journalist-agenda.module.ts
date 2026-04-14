import { Module } from '@nestjs/common';
import { JournalistAgendaController } from './journalist-agenda.controller';
import { JournalistAgendaService } from './journalist-agenda.service';

@Module({
  controllers: [JournalistAgendaController],
  providers: [JournalistAgendaService],
  exports: [JournalistAgendaService],
})
export class JournalistAgendaModule {}
