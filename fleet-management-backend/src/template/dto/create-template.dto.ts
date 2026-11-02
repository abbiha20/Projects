import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty({ message: 'Template title is required' })
  templateTitle: string;

  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @IsArray()
  @IsOptional()
  fileURLs?: string[];
  @IsArray()
  @IsOptional()
  shortUrls?: string[];
}
