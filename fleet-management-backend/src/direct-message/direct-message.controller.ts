import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DirectMessageService } from './direct-message.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('direct-messages')
@UseGuards(JwtAuthGuard)
export class DirectMessageController {
  constructor(private readonly directMessageService: DirectMessageService) {}

  @Post('send/:receiverId')
  async sendMessage(
    @Req() req,
    @Param('receiverId') receiverId: string,
    @Body() messageData: { content?: string; fileURLs?: string[] },
  ) {
    const senderId = req.user['userId'];

    if (
      !messageData.content &&
      (!messageData.fileURLs || messageData.fileURLs.length === 0)
    ) {
      throw new BadRequestException(
        'Message must contain either content or files',
      );
    }

    if (senderId === receiverId) {
      throw new BadRequestException('Cannot send message to yourself');
    }

    return await this.directMessageService.sendMessage(
      senderId,
      receiverId,
      messageData.content || '',
      messageData.fileURLs,
    );
  }

  @Get('conversation/:otherUserId')
  async getConversation(@Req() req, @Param('otherUserId') otherUserId: string) {
    const userId = req.user['userId'];

    if (userId === otherUserId) {
      throw new BadRequestException('Cannot get conversation with yourself');
    }

    await this.directMessageService.markMessagesAsRead(userId, otherUserId);

    const conversation = await this.directMessageService.getConversation(
      userId,
      otherUserId,
    );

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  @Get('conversations')
  async getAllConversations(@Req() req) {
    const userId = req.user['userId'];
    return await this.directMessageService.getAllUserConversations(userId);
  }
}
