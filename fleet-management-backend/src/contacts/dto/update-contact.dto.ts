import { PartialType } from '@nestjs/mapped-types';
import { CreateContactDto } from './create-contact.dto';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  Matches,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateContactDto extends PartialType(CreateContactDto) {
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message:
      'Phone number must be between 2 and 15 digits and may include a leading + sign',
  })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Original source must be a string' })
  originalSource?: string;

  @IsOptional()
  @IsBoolean({ message: 'Block must be a boolean value' })
  block?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Optout must be a boolean value' })
  optout?: boolean;

  @IsOptional()
  @IsObject({ message: 'Custom properties must be an object' })
  @Type(() => Object)
  customProperties?: Record<string, any>;
}
