import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessService } from './business.service';
import { User } from '../../entities/user.entity';
import { Business } from '../../entities/business.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Business])],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
