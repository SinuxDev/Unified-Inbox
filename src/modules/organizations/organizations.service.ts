import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrgRole } from '../../common/enums/org-role.enum';
import { User } from '../users/user.entity';
import { Organization } from './organization.entity';
import { OrganizationMember } from './organization-member.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Organization)
    private readonly orgsRepo: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private readonly membersRepo: Repository<OrganizationMember>,
  ) {}

  async createWithOwner(
    name: string,
    owner: User,
  ): Promise<{ organization: Organization; membership: OrganizationMember }> {
    return this.dataSource.transaction(async (manager) => {
      const organization = await manager.save(
        manager.create(Organization, { name }),
      );
      const membership = await manager.save(
        manager.create(OrganizationMember, {
          organizationId: organization.id,
          userId: owner.id,
          role: OrgRole.Owner,
        }),
      );
      return { organization, membership };
    });
  }

  async getMembership(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationMember | null> {
    return this.membersRepo.findOne({
      where: { userId, organizationId },
      relations: { organization: true },
    });
  }

  async getMembershipOrThrow(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationMember> {
    const membership = await this.getMembership(userId, organizationId);
    if (!membership) {
      throw new NotFoundException('Organization membership not found');
    }
    return membership;
  }

  async findForUser(userId: string): Promise<OrganizationMember[]> {
    return this.membersRepo.find({
      where: { userId },
      relations: { organization: true },
      order: { createdAt: 'ASC' },
    });
  }
}
