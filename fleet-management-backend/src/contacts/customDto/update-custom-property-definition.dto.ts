// src/contacts/dto/update-custom-property-definition.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomPropertyDefinitionDto } from './create-custom-property-definition.dto';

export class UpdateCustomPropertyDefinitionDto extends PartialType(
  CreateCustomPropertyDefinitionDto,
) {}
