// call-log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class CallLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  businessId: string;

  @Column({ default: 0 })
  totalCalls: number;

  @Column({ default: 0 })
  canceledCalls: number;

  @Column({ default: 0 })
  receivedCalls: number;

  @Column({ type: 'float', default: 0 })
  totalMinutes: number;

  @CreateDateColumn()
  date: Date;
}
