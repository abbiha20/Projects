// src/encryption/encryption.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly iv: Buffer;

  constructor(private configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('encryption.key');
    const encryptionIv = this.configService.get<string>('encryption.iv');

    if (!encryptionKey || !encryptionIv) {
      this.logger.error('Encryption key or IV is missing in the configuration');
      throw new Error('Encryption configuration is incomplete');
    }

    this.key = Buffer.from(encryptionKey, 'hex');
    this.iv = Buffer.from(encryptionIv, 'hex');

    if (this.key.length !== 32 || this.iv.length !== 16) {
      this.logger.error('Invalid encryption key or IV length');
      throw new Error('Invalid encryption configuration');
    }
  }

  encrypt(text: string): string {
    try {
      const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      this.logger.error(`Encryption failed: ${error.message}`);
      throw new Error('Encryption failed');
    }
  }

  decrypt(encrypted: string): string {
    try {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.key,
        this.iv,
      );
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      this.logger.error(`Decryption failed: ${error.message}`);
      throw new Error('Decryption failed');
    }
  }
}
