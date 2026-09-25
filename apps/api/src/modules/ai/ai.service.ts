import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(protected readonly prisma: PrismaService) {}

  getStatus() {
    return { module: 'ai', status: 'initialized', controlledByBackend: true };
  }
}
