import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteContactsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(4, { each: true })
  @Type(() => String)
  ids: string[];
}
