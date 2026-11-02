import { IsString, IsNotEmpty } from 'class-validator';

export class AcceptInvitationDto {
  @IsString()
  @IsNotEmpty()
  invitationToken: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  phoneNumber?: string;
}
