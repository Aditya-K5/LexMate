import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HearingsService {
  constructor(protected readonly prisma: PrismaService) {}

  getStatus() {
    return { module: 'hearings', status: 'initialized' };
  }
}
