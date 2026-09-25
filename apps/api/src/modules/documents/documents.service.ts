import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(protected readonly prisma: PrismaService) {}

  getStatus() {
    return { module: 'documents', status: 'initialized' };
  }
}
