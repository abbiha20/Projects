// custom-property.dto.ts
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { PropertyType } from '../../entities/custom-property-definition.entity';

export class CustomPropertyDto {
  @IsString()
  name: string;

  @IsEnum(PropertyType)
  type: PropertyType;

  @IsString()
  @IsOptional()
  value?: string;
}
