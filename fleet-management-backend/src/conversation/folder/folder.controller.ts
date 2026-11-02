import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { FolderService } from './folder.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Controller('folder')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Post()
  async create(@Body() createFolderDto: CreateFolderDto) {
    try {
      return await this.folderService.create(createFolderDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create folder: ${error.message}`,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.folderService.findAll();
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve folders: ${error.message}`,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.folderService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to retrieve folder: ${error.message}`,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    try {
      return await this.folderService.update(id, updateFolderDto);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update folder: ${error.message}`,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.folderService.remove(id);
      return { message: 'Folder successfully deleted' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete folder: ${error.message}`,
      );
    }
  }
}
