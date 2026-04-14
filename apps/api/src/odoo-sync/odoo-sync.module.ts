import { Module } from '@nestjs/common';
import { OdooSyncController } from './odoo-sync.controller';
import { OdooSyncService } from './odoo-sync.service';

@Module({
  controllers: [OdooSyncController],
  providers: [OdooSyncService],
  exports: [OdooSyncService],
})
export class OdooSyncModule {}
