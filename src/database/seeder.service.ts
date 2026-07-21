import { Injectable } from '@nestjs/common';
import { DevUserSeed } from './seeds/dev-user.seed';

@Injectable()
export class SeederService {
  constructor(private readonly devUserSeed: DevUserSeed) {}

  async run(): Promise<void> {
    await this.devUserSeed.run();
  }
}
