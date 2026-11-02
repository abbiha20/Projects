import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import * as csv from 'csv-parser';
import * as xlsx from 'xlsx';
import { Readable } from 'stream';
import { CreateContactDto } from './dto/create-contact.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomPropertyDefinition } from '../entities/custom-property-definition.entity';
import { stringify } from 'csv-stringify/sync';

@Injectable()
export class ContactsCsvService {
  private readonly logger = new Logger(ContactsCsvService.name);

  constructor(
    private readonly contactsService: ContactsService,
    @InjectRepository(CustomPropertyDefinition)
    private customPropertyDefinitionRepository: Repository<CustomPropertyDefinition>,
  ) {}

  async importCsv(
    fileStream: Readable,
    userId: string,
    mimeType: string,
  ): Promise<{ successCount: number; errorCount: number }> {
    const results: CreateContactDto[] = [];
    const errors: string[] = [];
    const standardProperties = new Set([
      'firstname',
      'lastname',
      'email',
      'phone',
      'originalsource',
      'block',
    ]);

    const customPropertyDefinitions =
      await this.customPropertyDefinitionRepository.find();

    try {
      if (mimeType.includes('excel') || mimeType.includes('spreadsheetml')) {
        await this.processExcelFile(
          fileStream,
          standardProperties,
          customPropertyDefinitions,
          results,
        );
      } else {
        await this.processCsvFile(
          fileStream,
          standardProperties,
          customPropertyDefinitions,
          results,
        );
      }

      return this.finalizeImport(results, errors, userId);
    } catch (error) {
      this.logger.error('Error during file processing:', error);
      throw new BadRequestException('Failed to process the file');
    }
  }

  private async processExcelFile(
    fileStream: Readable,
    standardProperties: Set<string>,
    customPropertyDefinitions: CustomPropertyDefinition[],
    results: CreateContactDto[],
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      fileStream.on('data', (chunk) => chunks.push(chunk));
      fileStream.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks);
          const workbook = xlsx.read(buffer, { type: 'buffer' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = xlsx.utils.sheet_to_json(worksheet);

          const headers = Object.keys(jsonData[0]);
          jsonData.forEach((row) => {
            this.processRow(
              row,
              headers,
              standardProperties,
              customPropertyDefinitions,
              results,
            );
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  private async processCsvFile(
    fileStream: Readable,
    standardProperties: Set<string>,
    customPropertyDefinitions: CustomPropertyDefinition[],
    results: CreateContactDto[],
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let headers: string[] = [];
      fileStream
        .pipe(csv())
        .on('headers', (csvHeaders: string[]) => {
          headers = csvHeaders;
        })
        .on('data', (data: any) => {
          this.processRow(
            data,
            headers,
            standardProperties,
            customPropertyDefinitions,
            results,
          );
        })
        .on('end', () => resolve())
        .on('error', (error) => reject(error));
    });
  }

  private processRow(
    data: any,
    headers: string[],
    standardProperties: Set<string>,
    customPropertyDefinitions: CustomPropertyDefinition[],
    results: CreateContactDto[],
  ): void {
    const contactData: any = {};
    const customProperties: Record<string, any> = {};

    headers.forEach((header) => {
      const lowerHeader = header.toLowerCase();
      if (standardProperties.has(lowerHeader)) {
        const propertyName = this.mapHeaderToProperty(lowerHeader);
        contactData[propertyName] =
          lowerHeader === 'phone'
            ? this.formatPhoneNumber(data[header])
            : data[header];
      } else {
        const customPropertyDef = customPropertyDefinitions.find(
          (def) => def.name.toLowerCase() === lowerHeader,
        );
        if (customPropertyDef) {
          customProperties[customPropertyDef.name] =
            this.parseCustomPropertyValue(data[header], customPropertyDef.type);
        }
      }
    });

    contactData.customProperties = customProperties;
    contactData.originalSource = contactData.originalSource || 'File Import';
    contactData.block = contactData.block === 'true';

    const contact = plainToClass(CreateContactDto, contactData);
    results.push(contact);
  }

  private async finalizeImport(
    results: CreateContactDto[],
    errors: string[],
    userId: string,
  ): Promise<{ successCount: number; errorCount: number }> {
    if (results.length === 0) {
      throw new BadRequestException('No contacts found in the file.');
    }

    this.logger.log(`Starting import of ${results.length} contacts`);

    let successCount = 0;
    for (const contact of results) {
      const validationErrors = await validate(contact);
      if (validationErrors.length > 0) {
        const errorMessages = validationErrors.map((error) =>
          Object.values(error.constraints || {}).join(', '),
        );
        errors.push(
          `Invalid contact data: ${JSON.stringify(contact)}. Errors: ${errorMessages.join('; ')}`,
        );
      } else {
        try {
          await this.contactsService.create(contact, userId);
          successCount++;
        } catch (error) {
          this.logger.error(`Error creating contact:`, error);
          errors.push(`Error creating contact: ${error.message}`);
        }
      }
    }

    if (errors.length > 0) {
      this.logger.warn(`Errors during import: ${errors.join('\n')}`);
    }

    this.logger.log(
      `Import completed. ${successCount} out of ${results.length} contacts imported successfully.`,
    );
    return { successCount, errorCount: errors.length };
  }

  private mapHeaderToProperty(header: string): string {
    const mapping: { [key: string]: string } = {
      firstname: 'firstName',
      lastname: 'lastName',
      email: 'email',
      phone: 'phone',
      originalsource: 'originalSource',
      block: 'block',
    };
    return mapping[header] || header;
  }

  private formatPhoneNumber(phone: string | number): string {
    if (typeof phone === 'number') {
      phone = phone.toString();
    }
    phone = phone.replace(/\D/g, '');
    if (phone.length > 10 && !phone.startsWith('+')) {
      phone = '+' + phone;
    }
    return phone;
  }

  private parseCustomPropertyValue(value: string, type: string): any {
    switch (type.toLowerCase()) {
      case 'number':
        return isNaN(Number(value)) ? null : Number(value);
      case 'boolean':
        return value.toLowerCase() === 'true';
      case 'date':
        return new Date(value);
      default:
        return value;
    }
  }

  async exportCsv(contacts: any[]): Promise<string> {
    this.logger.log(`Preparing to export ${contacts.length} contacts`);

    // Fetch all custom property definitions
    const customPropertyDefinitions =
      await this.customPropertyDefinitionRepository.find();

    // Create a set of all possible headers
    const headers = new Set([
      'id',
      'firstName',
      'lastName',
      'phone',
      'email',
      'originalSource',
      'block',
      ...customPropertyDefinitions.map((def) => def.name),
    ]);

    const exportData = contacts.map((contact, index) => {
      try {
        if (typeof contact.id !== 'string') {
          throw new BadRequestException(
            `Invalid id for contact at index ${index}: ${contact.id}`,
          );
        }

        const exportContact: any = {
          id: contact.id,
          firstName: contact.firstName || '',
          lastName: contact.lastName || '',
          phone: contact.phone || '',
          email: contact.email || '',
          originalSource: contact.originalSource || '',
          block: contact.block !== undefined ? String(contact.block) : '',
        };

        // Create a map of custom properties for easier access
        const customPropertiesMap = new Map(
          contact.customProperties
            .map((prop: any) => {
              if (prop.propertyDefinition == null) {
                this.logger.warn(
                  `Custom property without propertyDefinition found for contact ${contact.id}`,
                );
                return null;
              }
              return [prop.propertyDefinition.name, prop.value];
            })
            .filter((entry: any) => entry != null),
        );

        // Add custom properties
        customPropertyDefinitions.forEach((def) => {
          const customPropValue = customPropertiesMap.get(def.name);
          exportContact[def.name] = this.formatCustomPropertyValue(
            customPropValue,
            def.type,
          );
        });

        return exportContact;
      } catch (error) {
        this.logger.error(`Error processing contact at index ${index}:`, error);
        this.logger.error(
          'Problematic contact:',
          JSON.stringify(contact, null, 2),
        );
        throw error;
      }
    });

    this.logger.log('Contacts processed, generating CSV');

    return stringify(exportData, {
      header: true,
      columns: Array.from(headers),
    });
  }

  private formatCustomPropertyValue(value: any, type: string): string {
    if (value === undefined || value === null) {
      return '';
    }

    switch (type.toLowerCase()) {
      case 'number':
        return isNaN(Number(value)) ? '' : String(value);
      case 'boolean':
        return String(value);
      case 'date':
        return value instanceof Date ? value.toISOString() : String(value);
      default:
        return String(value);
    }
  }
}
