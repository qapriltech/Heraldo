import { Module } from '@nestjs/common';
import { AccreditController } from './accredit.controller';
import { AccreditService } from './accredit.service';

@Module({
  controllers: [AccreditController],
  providers: [AccreditService],
  exports: [AccreditService],
})
export class AccreditModule {}
