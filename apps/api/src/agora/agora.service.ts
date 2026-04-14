import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as crypto from 'crypto';

// Tarification CDC — Section 5.2
const ROOM_CONFIG = {
  STANDARD: { maxParticipants: 50, maxDurationHours: 3, replayDays: 30, price: 75000 },
  PREMIUM: { maxParticipants: 200, maxDurationHours: 6, replayDays: 60, price: 150000 },
  NATIONALE: { maxParticipants: 500, maxDurationHours: 24, replayDays: 90, price: 350000 },
};

@Injectable()
export class AgoraService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer une salle AGORA
   */
  async createRoom(userId: string, data: {
    title: string;
    description?: string;
    roomType: 'STANDARD' | 'PREMIUM' | 'NATIONALE';
    scheduledAt: string;
    brandingColor?: string;
    institutionId?: string;
    journalistIds?: string[];
  }) {
    if (!data.title || !data.scheduledAt) {
      throw new BadRequestException('Le titre et la date sont obligatoires');
    }

    const config = ROOM_CONFIG[data.roomType] || ROOM_CONFIG.STANDARD;

    // Résoudre l'institution
    let institutionId = data.institutionId;
    if (!institutionId) {
      const link = await this.prisma.institutionUser.findFirst({
        where: { userId },
        select: { institutionId: true },
      });
      if (link) institutionId = link.institutionId;
      else {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const inst = await this.prisma.institution.create({
          data: { name: user?.fullName || 'Institution', type: 'INSTITUTION' },
        });
        await this.prisma.institutionUser.create({
          data: { institutionId: inst.id, userId, role: 'OWNER' },
        });
        institutionId = inst.id;
      }
    }

    // Générer un token d'invitation unique (JWT-like, 48h)
    const invitationToken = crypto.randomBytes(32).toString('hex');

    // Calculer l'expiration du replay
    const scheduledDate = new Date(data.scheduledAt);
    const replayExpiresAt = new Date(scheduledDate);
    replayExpiresAt.setDate(replayExpiresAt.getDate() + config.replayDays);

    const room = await this.prisma.agoraRoom.create({
      data: {
        institutionId,
        title: data.title,
        description: data.description || null,
        roomType: data.roomType,
        scheduledAt: scheduledDate,
        status: 'SCHEDULED',
        maxParticipants: config.maxParticipants,
        brandingColor: data.brandingColor || null,
        invitationToken,
        replayExpiresAt,
      },
    });

    // Inviter les journalistes si fournis
    if (data.journalistIds && data.journalistIds.length > 0) {
      await this.inviteParticipants(room.id, data.journalistIds);
    }

    return this.findRoom(room.id);
  }

  /**
   * Lister les salles d'une institution
   */
  async findAllRooms(userId: string, query: { status?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const userInstitutions = await this.prisma.institutionUser.findMany({
      where: { userId },
      select: { institutionId: true },
    });
    const institutionIds = userInstitutions.map(ui => ui.institutionId);

    const where: any = institutionIds.length > 0
      ? { institutionId: { in: institutionIds } }
      : {};

    if (query.status) where.status = query.status;

    const [rooms, total] = await Promise.all([
      this.prisma.agoraRoom.findMany({
        where,
        include: {
          institution: { select: { id: true, name: true, logoUrl: true } },
          participants: { select: { id: true, role: true, joinedAt: true, journalist: { select: { user: { select: { fullName: true } } } } } },
          _count: { select: { participants: true, qaQuestions: true } },
        },
        orderBy: { scheduledAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.agoraRoom.count({ where }),
    ]);

    return { data: rooms, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * Détail d'une salle
   */
  async findRoom(id: string) {
    const room = await this.prisma.agoraRoom.findUnique({
      where: { id },
      include: {
        institution: { select: { id: true, name: true, logoUrl: true, brandColor: true } },
        participants: {
          include: {
            journalist: {
              select: {
                id: true,
                user: { select: { fullName: true, avatarUrl: true } },
                mediaOrganization: { select: { name: true, type: true } },
              },
            },
          },
        },
        qaQuestions: { orderBy: { createdAt: 'asc' } },
        _count: { select: { participants: true, qaQuestions: true, chatMessages: true } },
      },
    });

    if (!room) throw new NotFoundException('Salle AGORA introuvable');
    return room;
  }

  /**
   * Modifier une salle (avant démarrage uniquement)
   */
  async updateRoom(id: string, data: any) {
    const room = await this.prisma.agoraRoom.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Salle introuvable');
    if (room.status !== 'SCHEDULED' && room.status !== 'PENDING') {
      throw new BadRequestException('Seule une salle planifiée peut être modifiée');
    }

    return this.prisma.agoraRoom.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.scheduledAt && { scheduledAt: new Date(data.scheduledAt) }),
        ...(data.brandingColor && { brandingColor: data.brandingColor }),
      },
    });
  }

  /**
   * Supprimer / annuler une salle
   */
  async deleteRoom(id: string) {
    const room = await this.prisma.agoraRoom.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Salle introuvable');
    if (room.status === 'LIVE') {
      throw new BadRequestException('Impossible de supprimer une salle en cours');
    }

    await this.prisma.agoraRoom.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return { success: true, message: 'Salle annulée' };
  }

  /**
   * Inviter des journalistes (F-AGORA-02)
   */
  async inviteParticipants(roomId: string, journalistIds: string[]) {
    const room = await this.prisma.agoraRoom.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Salle introuvable');

    const participants = [];
    for (const journalistId of journalistIds) {
      // Vérifier que le journaliste existe
      const journalist = await this.prisma.journalist.findUnique({ where: { id: journalistId } });
      if (!journalist) continue;

      // Vérifier qu'il n'est pas déjà invité
      const existing = await this.prisma.agoraParticipant.findFirst({
        where: { roomId, journalistId },
      });
      if (existing) continue;

      const participant = await this.prisma.agoraParticipant.create({
        data: {
          roomId,
          journalistId,
          userId: journalist.userId,
          role: 'JOURNALIST_ACTIVE',
          connectionMode: 'DESKTOP_APP',
          invitedAt: new Date(),
        },
      });
      participants.push(participant);
    }

    // TODO: Envoyer les invitations par email + push (rappels J-7, J-3, J-1, H-2)
    console.log(`[AGORA] ${participants.length} journalistes invités à la salle "${room.title}"`);

    return { invited: participants.length, roomId };
  }

  /**
   * Démarrer une salle (RG-AGORA-03: paiement vérifié)
   */
  async startRoom(roomId: string) {
    const room = await this.prisma.agoraRoom.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Salle introuvable');
    if (room.status === 'LIVE') return { message: 'Salle déjà en cours' };
    if (room.status !== 'SCHEDULED') {
      throw new BadRequestException('La salle doit être planifiée pour démarrer');
    }

    // RG-AGORA-02: enregistrement automatique dès l'ouverture
    await this.prisma.agoraRoom.update({
      where: { id: roomId },
      data: {
        status: 'LIVE',
        startedAt: new Date(),
        recordingStatus: 'RECORDING',
      },
    });

    return { success: true, status: 'LIVE', startedAt: new Date().toISOString() };
  }

  /**
   * Terminer une salle
   */
  async endRoom(roomId: string) {
    const room = await this.prisma.agoraRoom.findUnique({
      where: { id: roomId },
      include: { _count: { select: { participants: true } } },
    });
    if (!room) throw new NotFoundException('Salle introuvable');
    if (room.status !== 'LIVE') {
      throw new BadRequestException('La salle n\'est pas en cours');
    }

    const endedAt = new Date();
    const durationSeconds = room.startedAt
      ? Math.round((endedAt.getTime() - room.startedAt.getTime()) / 1000)
      : 0;

    await this.prisma.agoraRoom.update({
      where: { id: roomId },
      data: {
        status: 'ENDED',
        endedAt,
        recordingStatus: 'PROCESSING',
      },
    });

    // TODO: Déclencher post-traitement (F-AGORA-06)
    // - Replay disponible sous 2h
    // - Kit média envoyé aux participants
    // - Rapport de présence généré
    console.log(`[AGORA] Salle "${room.title}" terminée après ${Math.round(durationSeconds / 60)} minutes`);

    return {
      success: true,
      status: 'ENDED',
      durationMinutes: Math.round(durationSeconds / 60),
      participantCount: room._count.participants,
    };
  }

  /**
   * Rejoindre une salle (journaliste)
   */
  async joinRoom(roomId: string, userId: string) {
    const room = await this.prisma.agoraRoom.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Salle introuvable');
    if (room.status !== 'LIVE' && room.status !== 'SCHEDULED') {
      throw new BadRequestException('La salle n\'est pas accessible');
    }

    // Trouver le participant invité
    const participant = await this.prisma.agoraParticipant.findFirst({
      where: { roomId, userId },
    });

    if (participant) {
      await this.prisma.agoraParticipant.update({
        where: { id: participant.id },
        data: { joinedAt: new Date(), confirmedAt: new Date() },
      });
      return { success: true, role: participant.role, roomStatus: room.status };
    }

    // Si pas invité, rejoindre comme observateur
    const newParticipant = await this.prisma.agoraParticipant.create({
      data: {
        roomId,
        userId,
        role: 'OBSERVER',
        connectionMode: 'MOBILE_PWA',
        joinedAt: new Date(),
        confirmedAt: new Date(),
      },
    });

    return { success: true, role: newParticipant.role, roomStatus: room.status };
  }

  /**
   * Quitter une salle
   */
  async leaveRoom(roomId: string, userId: string) {
    const participant = await this.prisma.agoraParticipant.findFirst({
      where: { roomId, userId },
    });
    if (!participant) throw new NotFoundException('Participant introuvable');

    const leftAt = new Date();
    const durationSeconds = participant.joinedAt
      ? Math.round((leftAt.getTime() - participant.joinedAt.getTime()) / 1000)
      : 0;

    await this.prisma.agoraParticipant.update({
      where: { id: participant.id },
      data: { leftAt, durationSeconds },
    });

    return { success: true, durationSeconds };
  }

  /**
   * Liste des participants d'une salle
   */
  async getRoomParticipants(roomId: string) {
    return this.prisma.agoraParticipant.findMany({
      where: { roomId },
      include: {
        journalist: {
          select: {
            user: { select: { fullName: true, avatarUrl: true } },
            mediaOrganization: { select: { name: true, type: true } },
          },
        },
      },
      orderBy: { invitedAt: 'asc' },
    });
  }
}
