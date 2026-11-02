import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DirectMessage } from '../entities/direct-message.entity';

@Injectable()
export class DirectMessageService {
  constructor(
    @InjectRepository(DirectMessage)
    private directMessageRepo: Repository<DirectMessage>,
  ) {}

  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
    fileURLs?: string[],
  ) {
    try {
      const message = this.directMessageRepo.create({
        sender: { id: senderId },
        receiver: { id: receiverId },
        content,
        fileURLs,
        messageType: 'message',
      });
      return await this.directMessageRepo.save(message);
    } catch {
      throw new BadRequestException('Failed to send message');
    }
  }

  async getConversation(userId: string, otherUserId: string) {
    try {
      const messages = await this.directMessageRepo.find({
        where: [
          { sender: { id: userId }, receiver: { id: otherUserId } },
          { sender: { id: otherUserId }, receiver: { id: userId } },
        ],
        order: { createdAt: 'ASC' },
        relations: ['sender', 'receiver'],
      });

      return messages.map((message) => ({
        id: message.id,
        content: message.content,
        fileURLs: message.fileURLs || [],
        isRead: message.isRead,
        createdAt: message.createdAt,
        messageType: message.sender.id === userId ? 'message' : 'reply',
        sender: {
          id: message.sender.id,
          name: message.sender.name,
          email: message.sender.email,
        },
        receiver: {
          id: message.receiver.id,
          name: message.receiver.name,
          email: message.receiver.email,
        },
      }));
    } catch {
      throw new BadRequestException('Failed to fetch conversation');
    }
  }

  async getAllUserConversations(userId: string) {
    try {
      const messages = await this.directMessageRepo
        .createQueryBuilder('dm')
        .leftJoinAndSelect('dm.sender', 'sender')
        .leftJoinAndSelect('dm.receiver', 'receiver')
        .where('dm.sender.id = :userId OR dm.receiver.id = :userId', { userId })
        .orderBy('dm.createdAt', 'DESC')
        .getMany();

      const conversations = new Map();

      messages.forEach((message) => {
        const partnerId =
          message.sender.id === userId
            ? message.receiver.id
            : message.sender.id;

        const partner =
          message.sender.id === userId ? message.receiver : message.sender;

        const transformedMessage = {
          id: message.id,
          content: message.content,
          fileURLs: message.fileURLs || [],
          isRead: message.isRead,
          createdAt: message.createdAt,
          messageType: message.sender.id === userId ? 'message' : 'reply',
          sender: {
            id: message.sender.id,
            name: message.sender.name,
            email: message.sender.email,
          },
          receiver: {
            id: message.receiver.id,
            name: message.receiver.name,
            email: message.receiver.email,
          },
        };

        if (!conversations.has(partnerId)) {
          conversations.set(partnerId, {
            id: partnerId,
            partner: {
              id: partner.id,
              name: partner.name,
              email: partner.email,
            },
            unreadCount:
              !message.isRead && message.sender.id !== userId ? 1 : 0,
            lastMessage: {
              id: message.id,
              content: message.content,
              fileURLs: message.fileURLs || [],
              isRead: message.isRead,
              createdAt: message.createdAt,
              messageType: transformedMessage.messageType,
            },
            messages: [transformedMessage],
          });
        } else {
          const conversation = conversations.get(partnerId);
          if (!message.isRead && message.sender.id !== userId) {
            conversation.unreadCount++;
          }
          conversation.messages.push(transformedMessage);
        }
      });

      // Format the final response
      const formattedConversations = Array.from(conversations.values()).map(
        (conv) => ({
          id: conv.id,
          partner: conv.partner,
          unreadCount: conv.unreadCount,
          lastMessage: conv.lastMessage,
          messages: conv.messages.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),
          updatedAt: conv.lastMessage.createdAt,
        }),
      );

      // Sort conversations by last message date
      return formattedConversations.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    } catch {
      throw new BadRequestException('Failed to fetch conversations');
    }
  }

  async markMessagesAsRead(userId: string, otherUserId: string) {
    try {
      await this.directMessageRepo
        .createQueryBuilder()
        .update()
        .set({ isRead: true })
        .where(
          'receiverId = :userId AND senderId = :otherUserId AND isRead = :isRead',
          {
            userId,
            otherUserId,
            isRead: false,
          },
        )
        .execute();
    } catch {
      throw new BadRequestException('Failed to mark messages as read');
    }
  }
}
