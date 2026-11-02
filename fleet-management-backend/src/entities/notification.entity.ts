// src/entities/notification.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  businessId: string;

  @ManyToOne(() => User, (user) => user.notifications)
  user: User;
  @Column({ default: false })
  desktopNewVoicemail: boolean;

  @Column({ default: false })
  emailNewVoicemail: boolean;

  @Column({ default: false })
  desktopNewConversation: boolean;

  @Column({ default: false })
  emailNewConversation: boolean;

  @Column({ default: false })
  desktopIncomingMessage: boolean;

  @Column({ default: false })
  emailIncomingMessage: boolean;

  @Column({ default: false })
  desktopNewWebchatQuery: boolean;

  @Column({ default: false })
  emailNewWebchatQuery: boolean;

  @Column({ default: false })
  desktopMissedCall: boolean;

  @Column({ default: false })
  emailMissedCall: boolean;

  @Column({ default: false })
  desktopNewReview: boolean;

  @Column({ default: false })
  emailNewReview: boolean;
}
