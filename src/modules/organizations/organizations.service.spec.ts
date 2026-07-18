import { NotFoundException } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';

describe('OrganizationsService', () => {
  const membersRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const orgsRepo = {};
  const dataSource = { transaction: jest.fn() };

  const service = new OrganizationsService(
    dataSource as never,
    orgsRepo as never,
    membersRepo as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws when membership is missing', async () => {
    membersRepo.findOne.mockResolvedValue(null);
    await expect(
      service.getMembershipOrThrow('u1', 'o1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns membership when present', async () => {
    const membership = { userId: 'u1', organizationId: 'o1' };
    membersRepo.findOne.mockResolvedValue(membership);
    await expect(service.getMembershipOrThrow('u1', 'o1')).resolves.toEqual(
      membership,
    );
  });
});
