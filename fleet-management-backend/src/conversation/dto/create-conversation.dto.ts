import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsArray,
} from 'class-validator';

export class CreateConversationDto {
  @IsUUID()
  @IsNotEmpty({ message: 'contactId is required' })
  contactId: string;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsString()
  @IsOptional()
  senderLocation?: string;

  @IsString()
  @IsOptional()
  messageContent?: string;

  @IsArray()
  @IsOptional()
  fileURLs?: string[];
}
