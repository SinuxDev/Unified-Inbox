import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OrgRole } from '../../common/enums/org-role.enum';
import { OrganizationsService } from '../organizations/organizations.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';

describe('AuthService', () => {
  const usersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };
  const organizationsService = {
    createWithOwner: jest.fn(),
    findForUser: jest.fn(),
  };
  const passwordService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn(),
  };

  const service = new AuthService(
    usersService as unknown as UsersService,
    organizationsService as unknown as OrganizationsService,
    passwordService as unknown as PasswordService,
    jwtService as unknown as JwtService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a new user and returns a token', async () => {
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
    jwtService.signAsync.mockResolvedValue('token');

    const result = await service.register({
      email: 'a@example.com',
      password: 'password1',
      organizationName: 'Acme',
    });

    expect(result.accessToken).toBe('token');
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
});
