// message-log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class MessageLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  totalConversations: number;

  @Column({ nullable: true })
  businessId: string;

  @Column({ default: 0 })
  openCount: number;

  @Column({ default: 0 })
  closeCount: number;

  @Column({ default: 0 })
  unassignedCount: number;

  @Column({ default: 0 })
  assignedCount: number;

  @CreateDateColumn()
  date: Date;
}
