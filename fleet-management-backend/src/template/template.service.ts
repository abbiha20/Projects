import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Template } from '../entities/template.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
  ) {}

  async create(createTemplateDto: CreateTemplateDto): Promise<Template> {
    try {
      // Check if template with same title exists
      const existingTemplate = await this.templateRepository.findOne({
        where: { templateTitle: createTemplateDto.templateTitle },
      });

      if (existingTemplate) {
        throw new BadRequestException(
          'Template with this title already exists',
        );
      }

      const template = this.templateRepository.create(createTemplateDto);
      return await this.templateRepository.save(template);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create template');
    }
  }

  async findAll(
    search?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Template[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const where: FindOptionsWhere<Template> = {};

      if (search) {
        where.templateTitle = ILike(`%${search}%`);
      }

      const [templates, total] = await this.templateRepository.findAndCount({
        where,
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      return {
        data: templates,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch {
      throw new BadRequestException('Failed to fetch templates');
    }
  }

  async findOne(id: string): Promise<Template> {
    try {
      const template = await this.templateRepository.findOne({
        where: { id },
      });

      if (!template) {
        throw new NotFoundException(`Template with ID "${id}" not found`);
      }

      return template;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch template');
    }
  }

  async update(
    id: string,
    updateTemplateDto: UpdateTemplateDto,
  ): Promise<Template> {
    try {
      const template = await this.findOne(id);

      if (
        updateTemplateDto.templateTitle &&
        updateTemplateDto.templateTitle !== template.templateTitle
      ) {
        const existingTemplate = await this.templateRepository.findOne({
          where: { templateTitle: updateTemplateDto.templateTitle },
        });

        if (existingTemplate) {
          throw new BadRequestException(
            'Template with this title already exists',
          );
        }
      }

      Object.assign(template, updateTemplateDto);
      return await this.templateRepository.save(template);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update template');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.templateRepository.softDelete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Template with ID "${id}" not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete template');
    }
  }

  async restore(id: string): Promise<void> {
    try {
      const result = await this.templateRepository.restore(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Template with ID "${id}" not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to restore template');
    }
  }
}
