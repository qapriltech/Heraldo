import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createPayment(@Req() req: any, @Body() body: any) {
    return this.service.createPayment(req.user.id, body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAllPayments(@Req() req: any, @Query() query: any) {
    return this.service.findAllPayments(req.user.id, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findPayment(@Param('id') id: string) {
    return this.service.findPayment(id);
  }

  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  getPaymentStatus(@Param('id') id: string) {
    return this.service.getPaymentStatus(id);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard)
  refundPayment(@Param('id') id: string) {
    return this.service.refundPayment(id);
  }

  @Public()
  @Post('webhook/wave')
  @HttpCode(HttpStatus.OK)
  handleWaveWebhook(@Body() payload: any) {
    return this.service.handleWaveWebhook(payload);
  }

  @Public()
  @Post('webhook/orange')
  @HttpCode(HttpStatus.OK)
  handleOrangeWebhook(@Body() payload: any) {
    return this.service.handleOrangeWebhook(payload);
  }

  @Public()
  @Post('webhook/mtn')
  @HttpCode(HttpStatus.OK)
  handleMtnWebhook(@Body() payload: any) {
    return this.service.handleMtnWebhook(payload);
  }

  @Public()
  @Post('webhook/moov')
  @HttpCode(HttpStatus.OK)
  handleMoovWebhook(@Body() payload: any) {
    return this.service.handleMoovWebhook(payload);
  }
}
