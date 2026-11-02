import { IsString, IsArray, IsUUID, IsOptional } from 'class-validator';

export class CreateGroupDto {
  @IsString({ message: 'Group name must be a string' })
  name: string;

  @IsOptional()
  @IsArray({ message: 'Members must be an array of UUIDs' })
  @IsUUID('4', { each: true, message: 'Each member ID must be a valid UUID' })
  memberIds?: string[] = [];
}
