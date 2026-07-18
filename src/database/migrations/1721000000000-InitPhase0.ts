import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitPhase01721000000000 implements MigrationInterface {
  name = 'InitPhase01721000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "display_name" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_organizations" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "organization_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "organization_id" uuid NOT NULL,
        "role" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_org_members_user_org" UNIQUE ("user_id", "organization_id"),
        CONSTRAINT "PK_organization_members" PRIMARY KEY ("id"),
        CONSTRAINT "FK_org_members_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_org_members_org" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "teams" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "organization_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_teams" PRIMARY KEY ("id"),
        CONSTRAINT "FK_teams_org" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "team_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "team_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "team_role" character varying NOT NULL DEFAULT 'member',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_team_members_team_user" UNIQUE ("team_id", "user_id"),
        CONSTRAINT "PK_team_members" PRIMARY KEY ("id"),
        CONSTRAINT "FK_team_members_team" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_team_members_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "team_members"`);
    await queryRunner.query(`DROP TABLE "teams"`);
    await queryRunner.query(`DROP TABLE "organization_members"`);
    await queryRunner.query(`DROP TABLE "organizations"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
