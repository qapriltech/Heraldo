import { Module } from '@nestjs/common';
import { AdminUsageController } from './admin-usage.controller';
import { AdminUsageService } from './admin-usage.service';

@Module({
  controllers: [AdminUsageController],
  providers: [AdminUsageService],
  exports: [AdminUsageService],
})
export class AdminUsageModule {}
