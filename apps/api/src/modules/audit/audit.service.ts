import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';

export interface CreateAuditLogParams {
  organizationId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Record a new audit log entry within an organization boundary.
   */
  async log(params: CreateAuditLogParams) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          organizationId: params.organizationId,
          userId: params.userId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          details: params.details as Prisma.InputJsonValue | undefined,
          ipAddress: params.ipAddress,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to write audit log for organization ${params.organizationId} [${params.action}]: ${
          error instanceof Error ? error.message : error
        }`,
      );
      // Non-blocking in production so business transactions succeed even if logging fails
      return null;
    }
  }

  /**
   * Retrieve paginated audit logs scoped strictly to the calling user's organization.
   */
  async findLogs(organizationId: string, query: QueryAuditLogsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {
      organizationId,
    };

    if (query.action) {
      where.action = { contains: query.action, mode: 'insensitive' };
    }
    if (query.entityType) {
      where.entityType = { contains: query.entityType, mode: 'insensitive' };
    }
    if (query.userId) {
      where.userId = query.userId;
    }

    const [total, data] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  getStatus() {
    return { module: 'audit', status: 'ready' };
  }
}
