import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from './user.entity';
import { EncryptionService } from '../encryption/encryption.service';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation;

  @ManyToOne(() => User, { nullable: true })
  sender: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  isScheduled: boolean;

  @Column({ nullable: true })
  scheduleAt: Date;

  @Column({ default: false })
  isRecurring: boolean;

  @Column({ nullable: true })
  recurrencePattern: string;

  @Column({ type: 'simple-array', nullable: true })
  fileURLs: string[];

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ default: false })
  isDelivered: boolean;

  @Column({ nullable: true })
  deliveryError?: string;

  private static encryptionService: EncryptionService;

  public static setEncryptionService(service: EncryptionService) {
    Message.encryptionService = service;
  }

  @BeforeInsert()
  @BeforeUpdate()
  encryptSensitiveData() {
    if (this.content) {
      this.content = Message.encryptionService.encrypt(this.content);
    }
  }

  @AfterLoad()
  decryptSensitiveData() {
    if (this.content) {
      this.content = this.tryDecrypt(this.content);
    }
  }

  private tryDecrypt(value: string): string {
    try {
      return Message.encryptionService.decrypt(value);
    } catch {
      return value;
    }
  }
}
