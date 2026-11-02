import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllListsDto {
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  search?: string;

  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  @IsIn(['title', 'createdAt'], {
    message: 'Sort by must be either "title" or "createdAt"',
  })
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  @IsIn(['ASC', 'DESC'], {
    message: 'Sort order must be either "ASC" or "DESC"',
  })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number = 10;
}
