import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

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

    expect(register.body.accessToken).toBeDefined();

    const me = await request(app.getHttpServer())
      .get('/organizations/me')
      .set('Authorization', `Bearer ${register.body.accessToken}`)
      .expect(200);

    expect(me.body.organizationName).toBe('Acme');
    expect(me.body.role).toBe('owner');

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'owner@example.com', password: 'password1' })
      .expect(201);

    expect(login.body.accessToken).toBeDefined();
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

    const meA = await request(app.getHttpServer())
      .get('/organizations/me')
      .set('Authorization', `Bearer ${a.body.accessToken}`)
      .expect(200);

    const meB = await request(app.getHttpServer())
      .get('/organizations/me')
      .set('Authorization', `Bearer ${b.body.accessToken}`)
      .expect(200);

    expect(meA.body.organizationId).not.toEqual(meB.body.organizationId);
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

    const team = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${register.body.accessToken}`)
      .send({ name: 'Support' })
      .expect(201);

    expect(team.body.name).toBe('Support');
  });
});
