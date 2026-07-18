import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrgRole } from '../../common/enums/org-role.enum';
import { OrganizationsService } from '../organizations/organizations.service';
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamsRepo: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly teamMembersRepo: Repository<TeamMember>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async createTeam(
    organizationId: string,
    userId: string,
    name: string,
  ): Promise<Team> {
    const membership = await this.organizationsService.getMembershipOrThrow(
      userId,
      organizationId,
    );
    if (
      membership.role !== OrgRole.Owner &&
      membership.role !== OrgRole.Admin
    ) {
      throw new ForbiddenException('Only owners and admins can create teams');
    }
    const team = this.teamsRepo.create({ name, organizationId });
    return this.teamsRepo.save(team);
  }

  async listTeams(organizationId: string, userId: string): Promise<Team[]> {
    await this.organizationsService.getMembershipOrThrow(
      userId,
      organizationId,
    );
    return this.teamsRepo.find({
      where: { organizationId },
      order: { createdAt: 'ASC' },
    });
  }

  async addMember(
    organizationId: string,
    actorUserId: string,
    teamId: string,
    targetUserId: string,
  ): Promise<TeamMember> {
    const membership = await this.organizationsService.getMembershipOrThrow(
      actorUserId,
      organizationId,
    );
    if (
      membership.role !== OrgRole.Owner &&
      membership.role !== OrgRole.Admin
    ) {
      throw new ForbiddenException('Only owners and admins can add members');
    }
    const team = await this.teamsRepo.findOne({
      where: { id: teamId, organizationId },
    });
    if (!team) {
      throw new NotFoundException('Team not found in organization');
    }
    await this.organizationsService.getMembershipOrThrow(
      targetUserId,
      organizationId,
    );
    const member = this.teamMembersRepo.create({
      teamId,
      userId: targetUserId,
      teamRole: 'member',
    });
    return this.teamMembersRepo.save(member);
  }
}
