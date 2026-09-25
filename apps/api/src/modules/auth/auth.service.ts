import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponse, JwtPayload, SafeUser, UserRole } from '@lexmate/types';
import { Role, User as PrismaUser, Organization as PrismaOrg } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user and initialize their law firm / practice organization.
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    // Check existing user
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('An account with this email address already exists');
    }

    // Determine organization details
    const orgName = dto.organizationName?.trim() || `${dto.name.trim()}'s Practice`;
    let baseSlug = this.slugify(orgName);
    if (!baseSlug) baseSlug = 'law-practice';

    // Ensure slug uniqueness
    const existingSlug = await this.prisma.organization.findUnique({
      where: { slug: baseSlug },
    });
    const finalSlug = existingSlug
      ? `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`
      : baseSlug;

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    try {
      // Create Organization and User in a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        const organization = await tx.organization.create({
          data: {
            name: orgName,
            slug: finalSlug,
          },
        });

        const user = await tx.user.create({
          data: {
            email: normalizedEmail,
            name: dto.name.trim(),
            passwordHash,
            role: dto.role ?? Role.ADMIN,
            phone: dto.phone?.trim(),
            organizationId: organization.id,
          },
        });

        // Create initial AuditLog for registration
        await tx.auditLog.create({
          data: {
            organizationId: organization.id,
            userId: user.id,
            action: 'USER_REGISTERED',
            entityType: 'User',
            entityId: user.id,
            details: { email: user.email, role: user.role, orgName },
          },
        });

        return { user, organization };
      });

      const tokens = await this.generateTokens({
        sub: result.user.id,
        email: result.user.email,
        organizationId: result.organization.id,
        role: result.user.role as unknown as UserRole,
      });

      this.logger.log(`New user registered: ${result.user.email} (Org: ${result.organization.name})`);

      return {
        user: this.toSafeUser(result.user),
        organization: result.organization,
        tokens,
      };
    } catch (error) {
      this.logger.error(`Registration failed for ${normalizedEmail}`, error);
      throw new InternalServerErrorException('Failed to complete registration');
    }
  }

  /**
   * Authenticate user with email and password.
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { organization: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role as unknown as UserRole,
    });

    // Record login audit event
    await this.prisma.auditLog
      .create({
        data: {
          organizationId: user.organizationId,
          userId: user.id,
          action: 'USER_LOGIN',
          entityType: 'User',
          entityId: user.id,
        },
      })
      .catch((err) => {
        this.logger.warn(`Failed to record login audit log for ${user.id}: ${err.message}`);
      });

    return {
      user: this.toSafeUser(user),
      organization: user.organization,
      tokens,
    };
  }

  /**
   * Refresh JWT access token with a valid refresh token.
   */
  async refreshToken(dto: RefreshTokenDto): Promise<AuthResponse> {
    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'lexmate_default_refresh_secret_dev_2026',
    );

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(dto.refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { organization: true },
    });

    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role as unknown as UserRole,
    });

    return {
      user: this.toSafeUser(user),
      organization: user.organization,
      tokens,
    };
  }

  /**
   * Retrieve current authenticated user profile and organization.
   */
  async getProfile(userId: string): Promise<{ user: SafeUser; organization: PrismaOrg }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return {
      user: this.toSafeUser(user),
      organization: user.organization,
    };
  }

  /**
   * Generate access and refresh token pair.
   */
  private async generateTokens(payload: JwtPayload) {
    const accessSecret = this.configService.get<string>('JWT_SECRET', 'lexmate_default_secret_dev');
    const accessExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '7d');

    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'lexmate_default_refresh_secret_dev_2026',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: payload.sub,
          email: payload.email,
          organizationId: payload.organizationId,
          role: payload.role,
        },
        {
          secret: accessSecret,
          expiresIn: '7d',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: payload.sub,
          email: payload.email,
          organizationId: payload.organizationId,
          role: payload.role,
        },
        {
          secret: refreshSecret,
          expiresIn: '30d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
    };
  }

  private toSafeUser(user: PrismaUser): SafeUser {
    const { passwordHash: _hash, ...safe } = user;
    return safe;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}
