import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminSubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any) {
    throw new Error('Not implemented');
  }

  async findOne(id: string) {
    throw new Error('Not implemented');
  }

  async create(data: any) {
    throw new Error('Not implemented');
  }

  async update(id: string, data: any) {
    throw new Error('Not implemented');
  }

  async remove(id: string) {
    throw new Error('Not implemented');
  }

  async activate(id: string) {
    throw new Error('Not implemented');
  }

  async suspend(id: string, reason?: string) {
    throw new Error('Not implemented');
  }

  async reactivate(id: string) {
    throw new Error('Not implemented');
  }

  async cancel(id: string, reason?: string) {
    throw new Error('Not implemented');
  }

  async upgrade(id: string, data: any) {
    throw new Error('Not implemented');
  }

  async renew(id: string) {
    throw new Error('Not implemented');
  }

  async findExpiring(query: any) {
    throw new Error('Not implemented');
  }

  async findOverdue(query: any) {
    throw new Error('Not implemented');
  }
}
