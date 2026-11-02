import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { User } from '../entities/user.entity';
import { Contact } from '../entities/contacts.entity';
import { Logger } from '@nestjs/common';
import { TaskQueryOptions } from './interfaces/task-query.interface';
import { EmailService } from '../email/email.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    private emailService: EmailService,
  ) {}

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      const assignedTo = await this.userRepository.findOne({
        where: { id: createTaskDto.assignedToId },
      });
      if (!assignedTo) {
        throw new NotFoundException('Assigned user not found');
      }

      const contact = await this.contactRepository.findOne({
        where: { id: createTaskDto.contactId },
      });
      if (!contact) {
        throw new NotFoundException('Contact not found');
      }

      const task = this.taskRepository.create({
        title: createTaskDto.title,
        description: createTaskDto.description,
        fileUrl: createTaskDto.fileUrl,
        status: createTaskDto.status,
        assignedTo,
        contact,
      });

      return await this.taskRepository.save(task);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create task');
    }
  }

  async getAllTasks(options: TaskQueryOptions) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        assignedToId,
        contactId,
      } = options;

      const pageNumber = Math.max(1, Number(page));
      const limitNumber = Math.max(1, Number(limit));
      const skip = (pageNumber - 1) * limitNumber;

      // Build query
      const queryBuilder = this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.assignedTo', 'assignedTo')
        .leftJoinAndSelect('task.contact', 'contact')
        .orderBy('task.createdAt', 'DESC');

      // Add search condition for MySQL
      if (search) {
        queryBuilder.andWhere(
          '(task.title LIKE :search OR task.description LIKE :search OR ' +
            'contact.firstName LIKE :search OR contact.lastName LIKE :search)',
          { search: `%${search}%` },
        );
      }

      // Add status filter
      if (status) {
        queryBuilder.andWhere('task.status = :status', { status });
      }

      // Add assignedTo filter
      if (assignedToId) {
        queryBuilder.andWhere('task.assignedTo = :assignedToId', {
          assignedToId,
        });
      }

      // Add contact filter
      if (contactId) {
        queryBuilder.andWhere('task.contact = :contactId', { contactId });
      }

      // Get total count for pagination
      const total = await queryBuilder.getCount();

      // Get paginated results
      const tasks = await queryBuilder.skip(skip).take(limitNumber).getMany();

      // Transform tasks data
      const transformedTasks = tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        fileUrl: task.fileUrl,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        businessId: task.businessId,
        assignedTo: task.assignedTo
          ? {
              id: task.assignedTo.id,
              name: task.assignedTo.name,
              email: task.assignedTo.email,
            }
          : null,
        contact: task.contact
          ? {
              id: task.contact.id,
              name: `${task.contact.firstName} ${task.contact.lastName}`,
              phone: task.contact.phone,
            }
          : null,
      }));

      // Add case-insensitive search for MySQL
      if (search) {
        queryBuilder.andWhere(
          'LOWER(task.title) LIKE LOWER(:search) OR ' +
            'LOWER(task.description) LIKE LOWER(:search) OR ' +
            'LOWER(contact.firstName) LIKE LOWER(:search) OR ' +
            'LOWER(contact.lastName) LIKE LOWER(:search)',
          { search: `%${search}%` },
        );
      }

      return {
        data: transformedTasks,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
        summary: {
          totalTasks: total,
          pendingTasks: tasks.filter((task) => task.status === 'pending')
            .length,
          completedTasks: tasks.filter((task) => task.status === 'completed')
            .length,
          inProgressTasks: tasks.filter((task) => task.status === 'in-progress')
            .length,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to fetch tasks: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        `Failed to retrieve tasks: ${error.message}`,
      );
    }
  }

  async getTaskById(id: string): Promise<Task> {
    try {
      const task = await this.taskRepository.findOne({
        where: { id },
        relations: ['assignedTo', 'contact'],
      });
      if (!task) {
        throw new NotFoundException('Task not found');
      }
      return task;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve task');
    }
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    try {
      const task = await this.getTaskById(id);
      const originalStatus = task.status;

      if (updateTaskDto.contactId) {
        const contact = await this.contactRepository.findOne({
          where: { id: updateTaskDto.contactId },
        });
        if (!contact) {
          throw new NotFoundException('Contact not found');
        }
        task.contact = contact;
      }

      if (updateTaskDto.assignedToId) {
        const assignedTo = await this.userRepository.findOne({
          where: { id: updateTaskDto.assignedToId },
        });
        if (!assignedTo) {
          throw new NotFoundException('Assigned user not found');
        }
        task.assignedTo = assignedTo;
      }

      Object.assign(task, updateTaskDto);
      const updatedTask = await this.taskRepository.save(task);

      // Send email notifications if status has changed
      if (updateTaskDto.status && originalStatus !== updateTaskDto.status) {
        await this.sendTaskStatusUpdateEmails(updatedTask);
      }

      return updatedTask;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update task');
    }
  }

  private async sendTaskStatusUpdateEmails(task: Task): Promise<void> {
    try {
      const emailSubject = `Task Status Update: ${task.title}`;
      const emailHtml = `
        <h2>Task Status Update</h2>
        <p><strong>Title:</strong> ${task.title}</p>
        <p><strong>Description:</strong> ${task.description}</p>
        <p><strong>New Status:</strong> ${task.status}</p>
        <p><strong>Last Updated:</strong> ${task.updatedAt.toLocaleString()}</p>
        ${task.fileUrl ? `<p><strong>File Attachment:</strong> ${task.fileUrl}</p>` : ''}
      `;

      // Send email to assigned user
      if (task.assignedTo?.email) {
        await this.emailService.sendMail(
          task.assignedTo.email,
          emailSubject,
          `Task "${task.title}" has been updated to status: ${task.status}`,
          emailHtml,
        );
      }

      // Send email to contact
      if (task.contact?.email) {
        await this.emailService.sendMail(
          task.contact.email,
          emailSubject,
          `Task "${task.title}" has been updated to status: ${task.status}`,
          emailHtml,
        );
      }
    } catch (error) {
      this.logger.error('Failed to send task update emails:', error);
      // Don't throw the error to prevent disrupting the task update process
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const result = await this.taskRepository.softDelete(id);
      if (result.affected === 0) {
        throw new NotFoundException('Task not found');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete task');
    }
  }

  async getTasksForUser(userId: string): Promise<Task[]> {
    try {
      return await this.taskRepository.find({
        where: { assignedTo: { id: userId } },
        relations: ['contact'],
      });
    } catch {
      throw new InternalServerErrorException(
        'Failed to retrieve tasks for user',
      );
    }
  }
}
