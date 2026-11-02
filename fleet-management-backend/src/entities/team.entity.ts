import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { TeamMember } from './team-memeber.entity';
import { User } from './user.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  businessId: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => TeamMember, (teamMember) => teamMember.team)
  members: TeamMember[];

  @ManyToOne(() => User, (user) => user.createdTeams)
  createdBy: User;

  @DeleteDateColumn()
  deletedAt: Date;
}
