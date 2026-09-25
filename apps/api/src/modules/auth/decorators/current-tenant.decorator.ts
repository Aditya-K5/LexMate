import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const organizationId = request.user?.organizationId;
    if (!organizationId) {
      throw new UnauthorizedException('Tenant context missing from authenticated request');
    }
    return organizationId;
  },
);
