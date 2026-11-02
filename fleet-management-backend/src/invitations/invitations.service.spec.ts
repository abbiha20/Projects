// src/invitations/invitations.service.ts

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invitation } from '../entities/invitation.entity';
import { Repository } from 'typeorm';
// import { CreateInvitationDto } from './dto/create-invitation.dto';
import { User } from '../entities/user.entity';
import { EmailService } from '../email/email.service';
// import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private invitationsRepository: Repository<Invitation>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Creates and sends an invitation.
   * @param createInvitationDto Data for creating an invitation.
   * @param inviter The user sending the invitation.
   */
  // async createInvitation(
  //   createInvitationDto: CreateInvitationDto,
  //   inviter: User,
  // ): Promise<Invitation> {
  //   const { email } = createInvitationDto;

  //   // Check if the email is already registered
  //   const existingUser = await this.usersRepository.findOne({
  //     where: { email },
  //   });
  //   if (existingUser) {
  //     throw new BadRequestException('User with this email already exists.');
  //   }

  //   // Check if an active invitation already exists
  //   const existingInvitation = await this.invitationsRepository.findOne({
  //     where: { email, isVerified: false },
  //   });
  //   if (existingInvitation) {
  //     throw new BadRequestException(
  //       'An active invitation already exists for this email.',
  //     );
  //   }

  //   // Generate a unique token
  //   const invitationToken = crypto.randomBytes(32).toString('hex');

  //   // Set expiration (e.g., 7 days from now)
  //   const expiresAt = new Date();
  //   expiresAt.setDate(expiresAt.getDate() + 7);

  //   // Create the invitation record
  //   const invitation = this.invitationsRepository.create({
  //     email,
  //     invitedBy: inviter,
  //     invitationToken,
  //     expiresAt,
  //   });

  //   await this.invitationsRepository.save(invitation);

  //   // Send the invitation email
  //   await this.emailService.sendInvitationEmail(
  //     email,
  //     inviter,
  //     invitationToken,
  //   );

  //   return invitation;
  // }

  /**
   * Accepts an invitation using the token.
   * @param invitationToken The unique token from the invitation link.
   * @param userData Data to create a new user account.
   */
  async acceptInvitation(
    invitationToken: string,
    userData: Partial<User>,
  ): Promise<User> {
    const invitation = await this.invitationsRepository.findOne({
      where: { invitationToken, isVerified: false },
      relations: ['invitedBy'],
    });

    if (!invitation) {
      throw new NotFoundException('Invalid or already used invitation token.');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation token has expired.');
    }

    // Check if the email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: invitation.email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists.');
    }

    // Create the new user
    const newUser = this.usersRepository.create({
      email: invitation.email,
      name: userData.name,
      password: userData.password, // Ensure password is hashed in User creation lifecycle
      phoneNumber: userData.phoneNumber,
      role: 'member', // Default role; adjust as needed
    });

    await this.usersRepository.save(newUser);

    // Mark the invitation as verified
    invitation.isVerified = true;
    await this.invitationsRepository.save(invitation);

    return newUser;
  }
}
