import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(protected readonly prisma: PrismaService) {}

  getStatus() {
    return { module: 'tasks', status: 'initialized' };
  }
}
