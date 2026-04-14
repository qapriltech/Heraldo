import { Module } from '@nestjs/common';
import { JournalistDirectoryController } from './journalist-directory.controller';
import { JournalistDirectoryService } from './journalist-directory.service';

@Module({
  controllers: [JournalistDirectoryController],
  providers: [JournalistDirectoryService],
  exports: [JournalistDirectoryService],
})
export class JournalistDirectoryModule {}
