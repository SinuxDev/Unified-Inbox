import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OrganizationsService } from '../organizations/organizations.service';
import { UsersService } from '../users/users.service';
import { PasswordService } from './password.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

type AccessPayload = {
  sub: string;
  email: string;
  organizationId: string;
  role: string;
  typ: 'access';
};

type RefreshPayload = {
  sub: string;
  organizationId: string;
  typ: 'refresh';
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await this.passwordService.hash(dto.password);
    const user = await this.usersService.create(
      dto.email,
      passwordHash,
      dto.displayName,
    );
    const { organization, membership } =
      await this.organizationsService.createWithOwner(
        dto.organizationName,
        user,
      );
    const tokens = await this.issueTokenPair({
      userId: user.id,
      email: user.email,
      organizationId: organization.id,
      role: membership.role,
    });
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        role: membership.role,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await this.passwordService.compare(
      dto.password,
      user.passwordHash,
    );
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const memberships = await this.organizationsService.findForUser(user.id);
    if (memberships.length === 0) {
      throw new UnauthorizedException('User has no organization');
    }
    const membership = memberships[0];
    const tokens = await this.issueTokenPair({
      userId: user.id,
      email: user.email,
      organizationId: membership.organizationId,
      role: membership.role,
    });
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      organization: {
        id: membership.organizationId,
        name: membership.organization.name,
        role: membership.role,
      },
    };
  }

  async refresh(dto: RefreshDto) {
    let payload: RefreshPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshPayload>(
        dto.refreshToken,
        {
          secret: this.config.getOrThrow<string>('jwt.refreshSecret'),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.typ !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const membership = await this.organizationsService.getMembershipOrThrow(
      user.id,
      payload.organizationId,
    );

    const tokens = await this.issueTokenPair({
      userId: user.id,
      email: user.email,
      organizationId: membership.organizationId,
      role: membership.role,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      organization: {
        id: membership.organizationId,
        name: membership.organization.name,
        role: membership.role,
      },
    };
  }

  private async issueTokenPair(input: {
    userId: string;
    email: string;
    organizationId: string;
    role: string;
  }) {
    const accessPayload: AccessPayload = {
      sub: input.userId,
      email: input.email,
      organizationId: input.organizationId,
      role: input.role,
      typ: 'access',
    };
    const refreshPayload: RefreshPayload = {
      sub: input.userId,
      organizationId: input.organizationId,
      typ: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.config.getOrThrow<string>('jwt.secret'),
        expiresIn: this.config.getOrThrow<string>(
          'jwt.expiresIn',
        ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.config.getOrThrow<string>('jwt.refreshSecret'),
        expiresIn: this.config.getOrThrow<string>(
          'jwt.refreshExpiresIn',
        ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
