import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ShortUrl {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  shortCode: string;

  @Column()
  originalUrl: string;

  @Column({ default: 0 })
  clicks: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
