import { Controller, MessageEvent, Sse, UseGuards } from '@nestjs/common';
import { Observable, interval, map } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('realtime')
@UseGuards(JwtAuthGuard)
export class RealtimeController {
  @Sse('events')
  events(@CurrentUser() user: AuthUser): Observable<MessageEvent> {
    return interval(15000).pipe(
      map((tick) => ({
        data: {
          type: 'heartbeat',
          tick,
          organizationId: user.organizationId,
          userId: user.userId,
          at: new Date().toISOString(),
        },
      })),
    );
  }
}
