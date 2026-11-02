import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CampaignMessage } from './campaign-message.entity';

@Entity()
export class SimpleCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.simpleCampaigns)
  createdBy: User;

  @Column({ nullable: true })
  businessId: string;

  @Column()
  startType: 'immediate' | 'scheduled';

  @Column({ nullable: true })
  scheduledDate: Date;

  @OneToMany(() => CampaignMessage, (message) => message.simpleCampaign)
  messages: CampaignMessage[];

  @Column('simple-array', { nullable: true })
  phoneNumbers: string[];

  @DeleteDateColumn()
  deletedAt: Date;
}
