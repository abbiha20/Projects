import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class MakeCallDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format (e.g., +13477321862)',
  })
  to: string;
}
