import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class InstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    throw new Error('Not implemented');
  }

  async findAll(query: any) {
    throw new Error('Not implemented');
  }

  async findOne(id: string) {
    throw new Error('Not implemented');
  }

  async update(id: string, data: any) {
    throw new Error('Not implemented');
  }

  async delete(id: string) {
    throw new Error('Not implemented');
  }

  async getUsers(institutionId: string) {
    throw new Error('Not implemented');
  }

  async addUser(institutionId: string, userId: string, role: string) {
    throw new Error('Not implemented');
  }

  async removeUser(institutionId: string, userId: string) {
    throw new Error('Not implemented');
  }

  async getSubscription(institutionId: string) {
    throw new Error('Not implemented');
  }

  async updateSubscription(institutionId: string, plan: string) {
    throw new Error('Not implemented');
  }
}
