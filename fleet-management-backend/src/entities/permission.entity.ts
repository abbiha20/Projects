import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Role)
  @JoinColumn()
  role: Role;

  @Column({ nullable: true })
  businessId: string;

  @Column({ default: false })
  conversationAssignedToOthers: boolean;

  @Column({ default: false })
  unassignedConversations: boolean;

  @Column({ default: false })
  updateRolePermissions: boolean;

  @Column({ default: false })
  accessMessageFeed: boolean;

  @Column({ default: false })
  accessContacts: boolean;

  @Column({ default: false })
  accessManualCampaigns: boolean;

  @Column({ default: false })
  accessAutomatedCampaigns: boolean;

  @Column({ default: false })
  editDeleteAndCreateTemplates: boolean;

  @Column({ default: false })
  editDeleteAndCreateContactProperties: boolean;
}
