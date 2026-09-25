import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CasesService {
  constructor(protected readonly prisma: PrismaService) {}

  getStatus() {
    return { module: 'cases', status: 'initialized' };
  }
}
