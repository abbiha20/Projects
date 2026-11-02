import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from '../entities/listContact.entity';
import { Contact } from '../entities/contacts.entity';
import { CreateListDto } from './dto/createlist.dto';
import { AddContactsDto } from './dto/addcontact.dto';
import { FindAllListsDto } from './dto/list.dto';

@Injectable()
export class ListService {
  private readonly logger = new Logger(ListService.name);

  constructor(
    @InjectRepository(List)
    private listRepository: Repository<List>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async createList(createListDto: CreateListDto): Promise<List> {
    const list = this.listRepository.create(createListDto);
    return this.listRepository.save(list);
  }

  async addContactsToList(
    listId: string,
    addContactsDto: AddContactsDto,
  ): Promise<List> {
    const list = await this.listRepository.findOne({
      where: { id: listId },
      relations: ['contacts'],
    });

    if (!list) {
      throw new NotFoundException(`List with ID "${listId}" not found`);
    }

    const contactsToAdd = await this.contactRepository.findByIds(
      addContactsDto.contactIds,
    );
    list.contacts = [...list.contacts, ...contactsToAdd];

    return this.listRepository.save(list);
  }

  async removeContactFromList(
    listId: string,
    contactId: string,
  ): Promise<List> {
    const list = await this.listRepository.findOne({
      where: { id: listId },
      relations: ['contacts'],
    });

    if (!list) {
      throw new NotFoundException(`List with ID "${listId}" not found`);
    }

    list.contacts = list.contacts.filter((contact) => contact.id !== contactId);

    return this.listRepository.save(list);
  }

  async deleteList(id: string): Promise<void> {
    const result = await this.listRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`List with ID "${id}" not found`);
    }
  }

  async findAll(
    findAllListsDto: FindAllListsDto,
  ): Promise<{ lists: List[]; total: number }> {
    const { search, sortBy, sortOrder, page, limit } = findAllListsDto;

    const query = this.listRepository
      .createQueryBuilder('list')
      .leftJoinAndSelect('list.contacts', 'contacts');

    if (search) {
      query.where('list.title LIKE :search', { search: `%${search}%` });
    }

    query.orderBy(`list.${sortBy}`, sortOrder);

    const [lists, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { lists, total };
  }

  async findOne(id: string, query: FindAllListsDto): Promise<List> {
    try {
      const { sortBy = 'createdAt', sortOrder = 'DESC', limit = 10 } = query;

      const queryBuilder = this.listRepository
        .createQueryBuilder('list')
        .where('list.id = :id', { id })
        .leftJoinAndSelect('list.contacts', 'contacts');

      if (sortBy === 'title') {
        queryBuilder.orderBy('list.title', sortOrder);
      } else {
        queryBuilder.orderBy('list.createdAt', sortOrder);
      }

      queryBuilder.addOrderBy('contacts.createdAt', sortOrder);

      if (limit) {
        queryBuilder.take(limit);
      }

      const list = await queryBuilder.getOne();

      if (!list) {
        throw new NotFoundException(`List with ID "${id}" not found`);
      }

      return list;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to retrieve list: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve list');
    }
  }
}
