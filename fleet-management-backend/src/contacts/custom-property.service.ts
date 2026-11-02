// src/contacts/custom-property.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomPropertyDefinition } from '../entities/custom-property-definition.entity';
import { ContactCustomProperty } from '../entities/contact-custom-property.entity';
import { Contact } from '../entities/contacts.entity';
import { CreateCustomPropertyDefinitionDto } from './customDto/create-custom-property-definition.dto';
import { UpdateCustomPropertyDefinitionDto } from './customDto/update-custom-property-definition.dto';
import { AddCustomPropertyDto } from './customDto/add-custom-property.dto';
import { UpdateCustomPropertyDto } from './customDto/update-custom-property.dto';

@Injectable()
export class CustomPropertyService {
  constructor(
    @InjectRepository(CustomPropertyDefinition)
    private customPropertyDefinitionRepository: Repository<CustomPropertyDefinition>,
    @InjectRepository(ContactCustomProperty)
    private contactCustomPropertyRepository: Repository<ContactCustomProperty>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async createPropertyDefinition(
    createDto: CreateCustomPropertyDefinitionDto,
  ): Promise<CustomPropertyDefinition> {
    const propertyDefinition =
      this.customPropertyDefinitionRepository.create(createDto);
    return this.customPropertyDefinitionRepository.save(propertyDefinition);
  }

  async getAllPropertyDefinitions(): Promise<CustomPropertyDefinition[]> {
    return this.customPropertyDefinitionRepository.find();
  }

  async getPropertyDefinition(id: string): Promise<CustomPropertyDefinition> {
    const propertyDefinition =
      await this.customPropertyDefinitionRepository.findOne({ where: { id } });
    if (!propertyDefinition) {
      throw new NotFoundException(
        `Custom property definition with ID "${id}" not found`,
      );
    }
    return propertyDefinition;
  }

  async updatePropertyDefinition(
    id: string,
    updateDto: UpdateCustomPropertyDefinitionDto,
  ): Promise<CustomPropertyDefinition> {
    const propertyDefinition = await this.getPropertyDefinition(id);
    Object.assign(propertyDefinition, updateDto);
    return this.customPropertyDefinitionRepository.save(propertyDefinition);
  }

  async deletePropertyDefinition(id: string): Promise<void> {
    const result = await this.customPropertyDefinitionRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Custom property definition with ID "${id}" not found`,
      );
    }
  }

  async addCustomProperty(
    addDto: AddCustomPropertyDto,
  ): Promise<ContactCustomProperty> {
    const contact = await this.contactRepository.findOne({
      where: { id: addDto.contactId },
    });
    if (!contact) {
      throw new NotFoundException(
        `Contact with ID "${addDto.contactId}" not found`,
      );
    }

    const propertyDefinition = await this.getPropertyDefinition(
      addDto.propertyDefinitionId,
    );

    const customProperty = this.contactCustomPropertyRepository.create({
      contact,
      propertyDefinition,
      value: addDto.value,
    });

    return this.contactCustomPropertyRepository.save(customProperty);
  }

  async updateCustomProperty(
    id: string,
    updateDto: UpdateCustomPropertyDto,
  ): Promise<ContactCustomProperty> {
    const customProperty = await this.contactCustomPropertyRepository.findOne({
      where: { id },
      relations: ['contact', 'propertyDefinition'],
    });

    if (!customProperty) {
      throw new NotFoundException(`Custom property with ID "${id}" not found`);
    }

    if (updateDto.contactId) {
      const contact = await this.contactRepository.findOne({
        where: { id: updateDto.contactId },
      });
      if (!contact) {
        throw new NotFoundException(
          `Contact with ID "${updateDto.contactId}" not found`,
        );
      }
      customProperty.contact = contact;
    }

    if (updateDto.propertyDefinitionId) {
      const propertyDefinition = await this.getPropertyDefinition(
        updateDto.propertyDefinitionId,
      );
      customProperty.propertyDefinition = propertyDefinition;
    }

    if (updateDto.value !== undefined) {
      customProperty.value = updateDto.value;
    }

    return this.contactCustomPropertyRepository.save(customProperty);
  }

  async deleteCustomProperty(id: string): Promise<void> {
    const result = await this.contactCustomPropertyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Custom property with ID "${id}" not found`);
    }
  }

  async getCustomPropertiesForContact(
    contactId: string,
  ): Promise<ContactCustomProperty[]> {
    return this.contactCustomPropertyRepository.find({
      where: { contact: { id: contactId } },
      relations: ['propertyDefinition'],
    });
  }
}
