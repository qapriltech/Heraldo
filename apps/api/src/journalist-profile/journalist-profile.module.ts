import { Module } from '@nestjs/common';
import { JournalistProfileController } from './journalist-profile.controller';
import { JournalistProfileService } from './journalist-profile.service';

@Module({
  controllers: [JournalistProfileController],
  providers: [JournalistProfileService],
  exports: [JournalistProfileService],
})
export class JournalistProfileModule {}
