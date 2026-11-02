// contact-custom-property.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Contact } from './contacts.entity';
import { CustomPropertyDefinition } from './custom-property-definition.entity';

@Entity()
export class ContactCustomProperty {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ nullable: true })
  businessId: string;
  @ManyToOne(() => Contact, (contact) => contact.customProperties)
  contact: Contact;

  @ManyToOne(() => CustomPropertyDefinition)
  propertyDefinition: CustomPropertyDefinition;

  @Column({ type: 'text', nullable: true })
  value: string;
}
