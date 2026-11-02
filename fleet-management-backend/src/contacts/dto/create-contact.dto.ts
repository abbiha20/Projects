import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  Matches,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContactDto {
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message:
      'Phone number must be between 2 and 15 digits and may include a leading + sign',
  })
  phone?: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

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
