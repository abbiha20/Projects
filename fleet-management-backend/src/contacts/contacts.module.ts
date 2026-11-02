import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { ListController } from './list.controller';
import { Contact } from '../entities/contacts.entity';
import { ContactsCsvService } from './contacts-csv.service';
import { ListService } from './list.service';
import { CustomPropertyService } from './custom-property.service';
import { CustomPropertyController } from './custom-property.controller';
import { ContactCustomProperty } from '../entities/contact-custom-property.entity';
import { CustomPropertyDefinition } from '../entities/custom-property-definition.entity';
import { List } from '../entities/listContact.entity';
import { EncryptionService } from '../encryption/encryption.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contact,
      ContactCustomProperty,
      CustomPropertyDefinition,
      List,
    ]),
  ],
  providers: [
    ContactsService,
    ContactsCsvService,
    CustomPropertyService,
    ListService,
    EncryptionService,
  ],
  controllers: [ContactsController, CustomPropertyController, ListController],
  exports: [ContactsService, ContactsCsvService, CustomPropertyService],
})
export class ContactsModule implements OnModuleInit {
  constructor(private readonly encryptionService: EncryptionService) {}

  onModuleInit() {
    Contact.setEncryptionService(this.encryptionService);
  }
}
