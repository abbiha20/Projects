// invitations.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation } from '../entities/invitation.entity';
import { User } from '../entities/user.entity';
import { Team } from '../entities/team.entity';
import { TeamMember } from '../entities/team-memeber.entity';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
    private emailService: EmailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async createInvitation(
    email: string,
    role: 'owner' | 'manager' | 'member',
    location: string,
    invitedByUserId: string,
  ): Promise<Invitation> {
    try {
      const invitedBy = await this.userRepository.findOne({
        where: { id: invitedByUserId },
      });
      console.log(invitedBy.role);
      if (
        !invitedBy ||
        (invitedBy.role !== 'owner' &&
          invitedBy.role !== 'admin' &&
          invitedBy.role !== 'manager')
      ) {
        throw new UnauthorizedException(
          'Only owners and admins can send invitations',
        );
      }

      const existingUser = await this.userRepository.findOne({
        where: { email },
        withDeleted: true, // This includes soft-deleted users
      });

      let existingInvitation = await this.invitationRepository.findOne({
        where: { email },
      });

      if (existingUser && existingUser.deletedAt) {
        existingUser.deletedAt = null;
        await this.userRepository.save(existingUser);
        console.log(`Restored soft-deleted user: ${existingUser.email}`);
      }

      if (existingUser && existingInvitation && existingInvitation.isVerified) {
        throw new ConflictException(
          'A verified user with this email already exists',
        );
      }

      const invitationToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      if (
        existingUser &&
        existingInvitation &&
        !existingInvitation.isVerified
      ) {
        // Update existing unverified user and invitation
        existingUser.role = role;
        existingUser.location = location;
        await this.userRepository.save(existingUser);

        existingInvitation.invitationToken = invitationToken;
        existingInvitation.expiresAt = expiresAt;
        existingInvitation.createdAt = new Date();
        await this.invitationRepository.save(existingInvitation);
      } else {
        // Create new user and invitation if user doesn't exist
        if (!existingUser) {
          const tempPassword = uuidv4();
          const hashedPassword = await bcrypt.hash(tempPassword, 10);
          const newUser = this.userRepository.create({
            email,
            role,
            location,
            password: hashedPassword,
            name: email.split('@')[0],
            username: email.split('@')[0] + Math.floor(Math.random() * 1000),
            isVerified: false,
          });
          await this.userRepository.save(newUser);
        }

        existingInvitation = this.invitationRepository.create({
          email,
          invitedBy,
          invitationToken,
          expiresAt,
        });
        await this.invitationRepository.save(existingInvitation);
      }

      const baseUrl = this.configService.get<string>('url.baseUrl');
      const verificationLink = `${baseUrl}/invitation/verify/${invitationToken}`;

      console.log('sending mail');

      // Send email with invitation
      await this.emailService.sendMail(
        email,
        'Invitation to join our platform',
        `You have been invited to join our platform as a ${role} at location ${location}. Click on the following link to verify your email and set up your account: ${verificationLink}`,
        `<p>You have been invited to join our platform as a ${role} at location ${location}. Click <a href="${verificationLink}">here</a> to verify your email and set up your account.</p>`,
      );

      return existingInvitation;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while creating the invitation',
      );
    }
  }

  async verifyInvitation(token: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { invitationToken: token },
    });
    if (!invitation) {
      throw new NotFoundException('Invalid invitation token');
    }

    if (invitation.isVerified) {
      throw new ConflictException('This invitation has already been verified');
    }

    if (new Date() > invitation.expiresAt) {
      throw new ConflictException('This invitation has expired');
    }

    return invitation;
  }
}
