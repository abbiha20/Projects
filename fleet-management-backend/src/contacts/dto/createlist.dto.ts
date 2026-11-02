import { IsString, IsNotEmpty } from 'class-validator';

export class CreateListDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}
