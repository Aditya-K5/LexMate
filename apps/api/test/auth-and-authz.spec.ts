/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs';

// Load .env from apps/api/.env
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
import { Role } from '@prisma/client';

async function runComprehensiveAuthTests() {
  console.log('⚖️  ==============================================================');
  console.log('⚖️  LEXMATE PHASE 4: DATABASE & AUTHENTICATION VERIFICATION SUITE');
  console.log('⚖️  ==============================================================\n');

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

  await app.listen(0);
  const server = app.getHttpServer();
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 4001;
  const baseUrl = `http://localhost:${port}/api/v1`;

  const prisma = app.get(PrismaService);

  // Test identifiers
  const timestamp = Date.now();
  const org1Email = `partner.org1.${timestamp}@lexmatetest.com`;
  const org1Password = 'StrongP@ss2026!';
  const org2Email = `counsel.org2.${timestamp}@lexmatetest.com`;
  const org2Password = 'StrongP@ss2026!';

  let org1Id: string | null = null;
  let org2Id: string | null = null;
  let org1AdminToken: string = '';
  let org2AdminToken: string = '';
  let org1LawyerToken: string = '';
  let org1LawyerId: string = '';

  try {
    // -------------------------------------------------------------
    // TEST 1: Unauthenticated request rejected
    // -------------------------------------------------------------
    console.log('[Test 1/11] Security: Unauthenticated request to /auth/me rejected with 401');
    const resNoAuth = await fetch(`${baseUrl}/auth/me`);
    if (resNoAuth.status !== 401) {
      throw new Error(`Expected 401 Unauthorized but got ${resNoAuth.status}`);
    }
    console.log('  ✅ Passed: Blocked with HTTP 401 Unauthorized\n');

    // -------------------------------------------------------------
    // TEST 2: Input Validation (reject malformed data)
    // -------------------------------------------------------------
    console.log('[Test 2/11] Validation: Malformed registration data rejected with 400');
    const resBadInput = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid-email-format',
        password: '123', // Too short
        name: 'A', // Too short
      }),
    });
    if (resBadInput.status !== 400) {
      throw new Error(`Expected 400 Bad Request but got ${resBadInput.status}`);
    }
    console.log('  ✅ Passed: Rejected with HTTP 400 Bad Request\n');

    // -------------------------------------------------------------
    // TEST 3: User & Organization Registration + Session Creation
    // -------------------------------------------------------------
    console.log('[Test 3/11] Registration: Org 1 Admin registration and Session creation');
    const resReg1 = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: org1Email,
        password: org1Password,
        name: 'Senior Advocate Rajesh Sharma',
        organizationName: 'Sharma Law Chambers',
        role: Role.ADMIN,
      }),
    });
    if (resReg1.status !== 201) {
      const err = await resReg1.text();
      throw new Error(`Org 1 registration failed: ${err}`);
    }
    const reg1Data = await resReg1.json();
    org1Id = reg1Data.data.organization.id;
    org1AdminToken = reg1Data.data.tokens.accessToken;
    const org1RefreshToken = reg1Data.data.tokens.refreshToken;

    if (!org1Id) throw new Error('Missing organization ID in registration response');
    if (!org1AdminToken) throw new Error('Missing accessToken in registration response');

    // Verify session was created in DB
    const session1 = await prisma.session.findUnique({
      where: { token: org1RefreshToken },
    });
    if (!session1 || session1.organizationId !== org1Id) {
      throw new Error('Database session was not created or has incorrect organizationId');
    }
    console.log(
      `  ✅ Passed: Registered "${reg1Data.data.user.name}" in Org "${reg1Data.data.organization.name}"`,
    );
    console.log(
      `  ✅ Passed: Verified DB Session for refresh token (Org: ${session1.organizationId})\n`,
    );

    // -------------------------------------------------------------
    // TEST 4: No Secrets Exposed
    // -------------------------------------------------------------
    console.log('[Test 4/11] Security: Verify passwordHash is never exposed in responses');
    if ((reg1Data.data.user as any).passwordHash) {
      throw new Error('SECURITY VIOLATION: passwordHash exposed in registration response!');
    }
    const resMe = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${org1AdminToken}` },
    });
    const meData = await resMe.json();
    if ((meData.data.user as any).passwordHash) {
      throw new Error('SECURITY VIOLATION: passwordHash exposed in /auth/me response!');
    }
    if (!Array.isArray(meData.data.permissions) || meData.data.permissions.length === 0) {
      throw new Error('Permissions array missing from /auth/me response');
    }
    console.log(
      `  ✅ Passed: Zero secrets exposed. User permissions: ${meData.data.permissions.length} actions granted\n`,
    );

    // -------------------------------------------------------------
    // TEST 5: Duplicate Email Prevention
    // -------------------------------------------------------------
    console.log('[Test 5/11] Registration: Duplicate email rejected with 409 Conflict');
    const resDup = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: org1Email,
        password: 'AnotherPassword123!',
        name: 'Imposter User',
      }),
    });
    if (resDup.status !== 409) {
      throw new Error(`Expected 409 Conflict on duplicate email, got ${resDup.status}`);
    }
    console.log('  ✅ Passed: Duplicate registration blocked with HTTP 409 Conflict\n');

    // -------------------------------------------------------------
    // TEST 6: Login with Valid vs Invalid Credentials
    // -------------------------------------------------------------
    console.log('[Test 6/11] Authentication: Login verification');
    // Bad password
    const resBadLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: org1Email,
        password: 'WrongPassword!',
      }),
    });
    if (resBadLogin.status !== 401) {
      throw new Error(`Expected 401 on bad password, got ${resBadLogin.status}`);
    }
    console.log('  ✅ Passed: Bad password rejected with HTTP 401 Unauthorized');

    // Valid login
    const resGoodLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: org1Email,
        password: org1Password,
      }),
    });
    if (resGoodLogin.status !== 200) {
      throw new Error(`Valid login failed with status ${resGoodLogin.status}`);
    }
    const goodLoginData = await resGoodLogin.json();
    if (!goodLoginData.data.tokens?.accessToken) {
      throw new Error('Login response missing accessToken');
    }
    console.log('  ✅ Passed: Valid login succeeded and returned fresh tokens\n');

    // -------------------------------------------------------------
    // TEST 7: Register Org 2 & Verify Multi-Tenant Isolation
    // -------------------------------------------------------------
    console.log('[Test 7/11] Multi-Tenancy: Register Org 2 and verify strict tenant isolation');
    const resReg2 = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: org2Email,
        password: org2Password,
        name: 'Advocate Vikram Mehta',
        organizationName: 'Mehta Legal Associates',
        role: Role.ADMIN,
      }),
    });
    if (resReg2.status !== 201) throw new Error('Org 2 registration failed');
    const reg2Data = await resReg2.json();
    org2Id = reg2Data.data.organization.id;
    org2AdminToken = reg2Data.data.tokens.accessToken;

    // Org 1 invites a team member (Associate Lawyer)
    const org1MemberEmail = `lawyer.org1.${timestamp}@lexmatetest.com`;
    const org1MemberPassword = 'LawyerPassword2026!';
    const resAddMember = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${org1AdminToken}`,
      },
      body: JSON.stringify({
        email: org1MemberEmail,
        password: org1MemberPassword,
        name: 'Advocate Sneha Patel',
        role: Role.LAWYER,
      }),
    });
    if (resAddMember.status !== 201) {
      const err = await resAddMember.text();
      throw new Error(`Failed to add team member to Org 1: ${err}`);
    }
    const memberData = await resAddMember.json();
    org1LawyerId = memberData.data.id;
    console.log(
      `  ✅ Passed: Org 1 Admin added team member "${memberData.data.name}" (${memberData.data.role})`,
    );

    // Log in as Org 1 Lawyer
    const resLawyerLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: org1MemberEmail,
        password: org1MemberPassword,
      }),
    });
    const lawyerLoginData = await resLawyerLogin.json();
    org1LawyerToken = lawyerLoginData.data.tokens.accessToken;

    // Cross-tenant test: Org 2 Admin attempts to access Org 1 Lawyer profile
    const resCrossTenant = await fetch(`${baseUrl}/users/${org1LawyerId}`, {
      headers: { Authorization: `Bearer ${org2AdminToken}` },
    });
    if (resCrossTenant.status !== 403 && resCrossTenant.status !== 404) {
      throw new Error(
        `Multi-tenant breach: Org 2 user accessed Org 1 member! Status: ${resCrossTenant.status}`,
      );
    }
    console.log('  ✅ Passed: Cross-tenant access strictly blocked with HTTP 403/404 Forbidden');

    // Org 2 listing users only sees Org 2 members, never Org 1 members
    const resOrg2Users = await fetch(`${baseUrl}/users`, {
      headers: { Authorization: `Bearer ${org2AdminToken}` },
    });
    const org2UsersData = await resOrg2Users.json();
    const leakedUser = org2UsersData.data.find(
      (u: any) => u.email === org1MemberEmail || u.email === org1Email,
    );
    if (leakedUser) {
      throw new Error('Multi-tenant data leak: Org 1 members returned in Org 2 user list!');
    }
    console.log(
      `  ✅ Passed: Org 2 user list strictly isolated (contains only Org 2 users: ${org2UsersData.data.length})\n`,
    );

    // -------------------------------------------------------------
    // TEST 8: Role-Based Authorization (RBAC)
    // -------------------------------------------------------------
    console.log('[Test 8/11] Authorization: Role-based permissions enforcement');
    // Lawyer attempts an ADMIN-only endpoint (Invite new user)
    const resLawyerInvite = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${org1LawyerToken}`,
      },
      body: JSON.stringify({
        email: `unauthorized.${timestamp}@test.com`,
        name: 'Unauthorized User',
        role: Role.STAFF,
      }),
    });
    if (resLawyerInvite.status !== 403) {
      throw new Error(
        `Expected 403 Forbidden for non-admin user creation, got ${resLawyerInvite.status}`,
      );
    }
    console.log('  ✅ Passed: Non-admin creation attempt blocked with HTTP 403 Forbidden');

    // Lawyer attempts an ADMIN-only endpoint (Update organization profile)
    const resLawyerOrgUpdate = await fetch(`${baseUrl}/organizations/current`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${org1LawyerToken}`,
      },
      body: JSON.stringify({ name: 'Hacked Organization Name' }),
    });
    if (resLawyerOrgUpdate.status !== 403) {
      throw new Error(
        `Expected 403 Forbidden for non-admin org update, got ${resLawyerOrgUpdate.status}`,
      );
    }
    console.log('  ✅ Passed: Non-admin organization update blocked with HTTP 403 Forbidden\n');

    // -------------------------------------------------------------
    // TEST 9: Audit Foundation & Isolation
    // -------------------------------------------------------------
    console.log('[Test 9/11] Audit Foundation: Audit logs recorded and tenant-isolated');
    // Admin checks audit logs
    const resAudit = await fetch(`${baseUrl}/audit`, {
      headers: { Authorization: `Bearer ${org1AdminToken}` },
    });
    if (resAudit.status !== 200) {
      const err = await resAudit.text();
      throw new Error(`Failed to fetch audit logs: ${err}`);
    }
    const auditData = await resAudit.json();
    if (!auditData.data?.data || auditData.data.data.length === 0) {
      throw new Error('No audit log records found for Org 1!');
    }
    // Verify all returned audit logs belong to Org 1
    const foreignLogs = auditData.data.data.filter((log: any) => log.organizationId !== org1Id);
    if (foreignLogs.length > 0) {
      throw new Error('Audit log isolation failed: Foreign organization logs returned!');
    }
    console.log(
      `  ✅ Passed: Org 1 audit records verified (${auditData.data.data.length} entries: ${auditData.data.data.map((l: any) => l.action).join(', ')})`,
    );

    // Non-admin attempts to view audit logs -> 403 Forbidden
    const resLawyerAudit = await fetch(`${baseUrl}/audit`, {
      headers: { Authorization: `Bearer ${org1LawyerToken}` },
    });
    if (resLawyerAudit.status !== 403) {
      throw new Error(
        `Expected 403 Forbidden for non-admin audit access, got ${resLawyerAudit.status}`,
      );
    }
    console.log('  ✅ Passed: Non-admin audit log access blocked with HTTP 403 Forbidden\n');

    // -------------------------------------------------------------
    // TEST 10: Session Rotation & Token Refresh
    // -------------------------------------------------------------
    console.log('[Test 10/11] Session Management: Refresh token exchange and session rotation');
    const resRefresh = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: lawyerLoginData.data.tokens.refreshToken }),
    });
    if (resRefresh.status !== 200) {
      throw new Error(`Token refresh failed with status ${resRefresh.status}`);
    }
    const refreshData = await resRefresh.json();
    const newAccessToken = refreshData.data.tokens.accessToken;
    const newRefreshToken = refreshData.data.tokens.refreshToken;

    if (!newAccessToken || !newRefreshToken) {
      throw new Error('Token refresh did not return rotated token pair');
    }

    // Verify the refreshed access token works
    const resMeRefreshed = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${newAccessToken}` },
    });
    if (resMeRefreshed.status !== 200) {
      throw new Error('New access token rejected');
    }
    console.log('  ✅ Passed: Token pair successfully rotated and authenticated\n');

    // -------------------------------------------------------------
    // TEST 11: Logout & Session Revocation
    // -------------------------------------------------------------
    console.log('[Test 11/11] Session Revocation: Logout revokes session');
    const resLogout = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newAccessToken}`,
      },
      body: JSON.stringify({ refreshToken: newRefreshToken }),
    });
    if (resLogout.status !== 200) {
      throw new Error(`Logout failed with status ${resLogout.status}`);
    }
    console.log('  ✅ Passed: Logout request succeeded');

    // Attempting to refresh with the revoked token must fail with 401
    const resRefreshRevoked = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: newRefreshToken }),
    });
    if (resRefreshRevoked.status !== 401) {
      throw new Error(`Expected 401 on revoked refresh token, got ${resRefreshRevoked.status}`);
    }
    console.log('  ✅ Passed: Revoked session correctly blocked with HTTP 401 Unauthorized\n');

    console.log('🎉 ==============================================================');
    console.log('🎉 ALL 11 DATABASE, AUTHENTICATION & RBAC CHECKS PASSED!');
    console.log('🎉 ==============================================================\n');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exitCode = 1;
  } finally {
    console.log('🧹 Cleaning up test artifacts from PostgreSQL database...');
    if (org1Id) {
      await prisma.session.deleteMany({ where: { organizationId: org1Id } });
      await prisma.auditLog.deleteMany({ where: { organizationId: org1Id } });
      await prisma.user.deleteMany({ where: { organizationId: org1Id } });
      await prisma.organization.delete({ where: { id: org1Id } });
    }
    if (org2Id) {
      await prisma.session.deleteMany({ where: { organizationId: org2Id } });
      await prisma.auditLog.deleteMany({ where: { organizationId: org2Id } });
      await prisma.user.deleteMany({ where: { organizationId: org2Id } });
      await prisma.organization.delete({ where: { id: org2Id } });
    }
    console.log('🧹 Database cleaned up successfully.');
    await app.close();
  }
}

runComprehensiveAuthTests();
