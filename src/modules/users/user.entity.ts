import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrganizationMember } from '../organizations/organization-member.entity';
import { TeamMember } from '../teams/team-member.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'display_name', nullable: true })
  displayName!: string | null;

  @OneToMany(
    () => OrganizationMember,
    (member: OrganizationMember) => member.user,
  )
  memberships!: OrganizationMember[];

  @OneToMany(() => TeamMember, (member: TeamMember) => member.user)
  teamMemberships!: TeamMember[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
