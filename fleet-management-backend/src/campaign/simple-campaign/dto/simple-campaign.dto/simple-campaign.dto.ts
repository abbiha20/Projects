import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsISO8601,
} from 'class-validator';

export class SimpleCampaignDto {
  @IsString()
  name: string;

  @IsString()
  message: string;

  @IsArray()
  @IsOptional()
  assignTo?: string[];

  @IsBoolean()
  @IsOptional()
  autoTranslate?: boolean;

  @IsString()
  @IsOptional()
  confirmationText?: string;

  @IsString()
  @IsOptional()
  optOutMessage?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsISO8601()
  @IsOptional()
  scheduledDate?: string;
}
