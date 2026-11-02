// call.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from './user.entity';
import { Contact } from './contacts.entity';

@Entity()
@Index(['twilioCallSid'])
@Index(['conversation', 'contact'])
export class Call {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.calls)
  @JoinColumn()
  conversation: Conversation;

  @ManyToOne(() => Contact)
  @JoinColumn()
  contact: Contact;

  @Column({ nullable: true })
  businessId: string;

  @ManyToOne(() => User)
  @JoinColumn()
  callBy: User;

  @Column({ type: 'float', default: 0 })
  minutesTalked: number;

  @Column({ default: false })
  isCanceled: boolean;

  @Column({ default: false })
  isReceived: boolean;

  @CreateDateColumn()
  callTime: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ nullable: true })
  twilioCallSid: string;

  @Column({ nullable: true })
  recordingUrl: string;

  @Column({
    type: 'enum',
    enum: [
      'initiated',
      'ringing',
      'in-progress',
      'completed',
      'failed',
      'busy',
      'no-answer',
    ],
    default: 'initiated',
  })
  status: string;

  @Column({ nullable: true })
  duration: number;

  @Column({ default: false })
  hasVoicemail: boolean;

  @Column({ nullable: true })
  recordingSid: string;

  @Column({ nullable: true })
  recordingStatus: string;

  @Column({ nullable: true })
  recordingDuration: number;

  @Column({ nullable: true })
  recordingChannels: string;

  @Column({ nullable: true })
  recordingSource: string;

  @Column({ nullable: true })
  answeredBy: string;

  @Column({ nullable: true })
  machineDuration: number;

  @Column({ default: false })
  isRecordingEnabled: boolean;
}
