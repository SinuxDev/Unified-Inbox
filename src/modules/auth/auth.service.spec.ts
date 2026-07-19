import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OrgRole } from '../../common/enums/org-role.enum';
import { OrganizationsService } from '../organizations/organizations.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';

describe('AuthService', () => {
  const usersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };
  const organizationsService = {
    createWithOwner: jest.fn(),
    findForUser: jest.fn(),
    getMembershipOrThrow: jest.fn(),
  };
  const passwordService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };
  const config = {
    getOrThrow: jest.fn((key: string) => {
      const map: Record<string, string> = {
        'jwt.secret': 'access-secret',
        'jwt.expiresIn': '15m',
        'jwt.refreshSecret': 'refresh-secret',
        'jwt.refreshExpiresIn': '7d',
      };
      return map[key];
    }),
  };

  const service = new AuthService(
    usersService as unknown as UsersService,
    organizationsService as unknown as OrganizationsService,
    passwordService as unknown as PasswordService,
    jwtService as unknown as JwtService,
    config as unknown as ConfigService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
  });

  it('registers a new user and returns access and refresh tokens', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    passwordService.hash.mockResolvedValue('hashed');
    usersService.create.mockResolvedValue({
      id: 'u1',
      email: 'a@example.com',
      displayName: null,
    });
    organizationsService.createWithOwner.mockResolvedValue({
      organization: { id: 'o1', name: 'Acme' },
      membership: { role: OrgRole.Owner },
    });

    const result = await service.register({
      email: 'a@example.com',
      password: 'password1',
      organizationName: 'Acme',
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.organization.id).toBe('o1');
  });

  it('rejects duplicate registration', async () => {
    usersService.findByEmail.mockResolvedValue({ id: 'u1' });
    await expect(
      service.register({
        email: 'a@example.com',
        password: 'password1',
        organizationName: 'Acme',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects invalid login', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    await expect(
      service.login({ email: 'a@example.com', password: 'password1' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshes tokens when refresh JWT is valid', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'u1',
      organizationId: 'o1',
      typ: 'refresh',
    });
    usersService.findById.mockResolvedValue({
      id: 'u1',
      email: 'a@example.com',
      displayName: null,
    });
    organizationsService.getMembershipOrThrow.mockResolvedValue({
      organizationId: 'o1',
      role: OrgRole.Owner,
      organization: { name: 'Acme' },
    });

    const result = await service.refresh({ refreshToken: 'refresh.jwt' });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.organization.role).toBe(OrgRole.Owner);
  });

  it('rejects refresh when typ is not refresh', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'u1',
      organizationId: 'o1',
      typ: 'access',
    });

    await expect(
      service.refresh({ refreshToken: 'access.jwt' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects refresh when verify fails', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('expired'));

    await expect(
      service.refresh({ refreshToken: 'bad.jwt' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
