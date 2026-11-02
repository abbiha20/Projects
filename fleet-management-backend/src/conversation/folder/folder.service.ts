import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { Folder } from '../../entities/folder.entity';

@Injectable()
export class FolderService {
  constructor(
    @InjectRepository(Folder)
    private folderRepository: Repository<Folder>,
  ) {}

  async create(createFolderDto: CreateFolderDto): Promise<Folder> {
    const existingFolder = await this.findByName(createFolderDto.folderName);
    if (existingFolder) {
      throw new ConflictException(
        `Folder with name "${createFolderDto.folderName}" already exists`,
      );
    }
    const folder = this.folderRepository.create(createFolderDto);
    return await this.folderRepository.save(folder);
  }

  async findAll(): Promise<Folder[]> {
    return await this.folderRepository.find();
  }

  async findOne(id: string): Promise<Folder> {
    const folder = await this.folderRepository.findOne({ where: { id } });
    if (!folder) {
      throw new NotFoundException(`Folder with ID "${id}" not found`);
    }
    return folder;
  }

  async findByName(folderName: string): Promise<Folder | null> {
    return await this.folderRepository.findOne({ where: { folderName } });
  }

  async update(id: string, updateFolderDto: UpdateFolderDto): Promise<Folder> {
    const folder = await this.findOne(id);
    if (
      updateFolderDto.folderName &&
      updateFolderDto.folderName !== folder.folderName
    ) {
      const existingFolder = await this.findByName(updateFolderDto.folderName);
      if (existingFolder) {
        throw new ConflictException(
          `Folder with name "${updateFolderDto.folderName}" already exists`,
        );
      }
    }
    Object.assign(folder, updateFolderDto);
    return await this.folderRepository.save(folder);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.folderRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Folder with ID "${id}" not found`);
    }
    return true;
  }
}
