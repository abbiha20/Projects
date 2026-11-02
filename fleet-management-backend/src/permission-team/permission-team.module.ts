import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionTeamController } from './permission-team/permission-team.controller';
import { TeamService } from './team/team.service';
import { Team } from '../entities/team.entity';
import { User } from '../entities/user.entity';
import { TeamMember } from '../entities/team-memeber.entity';
import { PermissionsService } from './permission/permission.service';
import { RoleSeederService } from './permission/roleseeder.service';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, User, TeamMember, Permission, Role]),
  ],
  controllers: [PermissionTeamController],
  providers: [TeamService, PermissionsService, RoleSeederService],
})
export class PermissionTeamModule {}
