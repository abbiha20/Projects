import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { GroupMessageService } from './group-message.service';
import { Group } from '../entities/group.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { Conversation } from '../entities/conversation.entity';
import { EncryptionService } from '../encryption/encryption.service';

@Module({
  imports: [TypeOrmModule.forFeature([Group, Message, User, Conversation])],
  controllers: [GroupController],
  providers: [GroupService, GroupMessageService, EncryptionService],
  exports: [GroupService, GroupMessageService],
})
export class GroupModule {
  constructor(private encryptionService: EncryptionService) {
    Message.setEncryptionService(this.encryptionService);
  }
}
