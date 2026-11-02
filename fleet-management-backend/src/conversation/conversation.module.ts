import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { Conversation } from '../entities/conversation.entity';
import { Call } from '../entities/call.entity';
import { Message } from '../entities/message.entity';
import { CallLog } from '../entities/call-log.entity';
import { SmsReply } from '../entities/sms-reply.entity';
import { MessageLog } from '../entities/message-log.entity';
import { Contact } from '../entities/contacts.entity';
import { Folder } from '../entities/folder.entity';
import { User } from '../entities/user.entity';
import { VoiceMail } from '../entities/voice-mail.entity';
import { Team } from '../entities/team.entity';

// Call related imports
import { CallService } from './call/call.service';
import { CallController } from './call/call.controller';
import { CallGateway } from './call/call.gateway';

// Other service imports
import { MessageService } from './message/message.service';
import { MessageController } from './message/message.controller';
import { CallLogService } from './ConversationLogs/call-log/call-log.service';
import { CallLogController } from './ConversationLogs/call-log/call-log.controller';
import { MessageLogService } from './ConversationLogs/message-log/message-log.service';
import { MessageLogController } from './ConversationLogs/message-log/message-log.controller';
import { SendSmsService } from './sms/send-sms/send-sms.service';
import { GetSmsService } from './sms/get-sms/get-sms.service';
import { EncryptionService } from '../encryption/encryption.service';
import { FolderModule } from './folder/folder.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      Call,
      Message,
      CallLog,
      MessageLog,
      Contact,
      User,
      SmsReply,
      Folder,
      VoiceMail,
      Team,
    ]),
    FolderModule,
    ConfigModule,
  ],
  controllers: [
    ConversationController,
    CallController,
    MessageController,
    CallLogController,
    MessageLogController,
  ],
  providers: [
    // Core services
    ConversationService,
    EncryptionService,

    // Call related services
    CallService,
    CallGateway,

    // Message related services
    MessageService,
    CallLogService,
    MessageLogService,
    SendSmsService,
    GetSmsService,
  ],
  exports: [
    TypeOrmModule,
    CallService, // Export CallService if needed by other modules
    CallGateway, // Export CallGateway if needed by other modules
  ],
})
export class ConversationModule {
  constructor(private encryptionService: EncryptionService) {
    // Set up encryption for entities that need it
    Contact.setEncryptionService(this.encryptionService);
    Message.setEncryptionService(this.encryptionService);
  }
}
