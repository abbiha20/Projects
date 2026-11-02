import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateFolderDto {
  @IsString({ message: 'Folder name must be a string' })
  @IsNotEmpty({ message: 'Folder name is required' })
  folderName: string;

  @IsOptional()
  @IsArray({ message: 'Conversation IDs must be an array' })
  @IsString({ each: true, message: 'Each conversation ID must be a string' })
  conversationIds?: string[];
}
