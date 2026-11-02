import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Call } from './call.entity';

@Entity()
export class VoiceMail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Call)
  call: Call;

  @Column()
  recordingUrl: string;

  @Column()
  transcription: string;

  @Column()
  duration: number;

  @CreateDateColumn()
  createdAt: Date;
}
