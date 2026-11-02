import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectMessage } from '../entities/direct-message.entity';
import { DirectMessageController } from './direct-message.controller';
import { DirectMessageService } from './direct-message.service';

@Module({
  imports: [TypeOrmModule.forFeature([DirectMessage])],
  controllers: [DirectMessageController],
  providers: [DirectMessageService],
})
export class DirectMessageModule {}
