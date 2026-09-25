import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.organizationId) {
      throw new UnauthorizedException('Tenant context missing from authenticated session');
    }

    // Check route parameters for organizationId if present
    const paramOrgId = request.params?.organizationId || request.params?.orgId;
    if (paramOrgId && paramOrgId !== user.organizationId) {
      throw new ForbiddenException(
        'Access denied: You cannot access or modify resources belonging to another organization',
      );
    }

    return true;
  }
}
