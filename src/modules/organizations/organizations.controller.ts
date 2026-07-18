import { Controller, Get, UseGuards } from '@nestjs/common';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    const membership = await this.organizationsService.getMembershipOrThrow(
      user.userId,
      user.organizationId,
    );
    return {
      organizationId: membership.organizationId,
      organizationName: membership.organization.name,
      role: membership.role,
      userId: user.userId,
      email: user.email,
    };
  }

  @Get()
  async listMine(@CurrentUser() user: AuthUser) {
    const memberships = await this.organizationsService.findForUser(
      user.userId,
    );
    return memberships.map((m) => ({
      organizationId: m.organizationId,
      organizationName: m.organization.name,
      role: m.role,
    }));
  }
}
