import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieve current organization profile and member statistics.
   */
  async getCurrent(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        _count: {
          select: {
            users: true,
            cases: true,
            clients: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      },
      stats: {
        totalMembers: organization._count.users,
        totalCases: organization._count.cases,
        totalClients: organization._count.clients,
      },
    };
  }

  /**
   * Update organization profile (Admin only).
   */
  async updateCurrent(organizationId: string, userId: string, dto: UpdateOrganizationDto) {
    const existing = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Organization not found');
    }

    const updated = await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
      },
    });

    // Record audit event
    await this.prisma.auditLog
      .create({
        data: {
          organizationId,
          userId,
          action: 'ORGANIZATION_UPDATED',
          entityType: 'Organization',
          entityId: organizationId,
          details: { changes: { ...dto } },
        },
      })
      .catch(() => null);

    return updated;
  }

  getStatus() {
    return { module: 'organizations', status: 'ready' };
  }
}
