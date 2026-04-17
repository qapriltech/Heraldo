import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ArchiveService } from './archive.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('archive')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ArchiveController {
  constructor(private readonly service: ArchiveService) {}

  @Get('documents')
  listDocuments(@Query() query: any) {
    return this.service.listDocuments(query.institutionId, query);
  }

  @Post('documents')
  @Roles('INSTITUTION', 'AGENCY', 'ADMIN')
  createDocument(@Body() body: any) {
    return this.service.createDocument(body.institutionId, {
      title: body.title,
      documentType: body.documentType,
      contentText: body.contentText,
      sourceEntityType: body.sourceEntityType,
      sourceEntityId: body.sourceEntityId,
      isPublic: body.isPublic,
      tags: body.tags,
      fileUrl: body.fileUrl,
      metadata: body.metadata,
    });
  }

  @Get('documents/:id')
  getDocument(@Param('id') id: string) {
    return this.service.getDocument(id);
  }

  @Get('documents/:id/certificate')
  getCertificate(@Param('id') id: string) {
    return this.service.getCertificate(id);
  }

  @Post('import')
  @Roles('INSTITUTION', 'AGENCY', 'ADMIN')
  importDocuments(@Body() body: any) {
    return this.service.importDocuments(body.institutionId, body.documents || []);
  }
}
