import { IsArray, IsString, IsNotEmpty } from 'class-validator';

export class BulkAssignDto {
  @IsArray()
  @IsNotEmpty()
  conversationIds: string[];

  @IsString()
  @IsNotEmpty()
  assignedToId: string;
}
