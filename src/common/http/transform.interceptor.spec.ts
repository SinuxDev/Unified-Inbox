import { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

function mockContext(path: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ path }),
    }),
  } as ExecutionContext;
}

describe('TransformInterceptor', () => {
  const interceptor = new TransformInterceptor();
  const next: CallHandler = { handle: () => of({ id: '1' }) };

  it('wraps successful responses in the envelope', async () => {
    const result = await lastValueFrom(
      interceptor.intercept(mockContext('/teams'), next),
    );

    expect(result).toEqual({
      success: true,
      message: 'OK',
      data: { id: '1' },
    });
  });

  it('skips wrapping for the health probe', async () => {
    const result = await lastValueFrom(
      interceptor.intercept(mockContext('/health'), next),
    );

    expect(result).toEqual({ id: '1' });
  });

  it('uses null data when the handler returns undefined', async () => {
    const emptyNext: CallHandler = { handle: () => of(undefined) };
    const result = await lastValueFrom(
      interceptor.intercept(mockContext('/auth/logout'), emptyNext),
    );

    expect(result).toEqual({
      success: true,
      message: 'OK',
      data: null,
    });
  });
});
