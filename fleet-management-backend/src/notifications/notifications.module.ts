import { Module } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
