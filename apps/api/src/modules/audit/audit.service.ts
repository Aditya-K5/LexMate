import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(protected readonly prisma: PrismaService) {}

  getStatus() {
    return { module: 'audit', status: 'initialized' };
  }
}
