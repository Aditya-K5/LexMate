import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(protected readonly prisma: PrismaService) {}

  getStatus() {
    return { module: 'clients', status: 'initialized' };
  }
}
