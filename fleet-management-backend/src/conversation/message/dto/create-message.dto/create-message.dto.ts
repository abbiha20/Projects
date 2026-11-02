// send-message.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  receiverNumber: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
