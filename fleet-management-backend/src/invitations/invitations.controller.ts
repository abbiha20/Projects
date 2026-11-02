// invitation.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Get,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { InvitationService } from './invitations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('invitation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvitationController {
  constructor(
    private invitationService: InvitationService,
    private configService: ConfigService,
  ) {}

  @Post()
  @Roles('owner', 'admin', 'manager')
  async createInvitation(
    @Body() createInvitationDto: CreateInvitationDto,
    @Req() req,
  ) {
    try {
      // Check for valid roles
      if (!['owner', 'manager', 'member'].includes(createInvitationDto.role)) {
        throw new BadRequestException(
          'Invalid role. Must be either "owner", "manager", or "member".',
        );
      }

      // Call the service to create the invitation
      const invitation = await this.invitationService.createInvitation(
        createInvitationDto.email,
        createInvitationDto.role,
        createInvitationDto.location,
        req.user.id,
      );

      // Return success response
      return { message: 'Invitation sent successfully', invitation };
    } catch (error) {
      console.log(error);
      if (error instanceof BadRequestException) {
        throw error;
      }
    }
  }

  @Public()
  @Get('verify/:token')
  async verifyInvitation(@Param('token') token: string, @Res() res: Response) {
    try {
      const invitation = await this.invitationService.verifyInvitation(token);
      res.redirect(
        `${this.configService.get<string>('url.FRONTEND_URL')}/invitation/verify/${encodeURI(invitation.email.toLowerCase())}`,
      );
    } catch (error) {
      res.redirect(
        `${this.configService.get<string>('url.FRONTEND_URL')}/invitation-error?message=${encodeURIComponent(error.message)}`,
      );
    }
  }
}
