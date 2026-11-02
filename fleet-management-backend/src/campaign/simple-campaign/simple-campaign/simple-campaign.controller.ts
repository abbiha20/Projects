import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SimpleCampaignService } from './simple-campaign.service';
import { SimpleCampaignDto } from '../dto/simple-campaign.dto/simple-campaign.dto';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Request } from 'express';
import * as csv from 'csv-parse/sync';

@Controller('simple-campaign')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SimpleCampaignController {
  constructor(private readonly simpleCampaignService: SimpleCampaignService) {}

  @Post()
  @Roles('owner', 'admin', 'manager', 'member')
  @UseInterceptors(FileInterceptor('contactsFile'))
  async createCampaign(
    @Body() campaignDto: SimpleCampaignDto,
    @UploadedFile() contactsFile: Express.Multer.File,
    @Req() req: Request,
  ) {
    const userId = req.user['userId'];
    const userRole = req.user['role'];
    console.log(req.user);
    console.log(userId);
    // Check if the user has a valid role
    if (!['owner', 'admin', 'manager', 'member'].includes(userRole)) {
      throw new BadRequestException(
        'Invalid role. Must be either "owner", "admin", "manager", or "member".',
      );
    }

    let phoneNumbers: string[] = [];
    if (contactsFile) {
      const records = csv.parse(contactsFile.buffer, { columns: true });
      phoneNumbers = records
        .map((record: { phone: any }) => record.phone)
        .filter(Boolean);
    }

    return this.simpleCampaignService.createCampaign(
      campaignDto,
      userId,
      phoneNumbers,
    );
  }
}
