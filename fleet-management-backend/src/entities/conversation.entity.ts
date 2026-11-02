// conversation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Contact } from './contacts.entity';
import { Message } from './message.entity';
import { Call } from './call.entity';
import { SmsReply } from './sms-reply.entity';
import { Team } from './team.entity';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The contact involved in the conversation
  @ManyToOne(() => Contact, (contact) => contact.conversations)
  contact: Contact;

  // The user assigned to the conversation
  @ManyToOne(() => User, (user) => user.assignedConversations, {
    nullable: true,
  })
  assignedTo: User;

  @Column({ default: false })
  assign: boolean;

  @Column({ nullable: true })
  businessId: string;

  @Column({ type: 'simple-array', nullable: true })
  fileURLs: string[];

  @Column({ nullable: true })
  senderLocation: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  teamAutoAssign: boolean;

  @Column({ default: false })
  memberAutoAssign: boolean;

  @Column({ default: false })
  customSignature: boolean;

  @Column({ nullable: true })
  signatureText: string;

  @Column({ default: false })
  addFlag: boolean;

  @Column({ default: false })
  read: boolean;

  @Column({ default: true })
  isOpen: boolean;
  @Column({ default: 0 })
  count: number;

  @Column({ default: false })
  block: boolean;

  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: true,
  })
  messages: Message[];

  @OneToMany(() => Call, (call) => call.conversation, { cascade: true })
  calls: Call[];

  @CreateDateColumn()
  createdAt: Date;
  @OneToMany(() => SmsReply, (smsReply) => smsReply.conversation, {
    cascade: true,
  })
  smsReplies: SmsReply[];

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Team, { nullable: true })
  assignedTeam: Team;

  @Column({ default: false })
  assignTeam: boolean;
}
