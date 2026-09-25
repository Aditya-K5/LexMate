import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@CurrentTenant() organizationId: string) {
    return this.usersService.findAll(organizationId);
  }

  @Get(':id')
  async findOne(@CurrentTenant() organizationId: string, @Param('id') id: string) {
    return this.usersService.findOne(organizationId, id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') creatorId: string,
    @Body() dto: CreateUserDto,
  ) {
    return this.usersService.create(organizationId, creatorId, dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') updaterId: string,
    @Param('id') targetUserId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(organizationId, updaterId, targetUserId, dto);
  }

  @Public()
  @Get('status')
  getStatus() {
    return this.usersService.getStatus();
  }
}
