import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class NotificationSave {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  body: string;

  @Column({ nullable: true })
  data: string;

  @Column({ nullable: true })
  businessId: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  fcmToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.notifications)
  user: User;
}
