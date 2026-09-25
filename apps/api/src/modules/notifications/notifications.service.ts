import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(protected readonly prisma: PrismaService) {}

  getStatus() {
    return { module: 'notifications', status: 'initialized' };
  }
}
