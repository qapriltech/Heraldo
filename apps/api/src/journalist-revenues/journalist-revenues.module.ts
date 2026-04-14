import { Module } from '@nestjs/common';
import { JournalistRevenuesController } from './journalist-revenues.controller';
import { JournalistRevenuesService } from './journalist-revenues.service';

@Module({
  controllers: [JournalistRevenuesController],
  providers: [JournalistRevenuesService],
  exports: [JournalistRevenuesService],
})
export class JournalistRevenuesModule {}
