import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

type OrgMeResponse = {
  organizationId: string;
  organizationName: string;
  role: string;
};

type TeamResponse = {
  name: string;
};

describe('Phase0Auth (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE team_members, teams, organization_members, organizations, users RESTART IDENTITY CASCADE',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers, logs in, and returns tenant-scoped org', async () => {
    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'owner@example.com',
        password: 'password1',
        organizationName: 'Acme',
        displayName: 'Owner',
      })
      .expect(201);

    const registerBody = register.body as AuthResponse;
    expect(registerBody.accessToken).toBeDefined();
    expect(registerBody.refreshToken).toBeDefined();

    const me = await request(app.getHttpServer())
      .get('/organizations/me')
      .set('Authorization', `Bearer ${registerBody.accessToken}`)
      .expect(200);

    const meBody = me.body as OrgMeResponse;
    expect(meBody.organizationName).toBe('Acme');
    expect(meBody.role).toBe('owner');

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'owner@example.com', password: 'password1' })
      .expect(201);

    const loginBody = login.body as AuthResponse;
    expect(loginBody.accessToken).toBeDefined();
    expect(loginBody.refreshToken).toBeDefined();

    const refreshed = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: loginBody.refreshToken })
      .expect(200);

    const refreshedBody = refreshed.body as AuthResponse;
    expect(refreshedBody.accessToken).toBeDefined();
    expect(refreshedBody.refreshToken).toBeDefined();

    await request(app.getHttpServer())
      .get('/organizations/me')
      .set('Authorization', `Bearer ${refreshedBody.accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: loginBody.accessToken })
      .expect(401);
  });

  it('denies cross-tenant organization access via forged org id in token path', async () => {
    const a = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'a@example.com',
        password: 'password1',
        organizationName: 'OrgA',
      })
      .expect(201);

    const b = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'b@example.com',
        password: 'password1',
        organizationName: 'OrgB',
      })
      .expect(201);

    const aBody = a.body as AuthResponse;
    const bBody = b.body as AuthResponse;

    const meA = await request(app.getHttpServer())
      .get('/organizations/me')
      .set('Authorization', `Bearer ${aBody.accessToken}`)
      .expect(200);

    const meB = await request(app.getHttpServer())
      .get('/organizations/me')
      .set('Authorization', `Bearer ${bBody.accessToken}`)
      .expect(200);

    const meABody = meA.body as OrgMeResponse;
    const meBBody = meB.body as OrgMeResponse;
    expect(meABody.organizationId).not.toEqual(meBBody.organizationId);
  });

  it('creates a team for owners', async () => {
    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'teamowner@example.com',
        password: 'password1',
        organizationName: 'TeamOrg',
      })
      .expect(201);

    const registerBody = register.body as AuthResponse;

    const team = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${registerBody.accessToken}`)
      .send({ name: 'Support' })
      .expect(201);

    const teamBody = team.body as TeamResponse;
    expect(teamBody.name).toBe('Support');
  });
});
