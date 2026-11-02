import { IsArray, IsBoolean, IsNotEmpty } from 'class-validator';

export class BulkOpenDto {
  @IsArray()
  @IsNotEmpty()
  conversationIds: string[];

  @IsBoolean()
  @IsNotEmpty()
  isOpen: boolean;
}
