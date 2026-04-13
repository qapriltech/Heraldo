import { Module } from '@nestjs/common';
import { CommuniquesController } from './communiques.controller';
import { CommuniquesService } from './communiques.service';

@Module({
  controllers: [CommuniquesController],
  providers: [CommuniquesService],
  exports: [CommuniquesService],
})
export class CommuniquesModule {}
