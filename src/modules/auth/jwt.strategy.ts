import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../../common/decorators/current-user.decorator';

type JwtPayload = {
  sub: string;
  email: string;
  organizationId: string;
  role: string;
  typ?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('jwt.secret'),
    });
  }

  validate(payload: JwtPayload): AuthUser {
    if (payload.typ === 'refresh') {
      throw new UnauthorizedException('Refresh token cannot be used as access');
    }
    if (payload.typ !== undefined && payload.typ !== 'access') {
      throw new UnauthorizedException('Invalid access token');
    }
    return {
      userId: payload.sub,
      email: payload.email,
      organizationId: payload.organizationId,
      role: payload.role,
    };
  }
}
