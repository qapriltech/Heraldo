import { Module } from '@nestjs/common';
import { ReseauController } from './reseau.controller';
import { ReseauService } from './reseau.service';

@Module({
  controllers: [ReseauController],
  providers: [ReseauService],
  exports: [ReseauService],
})
export class ReseauModule {}
