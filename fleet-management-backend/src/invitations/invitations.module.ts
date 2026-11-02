import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { InvitationController } from './invitations.controller';
import { InvitationService } from './invitations.service';
import { Invitation } from '../entities/invitation.entity';
import { Team } from '../entities/team.entity';
import { TeamMember } from '../entities/team-memeber.entity';
import { User } from '../entities/user.entity';
import { EmailService } from '../email/email.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitation, User, Team, TeamMember]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.memberSecret'),
        signOptions: { expiresIn: '10d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [InvitationController],
  providers: [InvitationService, EmailService],
})
export class InvitationModule {}
