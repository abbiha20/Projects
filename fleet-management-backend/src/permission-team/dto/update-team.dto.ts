// dto/update-team.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly description?: string;
}
