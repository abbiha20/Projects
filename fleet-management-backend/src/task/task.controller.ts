import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpException,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request } from 'express';
import { Logger } from '@nestjs/common';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin')
export class TaskController {
  private readonly logger = new Logger(TaskController.name);

  constructor(private readonly taskService: TaskService) {}

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    try {
      return await this.taskService.createTask(createTaskDto);
    } catch (error) {
      this.handleError(error, 'Failed to create task');
    }
  }

  @Get()
  async getAllTasks(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('contactId') contactId?: string,
  ) {
    this.logger.debug(
      `Fetching tasks with params: page=${page}, limit=${limit}, search=${search}, status=${status}`,
    );

    return this.taskService.getAllTasks({
      page,
      limit,
      search,
      status,
      assignedToId,
      contactId,
    });
  }

  @Get('my-tasks')
  async getMyTasks(@Req() req: Request) {
    try {
      const userId = req.user['userId'];
      return await this.taskService.getTasksForUser(userId);
    } catch (error) {
      this.handleError(error, 'Failed to retrieve your tasks');
    }
  }

  @Get(':id')
  async getTaskById(@Param('id') id: string) {
    try {
      return await this.taskService.getTaskById(id);
    } catch (error) {
      this.handleError(error, 'Failed to retrieve task');
    }
  }

  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    try {
      return await this.taskService.updateTask(id, updateTaskDto);
    } catch (error) {
      this.handleError(error, 'Failed to update task');
    }
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string) {
    try {
      return await this.taskService.deleteTask(id);
    } catch (error) {
      this.handleError(error, 'Failed to delete task');
    }
  }

  private handleError(error: any, defaultMessage: string) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new InternalServerErrorException(error.message || defaultMessage);
  }
}
