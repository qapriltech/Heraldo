import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayment(userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async findAllPayments(userId: string, query: any) {
    throw new Error('Not implemented');
  }

  async findPayment(id: string) {
    throw new Error('Not implemented');
  }

  async handleWaveWebhook(payload: any) {
    throw new Error('Not implemented');
  }

  async handleOrangeWebhook(payload: any) {
    throw new Error('Not implemented');
  }

  async handleMtnWebhook(payload: any) {
    throw new Error('Not implemented');
  }

  async handleMoovWebhook(payload: any) {
    throw new Error('Not implemented');
  }

  async getPaymentStatus(id: string) {
    throw new Error('Not implemented');
  }

  async refundPayment(id: string) {
    throw new Error('Not implemented');
  }
}
