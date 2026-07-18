import { User } from '../modules/users/user.entity';
import { Organization } from '../modules/organizations/organization.entity';
import { OrganizationMember } from '../modules/organizations/organization-member.entity';
import { Team } from '../modules/teams/team.entity';
import { TeamMember } from '../modules/teams/team-member.entity';

export const entities = [
  User,
  Organization,
  OrganizationMember,
  Team,
  TeamMember,
];
