import { IsNotEmpty, IsString } from 'class-validator';

export class AddCustomPropertyDto {
  @IsNotEmpty()
  @IsString()
  contactId: string;

  @IsNotEmpty()
  @IsString()
  propertyDefinitionId: string;

  @IsNotEmpty()
  @IsString()
  value: string;
}
