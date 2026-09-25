import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SafeUser } from '@lexmate/types';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | keyof SafeUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
