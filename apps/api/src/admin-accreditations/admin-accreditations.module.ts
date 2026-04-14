import { Module } from '@nestjs/common';
import { AdminAccreditationsController } from './admin-accreditations.controller';
import { AdminAccreditationsService } from './admin-accreditations.service';

@Module({
  controllers: [AdminAccreditationsController],
  providers: [AdminAccreditationsService],
  exports: [AdminAccreditationsService],
})
export class AdminAccreditationsModule {}
