/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs';

// Load .env using native Node.js capability
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath) && typeof (process as any).loadEnvFile === 'function') {
  (process as any).loadEnvFile(envPath);
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AuthService } from '../src/modules/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';

async function runAuthVerification() {
  console.log('🚀 Starting LexMate Authentication Verification...');

  let app;
  try {
    app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();

    const authService = app.get(AuthService);
    const prisma = app.get(PrismaService);

    const testEmail = `advocate.test.${Date.now()}@lexmatetest.com`;
    const testPassword = 'SecurePassword2026!';
    const testName = 'Advocate Ananya Deshmukh';
    const testOrgName = 'Deshmukh & Associates Law Firm';

    // 1. Test Registration
    console.log('\n[1/7] Testing User Registration...');
    const regResult = await authService.register({
      email: testEmail,
      password: testPassword,
      name: testName,
      organizationName: testOrgName,
      role: Role.ADMIN,
      phone: '+919876543210',
    });

    if (!regResult.tokens?.accessToken) throw new Error('Registration did not return access token');
    if (!regResult.user?.id) throw new Error('Registration did not return user ID');
    if (!regResult.organization?.id) throw new Error('Registration did not return organization ID');
    if ((regResult.user as any).passwordHash) throw new Error('Security violation: passwordHash exposed in response');
    console.log(`✅ Registered user: ${regResult.user.name} (${regResult.user.email})`);
    console.log(`✅ Organization created: ${regResult.organization.name} (slug: ${regResult.organization.slug})`);

    // 2. Verify Audit Log entry in DB
    console.log('\n[2/7] Verifying AuditLog in Supabase Database...');
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        userId: regResult.user.id,
        action: 'USER_REGISTERED',
      },
    });
    if (auditLogs.length === 0) throw new Error('Audit log for USER_REGISTERED was not created');
    console.log(`✅ AuditLog verified: Found ${auditLogs.length} audit entry`);

    // 3. Test Duplicate Registration (Conflict)
    console.log('\n[3/7] Testing Duplicate Registration Prevention...');
    let conflictCaught = false;
    try {
      await authService.register({
        email: testEmail,
        password: testPassword,
        name: 'Duplicate User',
      });
    } catch (err: any) {
      if (err.status === 409 || err.message?.includes('already exists')) {
        conflictCaught = true;
        console.log(`✅ Duplicate registration blocked: ${err.message}`);
      } else {
        throw err;
      }
    }
    if (!conflictCaught) throw new Error('Duplicate registration was NOT prevented');

    // 4. Test Login with Valid Credentials
    console.log('\n[4/7] Testing Login with Valid Credentials...');
    const loginResult = await authService.login({
      email: testEmail,
      password: testPassword,
    });
    if (!loginResult.tokens?.accessToken) throw new Error('Login failed to return accessToken');
    console.log(`✅ Login successful. Token issued (expires in ${loginResult.tokens.expiresIn})`);

    // 5. Test Login with Invalid Credentials
    console.log('\n[5/7] Testing Login Rejection on Bad Password...');
    let unauthorizedCaught = false;
    try {
      await authService.login({
        email: testEmail,
        password: 'WrongPassword123!',
      });
    } catch (err: any) {
      if (err.status === 401 || err.message?.includes('Invalid')) {
        unauthorizedCaught = true;
        console.log(`✅ Bad credentials blocked: ${err.message}`);
      } else {
        throw err;
      }
    }
    if (!unauthorizedCaught) throw new Error('Bad password was NOT blocked');

    // 6. Test Refresh Token
    console.log('\n[6/7] Testing Refresh Token Exchange...');
    const refreshResult = await authService.refreshToken({
      refreshToken: loginResult.tokens.refreshToken!,
    });
    if (!refreshResult.tokens?.accessToken) throw new Error('Refresh token exchange failed');
    console.log('✅ Refresh token successfully exchanged for fresh tokens');

    // 7. Test User Profile Retrieval
    console.log('\n[7/7] Testing Profile Retrieval (/auth/me)...');
    const profileResult = await authService.getProfile(regResult.user.id);
    if (profileResult.user.email !== testEmail) throw new Error('Profile returned incorrect email');
    if (profileResult.organization.name !== testOrgName) throw new Error('Profile returned incorrect org');
    console.log(`✅ Profile retrieved: ${profileResult.user.name}, Organization: ${profileResult.organization.name}`);

    // Clean up test data
    console.log('\n🧹 Cleaning up test artifacts from database...');
    await prisma.auditLog.deleteMany({ where: { organizationId: regResult.organization.id } });
    await prisma.user.deleteMany({ where: { organizationId: regResult.organization.id } });
    await prisma.organization.delete({ where: { id: regResult.organization.id } });
    console.log('✅ Test data cleaned up successfully.');

    console.log('\n🎉 ALL 7 AUTHENTICATION VERIFICATION CHECKS PASSED PERFECTLY!\n');
  } catch (error) {
    console.error('❌ Verification failed with error:', error);
    process.exitCode = 1;
  } finally {
    if (app) {
      await app.close();
    }
  }
}

runAuthVerification();
