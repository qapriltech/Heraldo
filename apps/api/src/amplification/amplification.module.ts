import { Module } from '@nestjs/common';
import { AmplificationController } from './amplification.controller';
import { AmplificationService } from './amplification.service';

@Module({
  controllers: [AmplificationController],
  providers: [AmplificationService],
  exports: [AmplificationService],
})
export class AmplificationModule {}
