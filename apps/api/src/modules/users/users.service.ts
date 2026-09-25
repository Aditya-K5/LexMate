import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { SafeUser } from '@lexmate/types';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all users strictly scoped to the calling organization.
   */
  async findAll(organizationId: string): Promise<SafeUser[]> {
    const users = await this.prisma.user.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'asc' },
    });

    return users.map((u) => this.toSafeUser(u));
  }

  /**
   * Find single user strictly enforcing organization isolation.
   */
  async findOne(organizationId: string, userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Strict multi-tenancy verification
    if (user.organizationId !== organizationId) {
      throw new ForbiddenException(
        'Access denied: You do not have permission to view users in another organization',
      );
    }

    return this.toSafeUser(user);
  }

  /**
   * Add a new team member to the organization (Admin only).
   */
  async create(organizationId: string, creatorId: string, dto: CreateUserDto): Promise<SafeUser> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('A user with this email address already exists');
    }

    const rawPassword = dto.password || `Welcome${Math.random().toString(36).substring(2, 8)}!`;
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        organizationId,
        email: normalizedEmail,
        name: dto.name.trim(),
        passwordHash,
        role: dto.role,
        phone: dto.phone?.trim(),
        isActive: true,
      },
    });

    // Audit log
    await this.prisma.auditLog
      .create({
        data: {
          organizationId,
          userId: creatorId,
          action: 'USER_CREATED',
          entityType: 'User',
          entityId: user.id,
          details: { email: user.email, role: user.role, name: user.name },
        },
      })
      .catch(() => null);

    return this.toSafeUser(user);
  }

  /**
   * Update team member role or status (Admin only).
   */
  async update(
    organizationId: string,
    updaterId: string,
    targetUserId: string,
    dto: UpdateUserDto,
  ): Promise<SafeUser> {
    const existing = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    // Tenant check
    if (existing.organizationId !== organizationId) {
      throw new ForbiddenException(
        'Access denied: You cannot modify a user belonging to another organization',
      );
    }

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.role ? { role: dto.role } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone?.trim() } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });

    // If deactivated, revoke all active sessions
    if (dto.isActive === false) {
      await this.prisma.session.updateMany({
        where: { userId: targetUserId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    // Audit log
    await this.prisma.auditLog
      .create({
        data: {
          organizationId,
          userId: updaterId,
          action: 'USER_UPDATED',
          entityType: 'User',
          entityId: targetUserId,
          details: { changes: { ...dto } },
        },
      })
      .catch(() => null);

    return this.toSafeUser(updated);
  }

  private toSafeUser(user: PrismaUser): SafeUser {
    const { passwordHash: _hash, ...safe } = user;
    return safe;
  }

  getStatus() {
    return { module: 'users', status: 'ready' };
  }
}
