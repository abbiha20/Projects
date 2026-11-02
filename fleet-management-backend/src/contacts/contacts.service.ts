import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource, TypeORMError } from 'typeorm';
import { Contact } from '../entities/contacts.entity';
import { ContactCustomProperty } from '../entities/contact-custom-property.entity';
import {
  CustomPropertyDefinition,
  PropertyType,
} from '../entities/custom-property-definition.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { FindAllContactsDto } from './dto/findAllcontacts.dto';
@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(ContactCustomProperty)
    private customPropertyRepository: Repository<ContactCustomProperty>,
    @InjectRepository(CustomPropertyDefinition)
    private customPropertyDefinitionRepository: Repository<CustomPropertyDefinition>,
    private dataSource: DataSource,
    @InjectRepository(ContactCustomProperty)
    private contactCustomPropertyRepository: Repository<ContactCustomProperty>,
    @InjectRepository(CustomPropertyDefinition)
    private propertyDefinitionRepository: Repository<CustomPropertyDefinition>,
  ) {}

  async create(
    createContactDto: CreateContactDto,
    userId: string,
  ): Promise<Contact> {
    try {
      const {
        firstName,
        lastName,
        phone,
        email,
        originalSource,
        block,
        customProperties,
      } = createContactDto;

      const contact = this.contactRepository.create({
        firstName,
        lastName,
        phone,
        email,
        originalSource,
        block,
        createdBy: { id: userId },
      });

      if (customProperties) {
        contact.customProperties =
          await this.processCustomProperties(customProperties);
      }

      return await this.contactRepository.save(contact);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to create contact. Please check your input and try again.',
      );
    }
  }
  async findtoAll(
    queryParams: FindAllContactsDto,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    try {
      const { search, sortBy, sortOrder, page, limit, ageRange } = queryParams;

      const query = this.contactRepository
        .createQueryBuilder('contact')
        .leftJoinAndSelect('contact.createdBy', 'createdBy')
        .leftJoinAndSelect('contact.customProperties', 'customProperties')
        .leftJoinAndSelect(
          'customProperties.propertyDefinition',
          'propertyDefinition',
        );

      // Remove search from initial query to get all contacts first
      if (ageRange) {
        const [minAge, maxAge] = ageRange.split('-').map(Number);
        query
          .andWhere('customProperties.value BETWEEN :minAge AND :maxAge', {
            minAge,
            maxAge,
          })
          .andWhere('propertyDefinition.name = :agePropName', {
            agePropName: 'Age',
          });
      }

      // Get all contacts first
      const contacts = await query.getMany();

      // Filter contacts in memory after decryption
      let filteredContacts = contacts;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredContacts = contacts.filter((contact) => {
          const firstName = contact.firstName?.toLowerCase() || '';
          const lastName = contact.lastName?.toLowerCase() || '';
          const phone = contact.phone?.toLowerCase() || '';

          return (
            firstName.includes(searchLower) ||
            lastName.includes(searchLower) ||
            phone.includes(searchLower)
          );
        });
      }

      // Calculate pagination
      const total = filteredContacts.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      // Sort contacts
      filteredContacts.sort((a, b) => {
        const aValue = a[sortBy]?.toLowerCase() || '';
        const bValue = b[sortBy]?.toLowerCase() || '';
        return sortOrder === 'ASC'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });

      // Apply pagination
      const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

      const customPropertyDefinitions =
        await this.customPropertyDefinitionRepository.find();

      const flattenedContacts = paginatedContacts.map((contact) =>
        this.formatContactWithProperties(contact, customPropertyDefinitions),
      );

      return {
        data: flattenedContacts,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in findtoAll:', error);
      throw new BadRequestException(
        'Failed to fetch contacts. Please try again later.',
      );
    }
  }

  async findAll(): Promise<Contact[]> {
    try {
      return await this.contactRepository.find({
        relations: [
          'createdBy',
          'customProperties',
          'customProperties.propertyDefinition',
        ],
      });
    } catch {
      throw new BadRequestException(
        'Failed to fetch contacts. Please try again later.',
      );
    }
  }

  async findOne(id: string): Promise<Contact> {
    try {
      console.log(`Attempting to find contact with ID: ${id}`);
      const contact = await this.contactRepository.findOne({
        where: { id },
        relations: [
          'createdBy',
          'customProperties',
          'customProperties.propertyDefinition',
        ],
      });

      if (!contact) {
        console.log(`Contact with ID "${id}" not found`);
        throw new NotFoundException(`Contact with ID "${id}" not found`);
      }

      console.log(`Successfully found contact:`, contact);
      return contact;
    } catch (error) {
      console.error(`Error in findOne method:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to fetch contact with ID "${id}". Please try again later.`,
      );
    }
  }

  async update(
    id: string,
    updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
    try {
      console.log(`Attempting to update contact with ID: ${id}`);
      console.log(`Update DTO:`, updateContactDto);

      const contact = await this.findOne(id);

      const {
        firstName,
        lastName,
        phone,
        email,
        originalSource,
        block,
        optout,
        customProperties,
      } = updateContactDto;

      // Update basic contact info
      Object.assign(contact, {
        firstName,
        lastName,
        phone,
        email,
        originalSource,
        block,
        optout,
      });

      if (customProperties) {
        console.log(`Updating custom properties for contact ${id}`);
        await this.customPropertyRepository.remove(contact.customProperties);
        contact.customProperties =
          await this.processCustomProperties(customProperties);
      }

      const updatedContact = await this.contactRepository.save(contact);
      console.log(`Successfully updated contact:`, updatedContact);
      return updatedContact;
    } catch (error) {
      console.error(`Error in update method:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof TypeORMError) {
        throw new InternalServerErrorException(
          `Database error occurred while updating contact with ID "${id}". Please try again later.`,
        );
      }
      throw new BadRequestException(
        `Failed to update contact with ID "${id}". Please check your input and try again.`,
      );
    }
  }

  async removeMultiple(ids: string[]): Promise<{ deletedCount: number }> {
    try {
      const existingContacts = await this.contactRepository.find({
        where: { id: In(ids) },
      });

      if (existingContacts.length !== ids.length) {
        const existingIds = existingContacts.map((contact) => contact.id);
        const nonExistingIds = ids.filter((id) => !existingIds.includes(id));
        throw new NotFoundException(
          `Contacts with IDs ${nonExistingIds.join(', ')} not found`,
        );
      }

      const result = await this.contactRepository.softRemove(existingContacts);

      return { deletedCount: result.length };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in removeMultiple:', error);
      throw new InternalServerErrorException(
        `Failed to remove contacts. Please try again later.`,
      );
    }
  }
  private async processCustomProperties(
    customProperties: Record<string, any>,
  ): Promise<ContactCustomProperty[]> {
    const processedProperties: ContactCustomProperty[] = [];

    for (const [key, value] of Object.entries(customProperties)) {
      const definition = await this.customPropertyDefinitionRepository.findOne({
        where: { name: key },
      });

      if (!definition) {
        throw new BadRequestException(
          `Custom property "${key}" is not defined`,
        );
      }

      const isValid = this.validatePropertyValue(definition.type, value);
      if (!isValid) {
        throw new BadRequestException(
          `Invalid value type for custom property "${key}"`,
        );
      }

      processedProperties.push(
        this.customPropertyRepository.create({
          propertyDefinition: definition,
          value: this.formatPropertyValue(definition.type, value),
        }),
      );
    }

    return processedProperties;
  }

  private validatePropertyValue(type: PropertyType, value: any): boolean {
    switch (type) {
      case PropertyType.TEXT:
      case PropertyType.DROPDOWN:
        return typeof value === 'string';
      case PropertyType.NUMBER:
        return typeof value === 'number' && !isNaN(value);
      case PropertyType.DATE:
        return !isNaN(Date.parse(value));
      case PropertyType.BOOLEAN:
        return typeof value === 'boolean';
      default:
        return false;
    }
  }

  private formatPropertyValue(type: PropertyType, value: any): string {
    switch (type) {
      case PropertyType.DATE:
        return new Date(value).toISOString();
      case PropertyType.BOOLEAN:
        return value ? 'true' : 'false';
      default:
        return value.toString();
    }
  }

  async getAllContacts(
    queryParams: FindAllContactsDto,
    blocked: boolean,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    try {
      const { search, sortBy, sortOrder, page, limit, ageRange } = queryParams;

      const query = this.contactRepository
        .createQueryBuilder('contact')
        .leftJoinAndSelect('contact.createdBy', 'createdBy')
        .leftJoinAndSelect('contact.customProperties', 'customProperties')
        .leftJoinAndSelect(
          'customProperties.propertyDefinition',
          'propertyDefinition',
        )
        .where('contact.block = :blocked', { blocked });

      // Handle age range in query
      if (ageRange) {
        const [minAge, maxAge] = ageRange.split('-').map(Number);
        query
          .andWhere('customProperties.value BETWEEN :minAge AND :maxAge', {
            minAge,
            maxAge,
          })
          .andWhere('propertyDefinition.name = :agePropName', {
            agePropName: 'Age',
          });
      }

      // Get all contacts first
      const contacts = await query.getMany();

      // Filter contacts in memory
      let filteredContacts = contacts;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredContacts = contacts.filter((contact) => {
          const firstName = contact.firstName?.toLowerCase() || '';
          const lastName = contact.lastName?.toLowerCase() || '';
          const email = contact.email?.toLowerCase() || '';
          const phone = contact.phone?.toLowerCase() || '';

          return (
            firstName.includes(searchLower) ||
            lastName.includes(searchLower) ||
            email.includes(searchLower) ||
            phone.includes(searchLower)
          );
        });
      }

      // Calculate pagination
      const total = filteredContacts.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      // Sort contacts in memory
      filteredContacts.sort((a, b) => {
        const aValue = a[sortBy]?.toLowerCase() || '';
        const bValue = b[sortBy]?.toLowerCase() || '';
        return sortOrder === 'ASC'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });

      // Apply pagination
      const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

      const customPropertyDefinitions =
        await this.customPropertyDefinitionRepository.find();

      const flattenedContacts = paginatedContacts.map((contact) =>
        this.formatContactWithProperties(contact, customPropertyDefinitions),
      );

      return {
        data: flattenedContacts,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in getAllContacts:', error);
      throw new BadRequestException(
        'Failed to fetch contacts. Please try again later.',
      );
    }
  }

  async getAllBlockedContacts(
    findAllContactsDto: FindAllContactsDto,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    return this.getAllContacts(findAllContactsDto, true);
  }

  async getAllUnblockedContacts(
    findAllContactsDto: FindAllContactsDto,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    return this.getAllContacts(findAllContactsDto, false);
  }

  async blockContact(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) {
      throw new NotFoundException(`Contact with ID "${id}" not found`);
    }
    contact.block = true;
    return this.contactRepository.save(contact);
  }

  async unblockContact(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) {
      throw new NotFoundException(`Contact with ID "${id}" not found`);
    }
    contact.block = false;
    return this.contactRepository.save(contact);
  }

  async bulkUpdateBlockStatus(
    contactIds: string[],
    block: boolean,
  ): Promise<{ updatedCount: number }> {
    try {
      const contacts = await this.contactRepository.find({
        where: { id: In(contactIds) },
      });

      if (contacts.length === 0) {
        throw new NotFoundException('No contacts found with the provided IDs');
      }

      const nonExistingIds = contactIds.filter(
        (id) => !contacts.find((contact) => contact.id === id),
      );

      if (nonExistingIds.length > 0) {
        throw new NotFoundException(
          `Contacts with IDs ${nonExistingIds.join(', ')} not found`,
        );
      }

      // Update block status for all found contacts
      const result = await this.contactRepository
        .createQueryBuilder()
        .update(Contact)
        .set({ block })
        .where('id IN (:...ids)', { ids: contactIds })
        .execute();

      return { updatedCount: result.affected || 0 };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update block status for contacts',
      );
    }
  }

  async bulkUpdateOptOutStatus(
    contactIds: string[],
    optout: boolean,
  ): Promise<{ updatedCount: number }> {
    try {
      const contacts = await this.contactRepository.find({
        where: { id: In(contactIds) },
      });

      if (contacts.length === 0) {
        throw new NotFoundException('No contacts found with the provided IDs');
      }

      const nonExistingIds = contactIds.filter(
        (id) => !contacts.find((contact) => contact.id === id),
      );

      if (nonExistingIds.length > 0) {
        throw new NotFoundException(
          `Contacts with IDs ${nonExistingIds.join(', ')} not found`,
        );
      }

      // Update optout status for all found contacts
      const result = await this.contactRepository
        .createQueryBuilder()
        .update(Contact)
        .set({ optout })
        .where('id IN (:...ids)', { ids: contactIds })
        .execute();

      return { updatedCount: result.affected || 0 };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update opt-out status for contacts',
      );
    }
  }
  async addContactProperty(
    contactId: string,
    name: string,
    type: string,
    value: string | number | boolean,
    options?: string,
  ): Promise<ContactCustomProperty> {
    // Find contact
    const contact = await this.contactRepository.findOne({
      where: { id: contactId },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found`);
    }

    // Find or create property definition
    let propertyDefinition = await this.propertyDefinitionRepository.findOne({
      where: { name: name.toUpperCase() },
    });

    if (!propertyDefinition) {
      // Create new property definition
      propertyDefinition = this.propertyDefinitionRepository.create({
        name: name.toUpperCase(),
        type: type as PropertyType,
        options,
      });
      await this.propertyDefinitionRepository.save(propertyDefinition);
    }

    // Validate the value based on type
    const validatedValue = this.validateAndFormatValue(value, type, options);

    // Find existing custom property or create new one
    let customProperty = await this.contactCustomPropertyRepository.findOne({
      where: {
        contact: { id: contactId },
        propertyDefinition: { id: propertyDefinition.id },
      },
    });

    if (customProperty) {
      // Update existing property
      customProperty.value = validatedValue.toString();
    } else {
      // Create new custom property
      customProperty = this.contactCustomPropertyRepository.create({
        contact,
        propertyDefinition,
        value: validatedValue.toString(),
        businessId: contact.businessId, // Copy businessId from contact if needed
      });
    }

    return this.contactCustomPropertyRepository.save(customProperty);
  }

  private validateAndFormatValue(
    value: string | number | boolean,
    type: string,
    options?: string,
  ): string | number | boolean {
    switch (type) {
      case PropertyType.NUMBER:
        const numValue = Number(value);
        if (isNaN(numValue)) {
          throw new BadRequestException('Invalid number value');
        }
        return numValue;
      case PropertyType.DATE:
        if (typeof value === 'boolean') {
          throw new BadRequestException('Invalid date value');
        }
        const dateValue = new Date(value as string | number);
        if (isNaN(dateValue.getTime())) {
          throw new BadRequestException('Invalid date value');
        }
        return dateValue.toISOString();

      case PropertyType.BOOLEAN:
        if (typeof value === 'boolean') return value;
        if (['true', 'false', '1', '0'].includes(String(value).toLowerCase())) {
          return ['true', '1'].includes(String(value).toLowerCase());
        }
        throw new BadRequestException('Invalid boolean value');

      case PropertyType.DROPDOWN:
        if (!options) {
          throw new BadRequestException('Dropdown type requires options');
        }
        const allowedOptions = options.split(',').map((opt) => opt.trim());
        if (!allowedOptions.includes(String(value))) {
          throw new BadRequestException(
            `Value must be one of: ${allowedOptions.join(', ')}`,
          );
        }
        return String(value);

      case PropertyType.TEXT:
        return String(value);

      default:
        return String(value);
    }
  }

  // Add this helper method to convert string values back to their proper types
  private convertPropertyValueToType(value: string, type: PropertyType): any {
    if (value === null || value === undefined) {
      return null;
    }

    switch (type) {
      case PropertyType.NUMBER:
        return Number(value);
      case PropertyType.BOOLEAN:
        return value.toLowerCase() === 'true';
      case PropertyType.DATE:
        return new Date(value);
      default:
        return value;
    }
  }

  // Update the flattenedContacts mapping in both findtoAll and getAllContacts methods
  private formatContactWithProperties(
    contact: Contact,
    customPropertyDefinitions: CustomPropertyDefinition[],
  ): any {
    const flattenedContact: any = {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone,
      email: contact.email,
      createdAt: contact.createdAt,
      originalSource: contact.originalSource,
      block: contact.block,
      optout: contact.optout,
      createdBy: contact.createdBy
        ? {
            id: contact.createdBy.id,
            email: contact.createdBy.email,
            name: contact.createdBy.name,
          }
        : null,
      customProperties: {},
    };

    // Populate custom properties with proper type conversion
    customPropertyDefinitions.forEach((def) => {
      const customProp = contact.customProperties.find(
        (cp) => cp.propertyDefinition && cp.propertyDefinition.id === def.id,
      );

      if (customProp && !customProp.propertyDefinition) {
        console.warn(
          `Custom property found without propertyDefinition for contact ${contact.id}, definition ${def.id}`,
        );
      }

      flattenedContact.customProperties[def.name] = customProp
        ? this.convertPropertyValueToType(customProp.value, def.type)
        : null;
    });

    return flattenedContact;
  }
}
