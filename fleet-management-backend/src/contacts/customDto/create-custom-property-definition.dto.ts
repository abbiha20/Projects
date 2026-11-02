import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PropertyType } from '../../entities/custom-property-definition.entity';

export class CreateCustomPropertyDefinitionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(PropertyType)
  type: PropertyType;

  @IsOptional()
  @IsString()
  options?: string;
}
