import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Conversation } from '../entities/conversation.entity';
import { User } from '../entities/user.entity';
import { Contact } from '../entities/contacts.entity';
import { Call } from '../entities/call.entity';
import { SendSmsService } from './sms/send-sms/send-sms.service';
import { GetSmsService } from './sms/get-sms/get-sms.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversatio.dto';
import { SmsReply } from '../entities/sms-reply.entity';
import { Folder } from '../entities/folder.entity';
import { Team } from '../entities/team.entity';
import { ConfigService } from '@nestjs/config';

interface TimelineItem {
  id: string;
  type: 'message' | 'smsReply';
  content: string;
  sender: {
    id: string | null;
    name: string;
    phone?: string;
  };
  createdAt: Date;
  isScheduled?: boolean;
  scheduleAt?: Date | null;
  isRecurring?: boolean;
  recurrencePattern?: string | null;
  fileURLs: string[];
  mediaType?: string | null;
  mediaContentType?: string | null;
  mediaSize?: number | null;
  direction: 'inbound' | 'outbound';
  isDelivered?: boolean;
  deliveryError?: string;
}

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(Call)
    private callRepository: Repository<Call>,
    private sendSmsService: SendSmsService,
    private getSmsService: GetSmsService,
    @InjectRepository(SmsReply)
    private smsReplyRepository: Repository<SmsReply>,
    @InjectRepository(Folder)
    private folderRepository: Repository<Folder>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    private configService: ConfigService,
  ) {}

  async createConversationAndSendMessage(
    senderId: string,
    createConversationDto: CreateConversationDto,
  ): Promise<{
    conversation: Conversation;
    smsStatus: { success: boolean; error?: string };
  }> {
    this.logger.log(`Creating/Updating conversation for sender: ${senderId}`);
    this.logger.log(`DTO: ${JSON.stringify(createConversationDto)}`);

    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });
    if (!sender) {
      throw new NotFoundException('Sender not found');
    }
    //
    const contact = await this.contactRepository.findOne({
      where: { id: createConversationDto.contactId },
    });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    let assignedTo: User | null = null;
    if (createConversationDto.assignedToId) {
      assignedTo = await this.userRepository.findOne({
        where: { id: createConversationDto.assignedToId },
      });
      if (!assignedTo) {
        throw new NotFoundException('Assigned user not found');
      }
    }

    let conversation = await this.conversationRepository.findOne({
      where: { contact: { id: contact.id } },
      relations: ['contact', 'assignedTo'],
    });

    if (conversation) {
      conversation.assignedTo = assignedTo;
      conversation.assign = !!assignedTo;
      conversation.senderLocation = createConversationDto.senderLocation;
      conversation.isOpen = true;
      await this.conversationRepository.save(conversation);
      this.logger.log(`Updated existing conversation: ${conversation.id}`);
    } else {
      conversation = this.conversationRepository.create({
        contact: contact,
        assignedTo: assignedTo,
        assign: !!assignedTo,
        senderLocation: createConversationDto.senderLocation,
      });
      await this.conversationRepository.save(conversation);
      this.logger.log(`Created new conversation: ${conversation.id}`);
    }

    // Process message content for template variables
    let processedContent = createConversationDto.messageContent || '';
    if (processedContent) {
      const templateRegex = /\{\{([^}]+)\}\}/g;
      processedContent = processedContent.replace(
        templateRegex,
        (match, variable) => {
          const trimmedVar = variable.trim();
          if (trimmedVar in contact) {
            return contact[trimmedVar] || match;
          }
          return match;
        },
      );
    }

    const message = this.messageRepository.create({
      conversation: conversation,
      sender: sender,
      content: processedContent,
      fileURLs: createConversationDto.fileURLs || [],
    });

    const messageStatus = await this.sendSmsService.sendMessage(
      contact.phone,
      processedContent,
      createConversationDto.fileURLs,
    );

    // Update message with delivery status
    message.isDelivered = messageStatus.success;
    message.deliveryError = messageStatus.error;
    await this.messageRepository.save(message);

    return { conversation, smsStatus: messageStatus };
  }

  async getAllConversations(
    assignmentStatus?: 'assigned' | 'unassigned',
    location?: string,
    isOpen?: boolean,
    read?: boolean,
    folderId?: string,
    search?: string,
    assignedToUserId?: string,
    hasReplies?: boolean,
  ): Promise<Conversation[]> {
    try {
      let queryBuilder = this.conversationRepository
        .createQueryBuilder('conversation')
        .distinct(true)
        .leftJoinAndSelect('conversation.contact', 'contact')
        .leftJoinAndSelect('conversation.assignedTo', 'assignedTo')
        .leftJoinAndSelect('conversation.assignedTeam', 'assignedTeam')
        .leftJoinAndSelect('conversation.messages', 'messages')
        .leftJoinAndSelect('messages.sender', 'messageSender')
        .leftJoinAndSelect('conversation.smsReplies', 'smsReplies');

      const whereConditions: any[] = [];
      const parameters: any = {};

      if (assignedToUserId) {
        whereConditions.push('assignedTo.id = :assignedToUserId');
        parameters.assignedToUserId = assignedToUserId;
      }

      if (hasReplies === true) {
        whereConditions.push(
          '(messages.id IS NOT NULL OR smsReplies.id IS NOT NULL)',
        );
      } else if (hasReplies === false) {
        whereConditions.push('messages.id IS NULL AND smsReplies.id IS NULL');
      }

      if (folderId) {
        const folder = await this.folderRepository.findOneOrFail({
          where: { id: folderId },
        });

        if (folder.conversationIds?.length) {
          whereConditions.push('conversation.id IN (:...conversationIds)');
          parameters.conversationIds = folder.conversationIds;
        } else {
          return [];
        }
      }

      if (assignmentStatus === 'assigned') {
        whereConditions.push(
          '(conversation.assignedTo IS NOT NULL OR conversation.assignedTeam IS NOT NULL)',
        );
      } else if (assignmentStatus === 'unassigned') {
        whereConditions.push(
          '(conversation.assignedTo IS NULL AND conversation.assignedTeam IS NULL)',
        );
      }

      if (location) {
        whereConditions.push(
          'LOWER(conversation.senderLocation) LIKE LOWER(:location)',
        );
        parameters.location = `%${location}%`;
      }

      if (isOpen !== undefined) {
        whereConditions.push('conversation.isOpen = :isOpen');
        parameters.isOpen = isOpen;
      }

      if (read !== undefined) {
        whereConditions.push('conversation.read = :read');
        parameters.read = read;
      }

      if (search?.trim()) {
        // Get all contacts first to handle encrypted fields
        const contacts = await this.contactRepository.find();

        // Filter contacts that match the search term
        const matchingContactIds = contacts
          .filter((contact) => {
            const searchTerm = search.trim().toLowerCase();
            return (
              contact.firstName?.toLowerCase().includes(searchTerm) ||
              contact.lastName?.toLowerCase().includes(searchTerm) ||
              contact.phone?.toLowerCase().includes(searchTerm) ||
              `${contact.firstName} ${contact.lastName}`
                .toLowerCase()
                .includes(searchTerm)
            );
          })
          .map((contact) => contact.id);
        //
        if (matchingContactIds.length > 0) {
          whereConditions.push('contact.id IN (:...matchingContactIds)');
          parameters.matchingContactIds = matchingContactIds;
        } else {
          // If no matching contacts, check messages and replies
          whereConditions.push(
            '(LOWER(messages.content) LIKE :messageSearch OR LOWER(smsReplies.body) LIKE :messageSearch)',
          );
          parameters.messageSearch = `%${search.toLowerCase()}%`;
        }
      }

      if (whereConditions.length > 0) {
        queryBuilder = queryBuilder.where(
          whereConditions.join(' AND '),
          parameters,
        );
      }

      queryBuilder = queryBuilder
        .orderBy('conversation.updatedAt', 'DESC')
        .addOrderBy('messages.createdAt', 'DESC')
        .addOrderBy('smsReplies.dateCreated', 'DESC');

      const conversations = await queryBuilder.getMany();

      // Update conversations with latest SMS
      await Promise.all(
        conversations.map(async (conversation) => {
          if (conversation.contact?.phone) {
            const latestSms = await this.getSmsService.getSmsByPhoneNumber(
              conversation.contact.phone,
            );

            // Filter out existing SMS replies
            const existingSids = conversation.smsReplies.map(
              (reply) => reply.sid,
            );
            const newSms = latestSms.filter(
              (sms) =>
                !existingSids.includes(sms.sid) && sms.direction === 'inbound',
            );

            if (newSms.length > 0) {
              const smsReplies = newSms.map((sms) =>
                this.smsReplyRepository.create({
                  conversation: conversation,
                  sid: sms.sid,
                  body: sms.body,
                  from: sms.from,
                  to: sms.to,
                  dateCreated: sms.dateCreated,
                  direction: sms.direction,
                  fileURLs: sms.mediaUrls,
                  mediaType: sms.mediaType,
                  mediaContentType: sms.mediaContentType,
                  mediaSize: sms.mediaSize,
                }),
              );

              conversation.smsReplies = [
                ...conversation.smsReplies,
                ...smsReplies,
              ];
              conversation.read = false;
              conversation.count += smsReplies.length;
              await this.conversationRepository.save(conversation);
              await this.smsReplyRepository.save(smsReplies);
            }
          }
        }),
      );

      if (!conversations.length) {
        if (
          folderId ||
          assignmentStatus ||
          location ||
          isOpen !== undefined ||
          read !== undefined ||
          search
        ) {
          return [];
        }
        throw new NotFoundException('No conversations found');
      }

      return conversations;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error fetching conversations: ${error.message}`,
      );
    }
  }
  async getConversationById(id: string): Promise<any> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: [
        'contact',
        'contact.createdBy',
        'contact.customProperties',
        'contact.customProperties.propertyDefinition',
        'assignedTo',
        'assignedTeam',
        'messages',
        'messages.sender',
        'calls',
        'calls.callBy',
        'smsReplies',
      ],
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    conversation.read = true;
    conversation.count = 0;
    await this.conversationRepository.save(conversation);

    await this.fetchAndSaveNewSmsReplies(conversation);

    const timeline = this.createTimeline(conversation);

    return this.formatConversationResponse(conversation, timeline);
  }

  private async fetchAndSaveNewSmsReplies(
    conversation: Conversation,
  ): Promise<void> {
    try {
      // Skip SMS fetching if conversation is blocked
      if (conversation.block) {
        this.logger.log(
          `Skipping SMS fetch for blocked conversation: ${conversation.id}`,
        );
        return;
      }

      const fetchedSmsReplies = await this.getSmsService.getSmsByPhoneNumber(
        conversation.contact.phone,
      );

      const existingSids = conversation.smsReplies.map((reply) => reply.sid);
      const newSmsReplies = fetchedSmsReplies.filter(
        (reply) =>
          !existingSids.includes(reply.sid) && reply.direction === 'inbound',
      );

      if (newSmsReplies.length > 0) {
        const smsReplyEntities = newSmsReplies.map((reply) => {
          const smsReply = new SmsReply();
          smsReply.conversation = conversation;
          smsReply.sid = reply.sid;
          smsReply.body = reply.body;
          smsReply.from = reply.from;
          smsReply.to = reply.to;
          smsReply.dateCreated = reply.dateCreated;
          smsReply.direction = reply.direction;

          if (reply.numMedia && reply.numMedia > 0) {
            smsReply.fileURLs = reply.mediaUrls || [];
            smsReply.mediaType = reply.mediaType;
            smsReply.mediaContentType = reply.mediaContentType;
            smsReply.mediaSize = reply.mediaSize;
          }

          return smsReply;
        });

        await this.smsReplyRepository.save(smsReplyEntities);
        conversation.smsReplies.push(...smsReplyEntities);

        // Update read status and count
        conversation.read = false;
        conversation.count += newSmsReplies.length;
        await this.conversationRepository.save(conversation);
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch SMS replies: ${error.message}`);
    }
  }

  private createTimeline(conversation: Conversation): TimelineItem[] {
    const timeline: TimelineItem[] = [
      ...conversation.messages.map(this.formatMessageToTimelineItem),
      ...conversation.smsReplies.map(this.formatSmsReplyToTimelineItem),
    ];

    return timeline.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }

  private formatMessageToTimelineItem(message: Message): TimelineItem {
    return {
      id: message.id,
      type: 'message',
      content: message.content,
      sender: {
        id: message.sender.id,
        name: message.sender.name || 'Unknown',
      },
      createdAt: message.createdAt,
      isScheduled: message.isScheduled,
      scheduleAt: message.scheduleAt,
      isRecurring: message.isRecurring,
      recurrencePattern: message.recurrencePattern,
      fileURLs: message.fileURLs || [],
      direction: 'outbound',
      isDelivered: message.isDelivered,
      deliveryError: message.deliveryError,
    };
  }

  private formatSmsReplyToTimelineItem(smsReply: SmsReply): TimelineItem {
    return {
      id: smsReply.id,
      type: 'smsReply',
      content: smsReply.body,
      sender: {
        id: null,
        name: smsReply.from || 'Unknown',
        phone: smsReply.from,
      },
      createdAt: smsReply.dateCreated,
      fileURLs: smsReply.fileURLs || [],
      mediaType: smsReply.mediaType,
      mediaContentType: smsReply.mediaContentType,
      mediaSize: smsReply.mediaSize,
      direction: 'inbound',
    };
  }

  private addExampleReplies(conversation: Conversation): TimelineItem[] {
    const now = new Date();
    return [
      {
        id: 'example-1',
        type: 'message',
        content: 'Hello! How can I assist you today?',
        sender: {
          id: 'system',
          name: 'System',
        },
        createdAt: new Date(now.getTime() - 3600000),
        isScheduled: false,
        scheduleAt: null,
        isRecurring: false,
        recurrencePattern: null,
        fileURLs: [],
        direction: 'outbound',
      },
      {
        id: 'example-2',
        type: 'smsReply',
        content: 'Hi, I have a question about my account.',
        sender: {
          id: null,
          name: conversation.contact.firstName || 'Customer',
          phone: conversation.contact.phone,
        },
        createdAt: new Date(now.getTime() - 3300000),
        fileURLs: [],
        mediaType: null,
        mediaContentType: null,
        mediaSize: null,
        direction: 'inbound',
      },
      {
        id: 'example-3',
        type: 'message',
        content:
          "Of course! I'd be happy to help. What specific question do you have about your account?",
        sender: {
          id: 'system',
          name: 'System',
        },
        createdAt: new Date(now.getTime() - 3000000),
        isScheduled: false,
        scheduleAt: null,
        isRecurring: false,
        recurrencePattern: null,
        fileURLs: [],
        direction: 'outbound',
      },
    ];
  }

  private formatConversationResponse(
    conversation: Conversation,
    timeline: TimelineItem[],
  ): any {
    const allFileURLs = timeline.reduce((urls: string[], item) => {
      if (item.fileURLs && Array.isArray(item.fileURLs)) {
        return [...urls, ...item.fileURLs];
      }
      return urls;
    }, []);

    // Format custom properties into key-value pairs
    const formattedCustomProperties = {};
    if (conversation.contact?.customProperties) {
      conversation.contact.customProperties.forEach((prop) => {
        if (prop.propertyDefinition) {
          formattedCustomProperties[prop.propertyDefinition.name] = prop.value;
        }
      });
    }

    // Format contact details to match contacts service format
    const contact = conversation.contact
      ? {
          id: conversation.contact.id,
          firstName: conversation.contact.firstName || '',
          lastName: conversation.contact.lastName || '',
          phone: conversation.contact.phone || '',
          email: conversation.contact.email || '',
          originalSource: conversation.contact.originalSource,
          block: conversation.contact.block,
          optout: conversation.contact.optout,
          createdAt: conversation.contact.createdAt,
          customProperties: formattedCustomProperties,
          createdBy: conversation.contact.createdBy
            ? {
                id: conversation.contact.createdBy.id,
                email: conversation.contact.createdBy.email,
                name: conversation.contact.createdBy.name,
              }
            : null,
        }
      : null;

    return {
      id: conversation.id,
      contact,
      assignedTo: conversation.assignedTo
        ? this.formatUserBasicInfo(conversation.assignedTo)
        : null,
      assignedTeam: conversation.assignedTeam
        ? this.formatTeamBasicInfo(conversation.assignedTeam)
        : null,
      assign: conversation.assign,
      assignTeam: conversation.assignTeam,
      fileURLs: allFileURLs,
      senderLocation: conversation.senderLocation || '',
      notes: conversation.notes || '',
      teamAutoAssign: conversation.teamAutoAssign || false,
      memberAutoAssign: conversation.memberAutoAssign || false,
      customSignature: conversation.customSignature || false,
      signatureText: conversation.signatureText || '',
      addFlag: conversation.addFlag || false,
      read: conversation.read || false,
      isOpen: conversation.isOpen ?? true,
      timeline: timeline,
      calls: conversation.calls
        ? conversation.calls.map(this.formatCallItem)
        : [],
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messageCount: timeline.length,
      lastMessageAt:
        timeline.length > 0 ? timeline[timeline.length - 1].createdAt : null,
      isExampleTimeline:
        timeline.length > 0 && timeline[0].id.startsWith('example-'),
    };
  }

  private formatUserBasicInfo(user: User) {
    return {
      id: user.id,
      name: user.name || 'Unknown',
      email: user.email,
    };
  }

  private formatTeamBasicInfo(team: Team) {
    return {
      id: team.id,
      name: team.name,
      description: team.description,
    };
  }

  private formatCallItem(call: Call): any {
    return {
      id: call.id,
      // callBy: call.callBy ? this.formatUserBasicInfo(call.callBy) : null,
      minutesTalked: call.minutesTalked || 0,
      isCanceled: call.isCanceled || false,
      isReceived: call.isReceived || false,
      callTime: call.callTime,
    };
  }

  private getLastMessageDate(timeline: (Message | SmsReply)[]): Date | null {
    if (timeline.length === 0) return null;
    return timeline[timeline.length - 1] instanceof Message
      ? (timeline[timeline.length - 1] as Message).createdAt
      : (timeline[timeline.length - 1] as SmsReply).dateCreated;
  }

  async updateConversation(
    id: string,
    updateDto: UpdateConversationDto,
  ): Promise<Conversation> {
    this.logger.log(`Updating conversation ${id} with DTO:`, updateDto); // Add logging

    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'assignedTeam'],
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
    console.log(updateDto.isOpen);
    // Explicitly handle isOpen
    if (updateDto.isOpen !== undefined) {
      this.logger.log(`Updating isOpen to: ${updateDto.isOpen}`);
      conversation.isOpen = updateDto.isOpen;
    }

    console.log(conversation.isOpen);
    // Handle other fields
    Object.keys(updateDto).forEach((key) => {
      if (
        updateDto[key] !== undefined &&
        key !== 'assignedToId' &&
        key !== 'assignedTeamId'
      ) {
        conversation[key] = updateDto[key];
      }
    });

    // Handle assignedTo
    if (updateDto.assignedToId !== undefined) {
      if (updateDto.assignedToId) {
        const assignedUser = await this.userRepository.findOne({
          where: { id: updateDto.assignedToId },
        });
        if (!assignedUser) {
          throw new BadRequestException(
            `User with ID ${updateDto.assignedToId} not found`,
          );
        }
        conversation.assignedTo = assignedUser;
        conversation.assign = true;
        // Reset team assignment when assigning to user
        conversation.assignedTeam = null;
        conversation.assignTeam = false;
      } else {
        conversation.assignedTo = null;
        conversation.assign = false;
      }
    }

    // Handle assignedTeam
    if (updateDto.assignedTeamId !== undefined) {
      if (updateDto.assignedTeamId) {
        const assignedTeam = await this.teamRepository.findOne({
          where: { id: updateDto.assignedTeamId },
        });
        if (!assignedTeam) {
          throw new BadRequestException(
            `Team with ID ${updateDto.assignedTeamId} not found`,
          );
        }
        conversation.assignedTeam = assignedTeam;
        conversation.assignTeam = true;
        // Reset user assignment when assigning to team
        conversation.assignedTo = null;
        conversation.assign = false;
      } else {
        conversation.assignedTeam = null;
        conversation.assignTeam = false;
      }
    }

    try {
      console.log(conversation.isOpen);
      this.logger.log('Saving conversation with updates:', conversation);
      const savedConversation =
        await this.conversationRepository.save(conversation);
      this.logger.log('Conversation saved successfully:', savedConversation);
      return this.getConversationById(id);
    } catch (error) {
      this.logger.error(`Failed to update conversation: ${error.message}`);
      throw new BadRequestException('Failed to update conversation');
    }
  }
  async getAllLocations(): Promise<string[]> {
    const locations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .select('DISTINCT conversation.senderLocation', 'location')
      .where('conversation.senderLocation IS NOT NULL')
      .getRawMany();

    return locations.map((item) => item.location).filter(Boolean);
  }

  async bulkAssignConversations(
    conversationIds: string[],
    assignedToId: string,
  ): Promise<{ success: boolean; message: string; updatedCount: number }> {
    try {
      // Verify the user exists
      const assignedUser = await this.userRepository.findOne({
        where: { id: assignedToId },
      });
      if (!assignedUser) {
        throw new NotFoundException(`User with ID ${assignedToId} not found`);
      }

      // Find all conversations
      const conversations = await this.conversationRepository.find({
        where: { id: In(conversationIds) },
      });

      if (!conversations.length) {
        throw new NotFoundException(
          'No conversations found with the provided IDs',
        );
      }

      // Update each conversation
      conversations.forEach((conversation) => {
        conversation.assignedTo = assignedUser;
        conversation.assign = true;
      });

      // Save all updates
      await this.conversationRepository.save(conversations);

      return {
        success: true,
        message: 'Conversations assigned successfully',
        updatedCount: conversations.length,
      };
    } catch (error) {
      this.logger.error(`Bulk assign error: ${error.message}`);
      throw new BadRequestException(
        `Failed to bulk assign conversations: ${error.message}`,
      );
    }
  }

  async bulkBlockConversations(
    conversationIds: string[],
    block: boolean,
  ): Promise<{ success: boolean; message: string; updatedCount: number }> {
    try {
      const conversations = await this.conversationRepository.find({
        where: { id: In(conversationIds) },
      });

      if (!conversations.length) {
        throw new NotFoundException(
          'No conversations found with the provided IDs',
        );
      }

      // Update block status for each conversation
      conversations.forEach((conversation) => {
        conversation.block = block;
      });

      // Save all updates
      await this.conversationRepository.save(conversations);

      return {
        success: true,
        message: `Conversations ${block ? 'blocked' : 'unblocked'} successfully`,
        updatedCount: conversations.length,
      };
    } catch (error) {
      this.logger.error(`Bulk block error: ${error.message}`);
      throw new BadRequestException(
        `Failed to bulk ${block ? 'block' : 'unblock'} conversations: ${error.message}`,
      );
    }
  }

  async bulkUpdateOpenStatus(
    conversationIds: string[],
    isOpen: boolean,
  ): Promise<{ success: boolean; message: string; updatedCount: number }> {
    try {
      // Find all conversations
      const conversations = await this.conversationRepository.find({
        where: { id: In(conversationIds) },
      });

      if (!conversations.length) {
        throw new NotFoundException(
          'No conversations found with the provided IDs',
        );
      }

      // Update isOpen status for each conversation
      conversations.forEach((conversation) => {
        conversation.isOpen = isOpen;
      });

      // Save all updates
      await this.conversationRepository.save(conversations);

      return {
        success: true,
        message: `Conversations ${isOpen ? 'opened' : 'closed'} successfully`,
        updatedCount: conversations.length,
      };
    } catch (error) {
      this.logger.error(`Bulk open status update error: ${error.message}`);
      throw new BadRequestException(
        `Failed to bulk ${isOpen ? 'open' : 'close'} conversations: ${error.message}`,
      );
    }
  }

  async handleUnknownMessage(
    from: string,
    body: string,
    mediaUrls?: string[],
  ): Promise<Conversation> {
    this.logger.log(`Handling unknown message from: ${from}`);

    // First, try to find existing contact
    let contact = await this.contactRepository.findOne({
      where: { phone: from },
    });

    // If no contact exists, create a new one
    if (!contact) {
      contact = this.contactRepository.create({
        phone: from,
        firstName: 'Unknown',
        lastName: 'Contact',
        originalSource: 'SMS',
      });
      await this.contactRepository.save(contact);
      this.logger.log(`Created new contact for unknown number: ${from}`);
    }

    // Find or create conversation
    let conversation = await this.conversationRepository.findOne({
      where: { contact: { id: contact.id } },
      relations: ['contact', 'smsReplies'],
    });

    if (!conversation) {
      conversation = this.conversationRepository.create({
        contact: contact,
        isOpen: true,
        read: false,
        count: 1,
      });
      this.logger.log(`Created new conversation for unknown contact: ${from}`);
    } else {
      conversation.isOpen = true;
      conversation.read = false;
      conversation.count += 1;
    }

    // Create SMS reply
    const smsReply = this.smsReplyRepository.create({
      conversation: conversation,
      sid: `unknown_${Date.now()}`,
      body: body,
      from: from,
      to: this.configService.get<string>('twilio.phoneNumber'),
      dateCreated: new Date(),
      direction: 'inbound',
      fileURLs: mediaUrls,
    });

    conversation.smsReplies = [...(conversation.smsReplies || []), smsReply];
    await this.conversationRepository.save(conversation);
    await this.smsReplyRepository.save(smsReply);

    return conversation;
  }
}
