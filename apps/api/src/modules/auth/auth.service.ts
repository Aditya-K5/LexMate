import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(protected readonly prisma: PrismaService) {}

  getStatus() {
    return { module: 'auth', status: 'initialized' };
  }
}
