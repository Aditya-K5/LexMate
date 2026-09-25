/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs';

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath) && typeof (process as any).loadEnvFile === 'function') {
  (process as any).loadEnvFile(envPath);
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '../dist/common/filters/http-exception.filter';
import { TransformInterceptor } from '../dist/common/interceptors/transform.interceptor';
import { PrismaService } from '../dist/prisma/prisma.service';

async function runHttpAuthTest() {
  console.log('🌐 Starting HTTP-level Authentication & Guard Verification...');

  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
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

  // Listen on random port
  await app.listen(0);
  const server = app.getHttpServer();
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 4001;
  const baseUrl = `http://localhost:${port}/api/v1`;

  const prisma = app.get(PrismaService);
  const testEmail = `http.test.${Date.now()}@lexmatetest.com`;
  const testPassword = 'Password2026!';
  let createdOrgId: string | null = null;

  try {
    // 1. Test Unauthenticated Access to Protected Route
    console.log('\n[1/4] Testing GET /auth/me without Bearer token (expecting 401)...');
    const resNoAuth = await fetch(`${baseUrl}/auth/me`);
    if (resNoAuth.status !== 401) {
      throw new Error(`Expected 401 Unauthorized but got ${resNoAuth.status}`);
    }
    console.log('✅ Unauthenticated request correctly blocked with HTTP 401 Unauthorized');

    // 2. Test Validation Error on Bad Input
    console.log('\n[2/4] Testing POST /auth/register with invalid data (expecting 400)...');
    const resBadInput = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'not-an-email',
        password: '123',
        name: 'A',
      }),
    });
    if (resBadInput.status !== 400) {
      throw new Error(`Expected 400 Bad Request but got ${resBadInput.status}`);
    }
    const badInputJson = await resBadInput.json();
    console.log(`✅ Bad input correctly rejected with HTTP 400: ${JSON.stringify(badInputJson.message)}`);

    // 3. Test HTTP Registration
    console.log('\n[3/4] Testing POST /auth/register via HTTP...');
    const resRegister = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: 'Advocate Priya Sen',
        organizationName: 'Sen Chambers',
      }),
    });
    if (resRegister.status !== 201) {
      const errBody = await resRegister.text();
      throw new Error(`Registration failed with status ${resRegister.status}: ${errBody}`);
    }
    const regData = await resRegister.json();
    const token = regData.data.tokens.accessToken;
    createdOrgId = regData.data.organization.id;
    console.log(`✅ Registered via HTTP: ${regData.data.user.name}, Bearer token received`);

    // 4. Test Authenticated GET /auth/me
    console.log('\n[4/4] Testing GET /auth/me with Bearer token...');
    const resMe = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resMe.status !== 200) {
      const errBody = await resMe.text();
      throw new Error(`GET /auth/me failed with status ${resMe.status}: ${errBody}`);
    }
    const meData = await resMe.json();
    if (meData.data.user.email !== testEmail) {
      throw new Error('Retrieved user email does not match registered email');
    }
    console.log(`✅ Authenticated request succeeded: Logged in as ${meData.data.user.name} (${meData.data.organization.name})`);

    console.log('\n🎉 ALL HTTP GUARD & VALIDATION CHECKS PASSED!\n');
  } catch (error) {
    console.error('❌ HTTP test failed:', error);
    process.exitCode = 1;
  } finally {
    if (createdOrgId) {
      await prisma.auditLog.deleteMany({ where: { organizationId: createdOrgId } });
      await prisma.user.deleteMany({ where: { organizationId: createdOrgId } });
      await prisma.organization.delete({ where: { id: createdOrgId } });
    }
    await app.close();
  }
}

runHttpAuthTest();
