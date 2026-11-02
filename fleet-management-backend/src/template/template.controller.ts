import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new template' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Template created successfully',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  create(@Body(ValidationPipe) createTemplateDto: CreateTemplateDto) {
    return this.templateService.create(createTemplateDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all templates with optional search' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns all templates' })
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.templateService.findAll(search, page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get template by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns a template' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Template not found',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.templateService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update template' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Template updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Template not found',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.templateService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete template' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Template deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Template not found',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.templateService.remove(id);
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore soft deleted template' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Template restored successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Template not found',
  })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.templateService.restore(id);
  }
}
