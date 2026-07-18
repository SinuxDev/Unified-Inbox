import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrganizationMember } from './organization-member.entity';
import { Team } from '../teams/team.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @OneToMany(
    () => OrganizationMember,
    (member: OrganizationMember) => member.organization,
  )
  members!: OrganizationMember[];

  @OneToMany(() => Team, (team: Team) => team.organization)
  teams!: Team[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
