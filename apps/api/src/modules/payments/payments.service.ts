import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(protected readonly prisma: PrismaService) {}

  getStatus() {
    return { module: 'payments', status: 'initialized' };
  }
}
