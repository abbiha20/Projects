import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RolesModule } from './roles/roles.module';
import { UserModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { InvitationModule } from './invitations/invitations.module';
import { NotificationModule } from './notifications/notifications.module';
import { EmailModule } from './email/email.module';
import configuration from './config/configuration';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { DataSource } from 'typeorm';
import { ContactsModule } from './contacts/contacts.module';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionTeamModule } from './permission-team/permission-team.module';
import { CampaignModule } from './campaign/campaign.module';
import { EventModule } from './event/event.module';
import { CampaignSchedulerService } from './event/event.service';
import { SimpleCampaign } from './entities/simple-campaignn.entity';
import { CampaignMessage } from './entities/campaign-message.entity';
import { ConversationModule } from './conversation/conversation.module';
import { ConversationService } from './conversation/conversation.service';
import { SendSmsService } from './conversation/sms/send-sms/send-sms.service';
import { GetSmsService } from './conversation/sms/get-sms/get-sms.service';
import { ConversationController } from './conversation/conversation.controller';
import { S3Service } from './utils/s3/s3.service';
import { TaskModule } from './task/task.module';
import { EncryptionService } from './encryption/encryption.service';
import { GroupModule } from './group/group.module';
import { BusinessModule } from './utils/business/business.module';
import { DirectMessageModule } from './direct-message/direct-message.module';
import { DirectMessage } from './entities/direct-message.entity';
import { TemplateModule } from './template/template.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [...configService.get('database.entities'), DirectMessage],
        migrations: configService.get('database.migrations'),
        migrationsRun: true,
        synchronize: false,
      }),
      inject: [ConfigService],
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
    TypeOrmModule.forFeature([SimpleCampaign, CampaignMessage, DirectMessage]),
    RolesModule,
    UserModule,
    AuthModule,
    InvitationModule,
    NotificationModule,
    EmailModule,
    ContactsModule,
    PermissionTeamModule,
    CampaignModule,
    EventModule,
    ConversationModule,
    TaskModule,
    GroupModule,
    BusinessModule,
    DirectMessageModule,
    TemplateModule,
  ],
  controllers: [ConversationController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    CampaignSchedulerService,
    ConversationService,
    SendSmsService,
    GetSmsService,
    S3Service,
    EncryptionService,
  ],
  exports: [CampaignSchedulerService],
})
export class AppModule {}
