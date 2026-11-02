import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationService implements OnModuleInit {
  private fcm: admin.messaging.Messaging;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const serviceAccount = {
      projectId: this.configService.get('fcm.projectId'),
      privateKey: this.configService
        .get('fcm.privateKey')
        .replace(/\\n/g, '\n'),
      clientEmail: this.configService.get('fcm.clientEmail'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    this.fcm = admin.messaging();
  }

  async sendDesktopNotification(
    token: string,
    title: string,
    body: string,
    data?: any,
  ) {
    try {
      const message: admin.messaging.Message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        token,
      };

      const response = await this.fcm.send(message);
      console.log('Successfully sent message:', response);
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async sendMulticastNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: any,
  ) {
    try {
      const message: admin.messaging.MulticastMessage = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens,
      };

      const response = await this.fcm.sendMulticast(message);
      console.log('Successfully sent multicast message:', response);
      return response;
    } catch (error) {
      console.error('Error sending multicast message:', error);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyNotifications() {
    console.log('Running daily notifications');
  }
}
