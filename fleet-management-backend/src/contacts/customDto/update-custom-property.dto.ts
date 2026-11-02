// src/contacts/dto/update-custom-property.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { AddCustomPropertyDto } from './add-custom-property.dto';

export class UpdateCustomPropertyDto extends PartialType(
  AddCustomPropertyDto,
) {}
