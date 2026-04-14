import { Module } from '@nestjs/common';
import { JournalistNotificationsController } from './journalist-notifications.controller';
import { JournalistNotificationsService } from './journalist-notifications.service';

@Module({
  controllers: [JournalistNotificationsController],
  providers: [JournalistNotificationsService],
  exports: [JournalistNotificationsService],
})
export class JournalistNotificationsModule {}
