import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { CampaignMessage } from './campaign-message.entity';

@Entity()
export class AutomatedCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column('simple-array', { nullable: true })
  assignTo: string[];
  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.automatedCampaigns)
  createdBy: User;

  @Column()
  triggerEvent: string;

  @Column('simple-json', { nullable: true })
  triggerConditions: { [key: string]: any };

  @OneToMany(() => CampaignMessage, (message) => message.automatedCampaign)
  messages: CampaignMessage[];

  @Column('simple-array', { nullable: true })
  phoneNumbers: string[];
}
