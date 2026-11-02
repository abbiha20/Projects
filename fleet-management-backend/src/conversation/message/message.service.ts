// message.service.ts
import { Injectable } from '@nestjs/common';
import { Message } from '../../entities/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from '../../entities/conversation.entity';
import { Contact } from '../../entities/contacts.entity';
import { SendSmsService } from '../sms/send-sms/send-sms.service';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,

    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly sendSmsService: SendSmsService,
  ) {}

  async sendMessage(
    receiverNumber: string,
    content: string,
    files?: Express.Multer.File[],
    senderId?: string,
  ): Promise<boolean> {
    try {
      const smsSent = await this.sendSmsService.sendMessage(
        receiverNumber,
        content,
      );
      if (!smsSent) {
        throw new Error('Failed to send SMS');
      }

      const fileURLs = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const filename = this.generateUniqueFilename(file.originalname);
          const uploadDir = path.join(__dirname, '..', 'uploads');
          const uploadPath = path.join(uploadDir, filename);

          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
          }

          // Save the file
          await fs.promises.writeFile(uploadPath, file.buffer);

          // Generate the file URL (ensure it matches your server setup)
          const fileURL = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${filename}`;
          fileURLs.push(fileURL);
        }
      }

      // 3. Find or create the contact
      let contact = await this.contactRepository.findOne({
        where: { phone: receiverNumber },
      });

      if (!contact) {
        contact = new Contact();
        contact.phone = receiverNumber;
        contact.firstName = 'Unknown';
        contact.lastName = 'Unknown';
        contact.email = '';
        contact = await this.contactRepository.save(contact);
      }

      // 4. Find or create the conversation
      let conversation = await this.conversationRepository.findOne({
        where: { contact: { id: contact.id } },
        relations: ['contact'],
      });

      if (!conversation) {
        conversation = new Conversation();
        conversation.contact = contact;
        conversation.isOpen = true;
        conversation.assign = false;
        conversation = await this.conversationRepository.save(conversation);
      }

      // 5. Get the sender (user)
      let sender: User = null;
      if (senderId) {
        sender = await this.userRepository.findOne({ where: { id: senderId } });
      }

      // 6. Create and save the message
      const message = new Message();
      message.conversation = conversation;
      message.sender = sender;
      message.content = content;
      message.fileURLs = fileURLs.length > 0 ? fileURLs : null;

      await this.messageRepository.save(message);

      return true;
    } catch (error) {
      console.error('Error in MessageService:', error);
      return false;
    }
  }

  private generateUniqueFilename(originalname: string): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 9999);
    const extension = path.extname(originalname);
    return `${timestamp}-${random}${extension}`;
  }
}
