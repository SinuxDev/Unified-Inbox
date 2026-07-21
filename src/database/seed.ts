import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { SeederService } from './seeder.service';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to seed a production database.');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    await app.get(SeederService).run();
    console.log('Seeding complete.');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void bootstrap();
