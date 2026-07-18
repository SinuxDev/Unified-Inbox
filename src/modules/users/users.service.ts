import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email: email.toLowerCase() } });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async create(email: string, passwordHash: string, displayName?: string) {
    const user = this.usersRepo.create({
      email: email.toLowerCase(),
      passwordHash,
      displayName: displayName ?? null,
    });
    return this.usersRepo.save(user);
  }
}
