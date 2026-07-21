import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from '../config/configuration';
import { validateEnv } from '../config/env.validation';
import { PasswordService } from '../modules/auth/password.service';
import { OrganizationsModule } from '../modules/organizations/organizations.module';
import { UsersModule } from '../modules/users/users.module';
import { entities } from './entities';
import { SeederService } from './seeder.service';
import { DevUserSeed } from './seeds/dev-user.seed';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.getOrThrow<string>('database.host'),
        port: config.getOrThrow<number>('database.port'),
        username: config.getOrThrow<string>('database.username'),
        password: config.getOrThrow<string>('database.password'),
        database: config.getOrThrow<string>('database.name'),
        entities,
        synchronize: false,
        logging: false,
      }),
    }),
    UsersModule,
    OrganizationsModule,
  ],
  providers: [SeederService, DevUserSeed, PasswordService],
})
export class SeedModule {}
