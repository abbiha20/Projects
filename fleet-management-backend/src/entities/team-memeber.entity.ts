import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Team } from './team.entity';

@Entity()
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.teamMemberships)
  user: User;

  @ManyToOne(() => Team, (team) => team.members)
  team: Team;

  @Column()
  role: 'owner' | 'manager' | 'member';

  @DeleteDateColumn()
  deletedAt: Date;
}
