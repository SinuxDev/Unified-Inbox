import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { OrgRole } from '../../common/enums/org-role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TeamsService } from './teams.service';

class CreateTeamDto {
  @IsString()
  @MinLength(2)
  name!: string;
}

@Controller('teams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.teamsService.listTeams(user.organizationId, user.userId);
  }

  @Post()
  @Roles(OrgRole.Owner, OrgRole.Admin)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTeamDto) {
    return this.teamsService.createTeam(
      user.organizationId,
      user.userId,
      dto.name,
    );
  }
}
