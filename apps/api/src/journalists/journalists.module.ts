import { Module } from '@nestjs/common';
import { JournalistsController } from './journalists.controller';
import { JournalistsService } from './journalists.service';

@Module({
  controllers: [JournalistsController],
  providers: [JournalistsService],
  exports: [JournalistsService],
})
export class JournalistsModule {}
