import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

export type AuthUser = {
  userId: string;
  organizationId: string;
  email: string;
  role: string;
};

type RequestWithUser = Request & { user?: AuthUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user) {
      throw new UnauthorizedException('Missing authenticated user');
    }
    return request.user;
  },
);

export const CurrentOrgId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user?.organizationId) {
      throw new UnauthorizedException('Missing organization context');
    }
    return request.user.organizationId;
  },
);
