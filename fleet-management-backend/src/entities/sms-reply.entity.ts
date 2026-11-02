// sms-reply.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity()
export class SmsReply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.smsReplies)
  conversation: Conversation;

  @Column()
  sid: string;

  @Column({ type: 'text' })
  body: string;

  @Column()
  from: string;

  @Column()
  to: string;

  @CreateDateColumn()
  dateCreated: Date;

  @Column()
  direction: string;

  @Column({ type: 'simple-array', nullable: true })
  fileURLs: string[];

  @Column({ nullable: true })
  mediaType: string;

  @Column({ nullable: true })
  mediaContentType: string;

  @Column({ nullable: true })
  mediaSize: number;
}
