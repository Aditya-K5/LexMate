import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  name!: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;

  @IsEnum(Role, { message: 'Role must be ADMIN, LAWYER, ASSOCIATE, or STAFF' })
  role!: Role;

  @IsOptional()
  @IsString()
  phone?: string;
}
