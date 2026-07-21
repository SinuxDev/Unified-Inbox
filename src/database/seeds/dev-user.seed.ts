import { Injectable, Logger } from '@nestjs/common';
import { OrganizationsService } from '../../modules/organizations/organizations.service';
import { PasswordService } from '../../modules/auth/password.service';
import { UsersService } from '../../modules/users/users.service';
import { DatabaseSeed } from './seed.interface';

@Injectable()
export class DevUserSeed implements DatabaseSeed {
  private readonly logger = new Logger(DevUserSeed.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService,
    private readonly passwordService: PasswordService,
  ) {}

  async run(): Promise<void> {
    const email = (
      process.env.SEED_DEV_USER_EMAIL ?? 'owner@example.com'
    ).toLowerCase();
    const password = process.env.SEED_DEV_USER_PASSWORD ?? 'Password123!';
    const organizationName =
      process.env.SEED_DEV_ORG_NAME ?? 'Dev Organization';
    const displayName = process.env.SEED_DEV_USER_DISPLAY_NAME ?? 'Dev Owner';

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      const memberships = await this.organizationsService.findForUser(
        existing.id,
      );
      if (memberships.length > 0) {
        this.logger.log(`Dev user already exists (${email}); skipping.`);
        return;
      }

      await this.organizationsService.createWithOwner(
        organizationName,
        existing,
      );
      this.logger.log(`Linked existing user ${email} to ${organizationName}.`);
      return;
    }

    const passwordHash = await this.passwordService.hash(password);
    const user = await this.usersService.create(
      email,
      passwordHash,
      displayName,
    );
    await this.organizationsService.createWithOwner(organizationName, user);

    this.logger.log(
      `Seeded dev user ${email}. Login with SEED_DEV_USER_PASSWORD or the default from .env.example.`,
    );
  }
}
