import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AgoraService {
  constructor(private readonly prisma: PrismaService) {}

  async createRoom(userId: string, data: any) {
    throw new Error('Not implemented');
  }

  async findAllRooms(query: any) {
    throw new Error('Not implemented');
  }

  async findRoom(id: string) {
    throw new Error('Not implemented');
  }

  async updateRoom(id: string, data: any) {
    throw new Error('Not implemented');
  }

  async deleteRoom(id: string) {
    throw new Error('Not implemented');
  }

  async inviteParticipants(roomId: string, userIds: string[]) {
    throw new Error('Not implemented');
  }

  async startRoom(roomId: string) {
    throw new Error('Not implemented');
  }

  async endRoom(roomId: string) {
    throw new Error('Not implemented');
  }

  async joinRoom(roomId: string, userId: string) {
    throw new Error('Not implemented');
  }

  async leaveRoom(roomId: string, userId: string) {
    throw new Error('Not implemented');
  }

  async getRoomParticipants(roomId: string) {
    throw new Error('Not implemented');
  }
}
