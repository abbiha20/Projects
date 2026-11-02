import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { Notification } from './notification.entity';
import { Invitation } from './invitation.entity';
import { Contact } from './contacts.entity';
import { TeamMember } from './team-memeber.entity';
import { Team } from './team.entity';
import { Permission } from './permission.entity';
import { SimpleCampaign } from './simple-campaignn.entity';
import { AutomatedCampaign } from './automated-message.entity';
import { Conversation } from './conversation.entity';
import { Call } from './call.entity';
import { Message } from './message.entity';
import { Task } from './task.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column()
  location: string;

  @Column()
  isVerified: boolean;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column()
  role: string;
  @Column({ nullable: true })
  businessId: string;

  @Column({ unique: true })
  username: string;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Invitation, (invitation) => invitation.invitedBy)
  sentInvitations: Invitation[];

  @OneToMany(() => Contact, (contact) => contact.createdBy)
  contacts: Contact[];

  @OneToMany(() => TeamMember, (teamMember) => teamMember.user)
  teamMemberships: TeamMember[];

  @OneToMany(() => Team, (team) => team.createdBy)
  createdTeams: Team[];

  @OneToMany(() => Permission, (permission) => permission.user)
  permissions: Permission[];

  @OneToMany(() => SimpleCampaign, (campaign) => campaign.createdBy)
  simpleCampaigns: SimpleCampaign[];

  @OneToMany(() => AutomatedCampaign, (campaign) => campaign.createdBy)
  automatedCampaigns: AutomatedCampaign[];

  @OneToMany(() => Conversation, (conversation) => conversation.assignedTo)
  assignedConversations: Conversation[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Call, (call) => call.callBy)
  madeCalls: Call[];
  @OneToMany(() => Task, (task) => task.assignedTo)
  assignedTasks: Task[];

  @DeleteDateColumn()
  deletedAt: Date;
}
