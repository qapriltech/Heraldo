import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FcmService } from './fcm.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('fcm')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FcmController {
  constructor(private readonly service: FcmService) {}

  @Post('pools')
  @Roles('INSTITUTION', 'AGENCY', 'ADMIN')
  createPool(@Req() req: any, @Body() body: any) {
    return this.service.createPool(req.user.id, body);
  }

  @Get('pools')
  findAllPools(@Req() req: any, @Query() query: any) {
    return this.service.findAllPools(req.user.id, query);
  }

  @Get('pools/:id')
  findPool(@Param('id') id: string) {
    return this.service.findPool(id);
  }

  @Post('pools/:id/fund')
  @Roles('INSTITUTION', 'AGENCY', 'ADMIN')
  fundPool(@Param('id') id: string, @Body() body: any) {
    return this.service.fundPool(id, body.amount, body.paymentMethod);
  }

  @Post('pools/:id/invite')
  @Roles('INSTITUTION', 'AGENCY', 'ADMIN')
  inviteJournalists(@Param('id') id: string, @Body('journalistIds') journalistIds: string[]) {
    return this.service.inviteJournalists(id, journalistIds);
  }

  @Post('pools/:id/proof')
  @Roles('JOURNALIST')
  submitProof(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.service.submitProof(id, req.user.id, body);
  }

  @Put('proofs/:proofId/validate')
  @Roles('ADMIN')
  validateProof(@Param('proofId') proofId: string, @Req() req: any, @Body() body: any) {
    return this.service.validateProof(body.poolId, proofId, {
      approved: body.approved,
      rejectReason: body.rejectReason,
      reviewerId: req.user.id,
    });
  }

  @Get('pools/:id/stats')
  getPoolStats(@Param('id') id: string) {
    return this.service.getPoolStats(id);
  }
}
