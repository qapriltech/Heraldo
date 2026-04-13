import { Module } from '@nestjs/common';
import { BriefsController } from './briefs.controller';
import { BriefsService } from './briefs.service';

@Module({
  controllers: [BriefsController],
  providers: [BriefsService],
  exports: [BriefsService],
})
export class BriefsModule {}
