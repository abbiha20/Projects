import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { Contact } from '../entities/contacts.entity';
import { EmailService } from '../email/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User, Contact])],
  providers: [TaskService, EmailService],
  controllers: [TaskController],
})
export class TaskModule {}
