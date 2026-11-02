import { IsString, IsEmail, IsEnum } from 'class-validator';

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsEnum(['owner', 'manager', 'member'])
  role: 'owner' | 'manager' | 'member';
  @IsString()
  location: string;
}
