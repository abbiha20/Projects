import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../entities/group.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { Conversation } from '../entities/conversation.entity';

@Injectable()
export class GroupMessageService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  async sendMessageToGroup(
    groupId: string,
    content: string,
    senderId: string,
    fileURLs?: string[],
    userRole?: string,
  ): Promise<Message> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException(`Group with ID "${groupId}" not found`);
    }

    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });
    if (!sender) {
      throw new NotFoundException(`User with ID "${senderId}" not found`);
    }

    if (userRole !== 'admin' && !group.memberIds.includes(senderId)) {
      throw new BadRequestException('User is not a member of this group');
    }

    let conversation = await this.conversationRepository.findOne({
      where: { id: groupId },
    });

    if (!conversation) {
      conversation = this.conversationRepository.create({
        id: groupId,
      });
      await this.conversationRepository.save(conversation);
    }

    const message = this.messageRepository.create({
      content,
      sender,
      conversation,
      fileURLs: fileURLs || [],
    });

    const savedMessage = await this.messageRepository.save(message);

    group.messageIds = [...group.messageIds, savedMessage.id];
    await this.groupRepository.save(group);

    return savedMessage;
  }

  async getGroupMessages(groupId: string): Promise<Message[]> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException(`Group with ID "${groupId}" not found`);
    }

    return this.messageRepository.find({
      where: { conversation: { id: groupId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }
}
