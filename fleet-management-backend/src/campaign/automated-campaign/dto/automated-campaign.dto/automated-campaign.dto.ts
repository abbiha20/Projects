import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class AutomatedCampaignDto {
  @IsString()
  name: string;

  @IsString()
  message: string;

  @IsString()
  triggerEvent: string;

  @IsObject()
  @IsOptional()
  triggerConditions: { [key: string]: any };

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
}
