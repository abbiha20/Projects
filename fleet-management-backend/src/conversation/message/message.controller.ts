// message.controller.ts
import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { SendMessageDto } from './dto/create-message.dto/create-message.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('send')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'files', maxCount: 10 }], {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('Invalid file type'), false);
        }
      },
    }),
  )
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendMessage(
    @Req() req: Request,
    @Body() sendMessageDto: SendMessageDto,
    @UploadedFiles() files: { files?: Express.Multer.File[] },
  ) {
    try {
      const senderId = req.user['userId'];
      const { receiverNumber, content } = sendMessageDto;

      const result = await this.messageService.sendMessage(
        receiverNumber,
        content,
        files?.files,
        senderId,
      );

      if (result) {
        return { success: true, message: 'Message sent successfully' };
      } else {
        return { success: false, message: 'Failed to send message' };
      }
    } catch (error) {
      console.error('Error in MessageController:', error);
      return {
        success: false,
        message: 'An error occurred while sending the message',
      };
    }
  }
}
