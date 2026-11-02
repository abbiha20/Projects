// add-custom-properties.dto.ts
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CustomPropertyDto } from './custom-property.dto';

export class AddCustomPropertiesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomPropertyDto)
  customProperties: CustomPropertyDto[];
}
