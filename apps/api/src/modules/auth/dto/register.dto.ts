import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  name!: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Organization name must be at least 2 characters long' })
  organizationName?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Invalid role specified' })
  role?: Role;

  @IsOptional()
  @IsString()
  phone?: string;
}
