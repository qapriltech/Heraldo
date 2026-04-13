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
  @Roles('INSTITUTION', 'ADMIN')
  createPool(@Req() req: any, @Body() body: any) {
    return this.service.createPool(req.user.id, body);
  }

  @Get('pools')
  findAllPools(@Query() query: any) {
    return this.service.findAllPools(query);
  }

  @Get('pools/:id')
  findPool(@Param('id') id: string) {
    return this.service.findPool(id);
  }

  @Post('pools/:id/fund')
  @Roles('INSTITUTION', 'ADMIN')
  fundPool(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Body('paymentMethod') paymentMethod: string,
  ) {
    return this.service.fundPool(id, amount, paymentMethod);
  }

  @Post('pools/:id/invite')
  @Roles('INSTITUTION', 'ADMIN')
  inviteJournalists(@Param('id') id: string, @Body('journalistIds') journalistIds: string[]) {
    return this.service.inviteJournalists(id, journalistIds);
  }

  @Post('pools/:id/proof')
  @Roles('JOURNALIST')
  submitProof(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.service.submitProof(id, req.user.id, body);
  }

  @Put('pools/:id/proof/:proofId/validate')
  @Roles('INSTITUTION', 'ADMIN')
  validateProof(
    @Param('id') id: string,
    @Param('proofId') proofId: string,
    @Body('approved') approved: boolean,
  ) {
    return this.service.validateProof(id, proofId, approved);
  }

  @Post('pools/:id/auto-pay')
  @Roles('INSTITUTION', 'ADMIN')
  autoPay(@Param('id') id: string) {
    return this.service.autoPay(id);
  }

  @Get('pools/:id/stats')
  getPoolStats(@Param('id') id: string) {
    return this.service.getPoolStats(id);
  }
}
