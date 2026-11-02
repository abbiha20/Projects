import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  HttpCode,
  HttpStatus,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Request, Response } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ContactsService } from './contacts.service';
import { ContactsCsvService } from './contacts-csv.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { createReadStream } from 'fs';
import { FindAllContactsDto } from './dto/findAllcontacts.dto';
import { Contact } from '../entities/contacts.entity';

interface BulkUpdateDto {
  contactIds: string[];
  value: boolean;
}

@Controller('contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin')
export class ContactsController {
  private readonly logger = new Logger(ContactsController.name);

  constructor(
    private readonly contactsService: ContactsService,
    private readonly contactsCsvService: ContactsCsvService,
  ) {}

  @Post()
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createContactDto: CreateContactDto,
    @Req() req: Request,
  ) {
    try {
      const userId = req.user['userId'];
      return await this.contactsService.create(createContactDto, userId);
    } catch (error) {
      this.logger.error(
        `Failed to create contact: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create contact');
    }
  }

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    queryParams: FindAllContactsDto,
  ) {
    try {
      return await this.contactsService.findtoAll(queryParams);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve contacts: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve contacts');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const contact = await this.contactsService.findOne(id);
      if (!contact) {
        throw new NotFoundException(`Contact with ID ${id} not found`);
      }
      return contact;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to retrieve contact: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve contact');
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateContactDto: UpdateContactDto,
  ) {
    try {
      const updatedContact = await this.contactsService.update(
        id,
        updateContactDto,
      );
      if (!updatedContact) {
        throw new NotFoundException(`Contact with ID ${id} not found`);
      }
      return updatedContact;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to update contact: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to update contact');
    }
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async removeMultiple(
    @Body() rawBody: any,
  ): Promise<{ message: string; deletedCount: number }> {
    try {
      if (!Array.isArray(rawBody.ids) || rawBody.ids.length === 0) {
        throw new BadRequestException('ids must be a non-empty array of UUIDs');
      }
      const result = await this.contactsService.removeMultiple(rawBody.ids);
      return {
        message: `Successfully soft-deleted ${result.deletedCount} contact(s)`,
        deletedCount: result.deletedCount,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete contacts: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to delete contacts');
    }
  }

  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'text/csv',
          'application/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException('Only CSV and Excel files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async importCsv(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const userId = req.user['userId'];
    try {
      const fileStream = createReadStream(join(process.cwd(), file.path));
      await this.contactsCsvService.importCsv(
        fileStream,
        userId,
        file.mimetype,
      );
      return { message: 'File imported successfully' };
    } catch (error) {
      this.logger.error(`Failed to import file: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to import file');
    }
  }

  @Post('export-csv')
  async exportCsv(@Res() res: Response) {
    this.logger.log('Starting CSV export process');
    try {
      const contacts = await this.contactsService.findAll();
      const csvContent = await this.contactsCsvService.exportCsv(contacts);
      res.header('Content-Type', 'text/csv');
      res.attachment('contacts.csv');
      res.send(csvContent);
      this.logger.log('CSV export completed successfully');
      return res.end();
    } catch (error) {
      this.logger.error('Error exporting CSV:', error);
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Failed to export CSV', {
          cause: error,
          description: 'An unexpected error occurred during CSV export.',
        });
      }
    }
  }

  @Post('blocked-list')
  async getBlockedContacts(
    @Query(new ValidationPipe({ transform: true }))
    findAllContactsDto: FindAllContactsDto,
  ): Promise<{ data: Contact[]; total: number }> {
    try {
      return await this.contactsService.getAllBlockedContacts(
        findAllContactsDto,
      );
    } catch (error) {
      this.logger.error(
        `Failed to retrieve blocked contacts: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve blocked contacts',
      );
    }
  }

  @Post('unblocked-list')
  async getUnblockedContacts(
    @Query(new ValidationPipe({ transform: true }))
    findAllContactsDto: FindAllContactsDto,
  ): Promise<{ data: Contact[]; total: number }> {
    try {
      return await this.contactsService.getAllUnblockedContacts(
        findAllContactsDto,
      );
    } catch (error) {
      this.logger.error(
        `Failed to retrieve unblocked contacts: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve unblocked contacts',
      );
    }
  }

  @Post('bulk-block')
  @Roles('owner', 'admin')
  async bulkBlockContacts(@Body() dto: BulkUpdateDto) {
    try {
      if (!Array.isArray(dto.contactIds) || dto.contactIds.length === 0) {
        throw new BadRequestException('contactIds must be a non-empty array');
      }

      const result = await this.contactsService.bulkUpdateBlockStatus(
        dto.contactIds,
        dto.value,
      );

      return {
        success: true,
        message: `Successfully ${dto.value ? 'blocked' : 'unblocked'} ${result.updatedCount} contact(s)`,
        updatedCount: result.updatedCount,
      };
    } catch (error) {
      this.logger.error(
        `Failed to bulk ${dto.value ? 'block' : 'unblock'} contacts: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Post('bulk-optout')
  @Roles('owner', 'admin')
  async bulkOptOutContacts(@Body() dto: BulkUpdateDto) {
    try {
      if (!Array.isArray(dto.contactIds) || dto.contactIds.length === 0) {
        throw new BadRequestException('contactIds must be a non-empty array');
      }

      const result = await this.contactsService.bulkUpdateOptOutStatus(
        dto.contactIds,
        dto.value,
      );

      return {
        success: true,
        message: `Successfully ${dto.value ? 'opted out' : 'opted in'} ${result.updatedCount} contact(s)`,
        updatedCount: result.updatedCount,
      };
    } catch (error) {
      this.logger.error(
        `Failed to bulk ${dto.value ? 'opt out' : 'opt in'} contacts: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Post(':contactId/add-property')
  async addContactProperty(
    @Param('contactId') contactId: string,
    @Body()
    dto: {
      name: string;
      type: string;
      value: string | number | boolean;
      options?: string;
    },
  ) {
    return this.contactsService.addContactProperty(
      contactId,
      dto.name,
      dto.type,
      dto.value,
      dto.options,
    );
  }
}
