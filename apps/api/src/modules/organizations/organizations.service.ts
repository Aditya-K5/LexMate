import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(protected readonly prisma: PrismaService) {}

  getStatus() {
    return { module: 'organizations', status: 'initialized' };
  }
}
