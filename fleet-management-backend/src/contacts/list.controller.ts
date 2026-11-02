import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ListService } from './list.service';
import { CreateListDto } from './dto/createlist.dto';
import { AddContactsDto } from './dto/addcontact.dto';
import { FindAllListsDto } from './dto/list.dto';

@Controller('lists')
export class ListController {
  private readonly logger = new Logger(ListController.name);
  constructor(private readonly listService: ListService) {}

  @Post()
  create(@Body() createListDto: CreateListDto) {
    return this.listService.createList(createListDto);
  }

  @Get()
  async findAll(@Query() findAllListsDto: FindAllListsDto) {
    const { lists, total } = await this.listService.findAll(findAllListsDto);
    return {
      success: true,
      data: lists,
      meta: {
        total,
        page: findAllListsDto.page,
        limit: findAllListsDto.limit,
        totalPages: Math.ceil(total / findAllListsDto.limit),
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query() query: FindAllListsDto) {
    try {
      const list = await this.listService.findOne(id, query);
      if (!list) {
        throw new NotFoundException(`List with ID "${id}" not found`);
      }
      return list;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to retrieve list: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve list');
    }
  }

  @Put(':id/add-contacts')
  addContacts(@Param('id') id: string, @Body() addContactsDto: AddContactsDto) {
    return this.listService.addContactsToList(id, addContactsDto);
  }

  @Delete(':id/contacts/:contactId')
  removeContact(
    @Param('id') id: string,
    @Param('contactId') contactId: string,
  ) {
    return this.listService.removeContactFromList(id, contactId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listService.deleteList(id);
  }
}
