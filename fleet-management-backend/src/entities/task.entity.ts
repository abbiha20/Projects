import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Contact } from './contacts.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  businessId: string;

  @Column({ nullable: true })
  fileUrl: string;

  @ManyToOne(() => User, (user) => user.assignedTasks)
  assignedTo: User;

  @ManyToOne(() => Contact, (contact) => contact.tasks)
  contact: Contact;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;
}
