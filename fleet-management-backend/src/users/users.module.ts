import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { User } from '../entities/user.entity';
import { Invitation } from '../entities/invitation.entity';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Invitation, Permission, Role])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
