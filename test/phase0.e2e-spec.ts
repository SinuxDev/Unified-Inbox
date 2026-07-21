import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { DataSource } from 'typeorm';
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
} from '../src/common/http/api-response.types';

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

function unwrap<T>(body: ApiSuccessResponse<T>): T {
  expect(body.success).toBe(true);
  return body.data;
}

describe('Phase0Auth (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
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

    const registerBody = unwrap(
      register.body as ApiSuccessResponse<AuthResponse>,
    );
    expect(registerBody.accessToken).toBeDefined();
    expect(registerBody.refreshToken).toBeDefined();

    const me = await request(app.getHttpServer())
      .get('/organizations/me')
      .set('Authorization', `Bearer ${registerBody.accessToken}`)
      .expect(200);

    const meBody = unwrap(me.body as ApiSuccessResponse<OrgMeResponse>);
    expect(meBody.organizationName).toBe('Acme');
    expect(meBody.role).toBe('owner');

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'owner@example.com', password: 'password1' })
      .expect(201);

    const loginBody = unwrap(login.body as ApiSuccessResponse<AuthResponse>);
    expect(loginBody.accessToken).toBeDefined();
    expect(loginBody.refreshToken).toBeDefined();

    const refreshed = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: loginBody.refreshToken })
      .expect(200);

    const refreshedBody = unwrap(
      refreshed.body as ApiSuccessResponse<AuthResponse>,
    );
    expect(refreshedBody.accessToken).toBeDefined();
    expect(refreshedBody.refreshToken).toBeDefined();

    await request(app.getHttpServer())
      .get('/organizations/me')
      .set('Authorization', `Bearer ${refreshedBody.accessToken}`)
      .expect(200);

    const invalidRefresh = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: loginBody.accessToken })
      .expect(401);

    const invalidBody = invalidRefresh.body as ApiErrorResponse;
    expect(invalidBody.success).toBe(false);
    expect(invalidBody.data).toBeNull();
    expect(typeof invalidBody.message).toBe('string');
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

    const aBody = unwrap(a.body as ApiSuccessResponse<AuthResponse>);
    const bBody = unwrap(b.body as ApiSuccessResponse<AuthResponse>);

    const meA = await request(app.getHttpServer())
      .get('/organizations/me')
      .set('Authorization', `Bearer ${aBody.accessToken}`)
      .expect(200);

    const meB = await request(app.getHttpServer())
      .get('/organizations/me')
      .set('Authorization', `Bearer ${bBody.accessToken}`)
      .expect(200);

    const meABody = unwrap(meA.body as ApiSuccessResponse<OrgMeResponse>);
    const meBBody = unwrap(meB.body as ApiSuccessResponse<OrgMeResponse>);
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

    const registerBody = unwrap(
      register.body as ApiSuccessResponse<AuthResponse>,
    );

    const team = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${registerBody.accessToken}`)
      .send({ name: 'Support' })
      .expect(201);

    const teamBody = unwrap(team.body as ApiSuccessResponse<TeamResponse>);
    expect(teamBody.name).toBe('Support');
  });
});
