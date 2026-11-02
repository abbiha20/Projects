import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { SimpleCampaign } from './simple-campaignn.entity';
import { AutomatedCampaign } from './automated-message.entity';

@Entity()
export class CampaignMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  message: string;
  @Column({ nullable: true })
  businessId: string;

  @Column({ nullable: true })
  templateId: string;

  @Column({ nullable: true })
  formRequestId: string;

  @Column('simple-array', { nullable: true })
  assignedReplies: string[];

  @Column({ default: false })
  autoTranslate: boolean;

  @Column({ nullable: true })
  confirmationText: string;

  @Column({ nullable: true })
  optOutMessage: string;

  @Column('simple-array', { nullable: true })
  shortenedUrls: string[];

  @ManyToOne(() => SimpleCampaign, (campaign) => campaign.messages)
  simpleCampaign: SimpleCampaign;

  @ManyToOne(() => AutomatedCampaign, (campaign) => campaign.messages)
  automatedCampaign: AutomatedCampaign;
}
