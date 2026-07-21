import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, map } from 'rxjs';
import type { ApiSuccessResponse } from './api-response.types';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.path === '/health') {
      return next.handle();
    }

    return next.handle().pipe(
      map((data): ApiSuccessResponse => ({
        success: true,
        message: 'OK',
        data: data ?? null,
      })),
    );
  }
}
