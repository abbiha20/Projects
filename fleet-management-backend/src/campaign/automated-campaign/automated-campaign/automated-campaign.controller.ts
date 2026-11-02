import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutomatedCampaignService } from './automated-campaign.service';
import { AutomatedCampaignDto } from '../dto/automated-campaign.dto/automated-campaign.dto';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Request } from 'express';
import * as csv from 'csv-parse/sync';

@Controller('automated-campaign')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AutomatedCampaignController {
  constructor(
    private readonly automatedCampaignService: AutomatedCampaignService,
  ) {}

  @Post()
  @Roles('owner', 'admin', 'manager', 'member')
  @UseInterceptors(FileInterceptor('contactsFile'))
  async createCampaign(
    @Body() campaignDto: AutomatedCampaignDto,
    @UploadedFile() contactsFile: Express.Multer.File,
    @Req() req: Request,
  ) {
    const userId = req.user['userId'];
    const userRole = req.user['role'];

    // Check if the user has a valid role
    if (!['owner', 'admin', 'manager', 'member'].includes(userRole)) {
      throw new BadRequestException(
        'Invalid role. Must be either "owner", "admin", "manager", or "member".',
      );
    }

    let phoneNumbers: string[] = [];
    if (contactsFile) {
      const records = csv.parse(contactsFile.buffer, { columns: true });
      phoneNumbers = (records as { phone: string }[])
        .map((record) => record.phone)
        .filter(Boolean);
    }

    return this.automatedCampaignService.createCampaign(
      campaignDto,
      userId,
      phoneNumbers,
    );
  }

  @Get('event/:event')
  @Roles('owner', 'admin', 'manager')
  async getCampaignsByEvent(
    @Param('event') event: string,
    @Req() req: Request,
  ) {
    const userRole = req.user['role'];

    // Check if the user has a valid role for viewing campaigns
    if (!['owner', 'admin', 'manager'].includes(userRole)) {
      throw new BadRequestException(
        'Invalid role. Must be either "owner", "admin", or "manager" to view campaigns.',
      );
    }

    return this.automatedCampaignService.getCampaignsByEvent(event);
  }
}
