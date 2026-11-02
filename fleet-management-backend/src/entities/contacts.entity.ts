import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
} from 'typeorm';
import { User } from './user.entity';
import { ContactCustomProperty } from './contact-custom-property.entity';
import { Conversation } from './conversation.entity';
import { Call } from './call.entity';
import { Task } from './task.entity';
import { EncryptionService } from '../encryption/encryption.service';

@Entity()
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  businessId: string;

  @Column()
  lastName: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.contacts)
  createdBy: User;

  @Column()
  originalSource: string;

  @Column({ default: false })
  block: boolean;

  @Column({ default: false })
  optout: boolean;

  @OneToMany(
    () => ContactCustomProperty,
    (customProperty) => customProperty.contact,
    {
      cascade: true,
    },
  )
  customProperties: ContactCustomProperty[];

  @OneToMany(() => Conversation, (conversation) => conversation.contact)
  conversations: Conversation[];

  @OneToMany(() => Call, (call) => call.contact)
  calls: Call[];

  @OneToMany(() => Task, (task) => task.contact)
  tasks: Task[];

  @DeleteDateColumn()
  deletedAt: Date;

  private static encryptionService: EncryptionService;

  public static setEncryptionService(service: EncryptionService) {
    Contact.encryptionService = service;
  }

  @BeforeInsert()
  @BeforeUpdate()
  encryptSensitiveData() {
    if (this.firstName) {
      this.firstName = Contact.encryptionService.encrypt(this.firstName);
    }
    if (this.lastName) {
      this.lastName = Contact.encryptionService.encrypt(this.lastName);
    }
    if (this.phone) {
      this.phone = Contact.encryptionService.encrypt(this.phone);
    }
    if (this.email) {
      this.email = Contact.encryptionService.encrypt(this.email);
    }
  }

  @AfterLoad()
  decryptSensitiveData() {
    if (this.firstName) {
      this.firstName = this.tryDecrypt(this.firstName);
    }
    if (this.lastName) {
      this.lastName = this.tryDecrypt(this.lastName);
    }
    if (this.phone) {
      this.phone = this.tryDecrypt(this.phone);
    }
    if (this.email) {
      this.email = this.tryDecrypt(this.email);
    }
  }

  private tryDecrypt(value: string): string {
    try {
      return Contact.encryptionService.decrypt(value);
    } catch {
      return value;
    }
  }
}
