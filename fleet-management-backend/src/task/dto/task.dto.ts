import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty({ message: 'Task title is required' })
  @IsString({ message: 'Task title must be a string' })
  title: string;

  @IsNotEmpty({ message: 'Task description is required' })
  @IsString({ message: 'Task description must be a string' })
  description: string;

  @IsOptional()
  @IsString({ message: 'File URL must be a string' })
  fileUrl?: string;

  @IsNotEmpty({ message: 'Contact ID is required' })
  @IsUUID('4', { message: 'Contact ID must be a valid UUID' })
  contactId: string;

  @IsNotEmpty({ message: 'Assigned To ID is required' })
  @IsUUID('4', { message: 'Assigned To ID must be a valid UUID' })
  assignedToId: string;

  @IsOptional({ message: 'Status is required' })
  @IsString({ message: 'Status must be a string' })
  status: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString({ message: 'Task title must be a string' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Task description must be a string' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'File URL must be a string' })
  fileUrl?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Contact ID must be a valid UUID' })
  contactId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Assigned To ID must be a valid UUID' })
  assignedToId?: string;

  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  status?: string;
}
