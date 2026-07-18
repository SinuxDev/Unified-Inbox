import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { entities } from './entities';

config({ path: process.env.ENV_FILE ?? '.env' });

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USER ?? 'inbox',
  password: process.env.DATABASE_PASSWORD ?? 'inbox',
  database: process.env.DATABASE_NAME ?? 'futurewave_inbox',
  entities,
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
