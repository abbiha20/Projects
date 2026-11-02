import { IsArray, IsUUID } from 'class-validator';

export class AddContactsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  contactIds: string[];
}
