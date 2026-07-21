import { DevUserSeed } from './dev-user.seed';
import { OrganizationsService } from '../../modules/organizations/organizations.service';
import { PasswordService } from '../../modules/auth/password.service';
import { UsersService } from '../../modules/users/users.service';

describe('DevUserSeed', () => {
  const usersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };
  const organizationsService = {
    findForUser: jest.fn(),
    createWithOwner: jest.fn(),
  };
  const passwordService = {
    hash: jest.fn(),
  };

  let seed: DevUserSeed;

  beforeEach(() => {
    jest.clearAllMocks();
    seed = new DevUserSeed(
      usersService as unknown as UsersService,
      organizationsService as unknown as OrganizationsService,
      passwordService as unknown as PasswordService,
    );
  });

  it('skips when dev user and organization already exist', async () => {
    usersService.findByEmail.mockResolvedValue({ id: 'user-1' });
    organizationsService.findForUser.mockResolvedValue([{ id: 'member-1' }]);

    await seed.run();

    expect(usersService.create).not.toHaveBeenCalled();
    expect(organizationsService.createWithOwner).not.toHaveBeenCalled();
  });

  it('creates user, org, and owner membership when missing', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    passwordService.hash.mockResolvedValue('hashed');
    usersService.create.mockResolvedValue({
      id: 'user-1',
      email: 'owner@example.com',
    });
    organizationsService.createWithOwner.mockResolvedValue({
      organization: { id: 'org-1' },
      membership: { role: 'owner' },
    });

    await seed.run();

    expect(passwordService.hash).toHaveBeenCalled();
    expect(usersService.create).toHaveBeenCalledWith(
      'owner@example.com',
      'hashed',
      'Dev Owner',
    );
    expect(organizationsService.createWithOwner).toHaveBeenCalledWith(
      'Dev Organization',
      { id: 'user-1', email: 'owner@example.com' },
    );
  });
});
