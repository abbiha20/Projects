import { IsArray, IsBoolean, IsNotEmpty } from 'class-validator';

export class BulkBlockDto {
  @IsArray()
  @IsNotEmpty()
  conversationIds: string[];

  @IsBoolean()
  @IsNotEmpty()
  block: boolean;
}
