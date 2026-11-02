import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Patch,
  NotFoundException,
  Param,
  Query,
  HttpStatus,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversatio.dto';
import { BulkAssignDto } from './dto/bulk-assign.dto';
import { BulkBlockDto } from './dto/bulk-block.dto';
import { BulkOpenDto } from './dto/bulk-open.dto';

@Controller('message')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConversationController {
  private readonly logger = new Logger(ConversationController.name);
  constructor(private readonly conversationService: ConversationService) {}

  @Post('create-conversation')
  @Roles('owner', 'admin')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createConversationAndSendMessage(
    @Req() req: Request,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    try {
      if (!req.user) {
        throw new BadRequestException('User not authenticated');
      }

      const senderId = req.user['userId'];
      console.log('Sender ID:', senderId);

      const result =
        await this.conversationService.createConversationAndSendMessage(
          senderId,
          createConversationDto,
        );

      return {
        success: true,
        message: 'Conversation created successfully',
        data: result.conversation,
        smsStatus: result.smsStatus,
      };
    } catch (error) {
      console.error(
        'Error in createConversationAndSendMessage controller:',
        error,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to create conversation',
        error: 'Bad Request',
      });
    }
  }
  // conversation.controller.ts
  @Get('all')
  @Roles('owner', 'admin')
  async getAllConversations(
    @Query('conversation') assignmentStatus?: 'assigned' | 'unassigned',
    @Query('location') location?: string,
    @Query('isOpen') isOpen?: string,
    @Query('read') read?: string,
    @Query('folderId') folderId?: string,
    @Query('search') search?: string,
    @Query('assignedToUserId') assignedToUserId?: string,
    @Query('hasReplies') hasReplies?: string,
  ) {
    try {
      // Proper boolean parsing
      const isOpenBoolean = isOpen
        ? isOpen.toLowerCase() === 'true'
        : undefined;
      const readBoolean = read ? read.toLowerCase() === 'true' : undefined;
      const hasRepliesBoolean = hasReplies
        ? hasReplies.toLowerCase() === 'true'
        : undefined;

      // Input validation
      if (
        assignmentStatus &&
        !['assigned', 'unassigned'].includes(assignmentStatus)
      ) {
        throw new BadRequestException('Invalid assignment status');
      }

      const conversations = await this.conversationService.getAllConversations(
        assignmentStatus,
        location?.trim(),
        isOpenBoolean,
        readBoolean,
        folderId,
        search?.trim(),
        assignedToUserId,
        hasRepliesBoolean,
      );

      return {
        success: true,
        data: conversations.map((conversation) =>
          this.formatConversationALL(conversation),
        ),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        statusCode: error instanceof BadRequestException ? 400 : 500,
      };
    }
  }

  @Get('locations')
  async getAllLocations(): Promise<string[]> {
    return this.conversationService.getAllLocations();
  }
  @Get(':id')
  async getConversationById(@Param('id') id: string) {
    try {
      const conversation =
        await this.conversationService.getConversationById(id);
      return this.formatConversation(conversation);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
  }

  private formatConversation(conversation: any) {
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return {
      id: conversation.id,
      contact: conversation.contact,
      assignedTo: conversation.assignedTo,
      assignedTeam: conversation.assignedTeam,
      assign: conversation.assign,
      assignTeam: conversation.assignTeam,
      block: conversation.block,
      fileURLs: conversation.fileURLs || [],
      senderLocation: conversation.senderLocation,
      notes: conversation.notes,
      teamAutoAssign: conversation.teamAutoAssign,
      memberAutoAssign: conversation.memberAutoAssign,
      customSignature: conversation.customSignature,
      signatureText: conversation.signatureText,
      addFlag: conversation.addFlag,
      read: conversation.read,
      isOpen: conversation.isOpen,
      timeline: this.formatTimeline(conversation.timeline),
      calls: conversation.calls || [],
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  private formatTimeline(timeline: any[]) {
    if (!Array.isArray(timeline)) {
      return [];
    }

    return timeline.map((item) => ({
      id: item.id,
      type: item.type,
      content: item.content,
      sender: item.sender,
      createdAt: item.createdAt,
      direction: item.direction,
      fileURLs: item.fileURLs || [],
      // Add delivery status for messages
      ...(item.type === 'message' && {
        isScheduled: item.isScheduled,
        scheduleAt: item.scheduleAt,
        isRecurring: item.isRecurring,
        recurrencePattern: item.recurrencePattern,
        isDelivered: item.isDelivered,
        deliveryError: item.deliveryError,
      }),
      // SMS Reply specific fields
      ...(item.type === 'smsReply' && {
        mediaType: item.mediaType,
        mediaContentType: item.mediaContentType,
        mediaSize: item.mediaSize,
      }),
    }));
  }

  private formatConversationALL(conversation: any) {
    return {
      id: conversation.id,
      contactName: conversation.contact
        ? `${conversation.contact.firstName || ''} ${conversation.contact.lastName || ''}`.trim() ||
          'Unknown'
        : 'Unknown',
      contactPhone: conversation.contact?.phone || 'Unknown',
      assignedTo: conversation.assignedTo
        ? {
            id: conversation.assignedTo.id,
            name: conversation.assignedTo.name || 'Unknown',
          }
        : null,
      assignedTeam: conversation.assignedTeam
        ? {
            id: conversation.assignedTeam.id,
            name: conversation.assignedTeam.name || 'Unknown',
            description: conversation.assignedTeam.description,
          }
        : null,
      assign: conversation.assign,
      assignTeam: conversation.assignTeam,
      lastMessage:
        conversation.messages && conversation.messages.length > 0
          ? {
              content: conversation.messages[0].content || '',
              createdAt: conversation.messages[0].createdAt,
              isDelivered: conversation.messages[0].isDelivered,
              deliveryError: conversation.messages[0].deliveryError,
              sender: conversation.messages[0].sender
                ? {
                    id: conversation.messages[0].sender.id,
                    name: conversation.messages[0].sender.name || 'Unknown',
                  }
                : null,
            }
          : null,
      messageCount: conversation.count || 0,
      updatedAt: conversation.updatedAt,
      createdAt: conversation.createdAt,
    };
  }
  @Patch(':id')
  @Roles('owner', 'admin')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateConversation(
    @Param('id') id: string,
    @Body() updateDto: UpdateConversationDto,
  ) {
    this.logger.log(
      `Received update request for conversation ${id}:`,
      updateDto,
    );

    try {
      const updatedConversation =
        await this.conversationService.updateConversation(id, updateDto);

      return {
        success: true,
        message: 'Conversation updated successfully',
        data: updatedConversation,
      };
    } catch (error) {
      this.logger.error(`Error updating conversation: ${error.message}`);

      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }

      throw new BadRequestException(
        'An error occurred while updating the conversation',
      );
    }
  }

  @Post('bulk-assign')
  @Roles('owner', 'admin')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async bulkAssignConversations(@Body() bulkAssignDto: BulkAssignDto) {
    try {
      const result = await this.conversationService.bulkAssignConversations(
        bulkAssignDto.conversationIds,
        bulkAssignDto.assignedToId,
      );

      return {
        success: true,
        message: 'Bulk assignment completed successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error in bulk assign controller: ${error.message}`);

      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to bulk assign conversations',
        error: 'Bad Request',
      });
    }
  }

  @Post('bulk-block')
  @Roles('owner', 'admin')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async bulkBlockConversations(@Body() bulkBlockDto: BulkBlockDto) {
    try {
      const result = await this.conversationService.bulkBlockConversations(
        bulkBlockDto.conversationIds,
        bulkBlockDto.block,
      );

      return {
        success: true,
        message: `Bulk ${bulkBlockDto.block ? 'block' : 'unblock'} completed successfully`,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error in bulk block controller: ${error.message}`);

      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to bulk block/unblock conversations',
        error: 'Bad Request',
      });
    }
  }

  @Post('bulk-open')
  @Roles('owner', 'admin')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async bulkUpdateOpenStatus(@Body() bulkOpenDto: BulkOpenDto) {
    try {
      const result = await this.conversationService.bulkUpdateOpenStatus(
        bulkOpenDto.conversationIds,
        bulkOpenDto.isOpen,
      );

      return {
        success: true,
        message: `Bulk ${bulkOpenDto.isOpen ? 'open' : 'close'} completed successfully`,
        data: result,
      };
    } catch (error) {
      this.logger.error(
        `Error in bulk open status controller: ${error.message}`,
      );

      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message:
          error.message ||
          'Failed to bulk update open status for conversations',
        error: 'Bad Request',
      });
    }
  }

  @Post('webhook')
  async handleIncomingMessage(@Body() twilioWebhook: any) {
    try {
      this.logger.log('Received webhook from Twilio:', twilioWebhook);

      const from = twilioWebhook.From;
      const body = twilioWebhook.Body;
      const mediaUrls = [];

      // Handle media if present
      const numMedia = parseInt(twilioWebhook.NumMedia || '0');
      for (let i = 0; i < numMedia; i++) {
        mediaUrls.push(twilioWebhook[`MediaUrl${i}`]);
      }

      const conversation = await this.conversationService.handleUnknownMessage(
        from,
        body,
        mediaUrls,
      );

      return {
        success: true,
        message: 'Webhook processed successfully',
        data: conversation,
      };
    } catch (error) {
      this.logger.error('Error processing webhook:', error);
      throw new BadRequestException('Failed to process incoming message');
    }
  }
}
