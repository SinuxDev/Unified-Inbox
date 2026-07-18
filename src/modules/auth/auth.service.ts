import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OrganizationsService } from '../organizations/organizations.service';
import { UsersService } from '../users/users.service';
import { PasswordService } from './password.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
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
    const accessToken = await this.signToken({
      userId: user.id,
      email: user.email,
      organizationId: organization.id,
      role: membership.role,
    });
    return {
      accessToken,
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
    const accessToken = await this.signToken({
      userId: user.id,
      email: user.email,
      organizationId: membership.organizationId,
      role: membership.role,
    });
    return {
      accessToken,
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

  private signToken(input: {
    userId: string;
    email: string;
    organizationId: string;
    role: string;
  }): Promise<string> {
    return this.jwtService.signAsync({
      sub: input.userId,
      email: input.email,
      organizationId: input.organizationId,
      role: input.role,
    });
  }
}
