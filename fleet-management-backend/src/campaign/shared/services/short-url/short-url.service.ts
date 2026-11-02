import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { ShortUrl } from '../../../../entities/short-url.entity';

@Injectable()
export class ShortUrlService {
  private readonly logger = new Logger(ShortUrlService.name);
  private readonly baseUrl: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(ShortUrl)
    private shortUrlRepository: Repository<ShortUrl>,
  ) {
    this.baseUrl = this.configService.get<string>('BASE_URL');
    if (!this.baseUrl) {
      throw new Error('BASE_URL is not defined in the environment variables');
    }
  }

  async shortenUrl(originalUrl: string): Promise<string> {
    try {
      if (!this.isValidUrl(originalUrl)) {
        throw new BadRequestException('Invalid URL provided');
      }

      let shortUrl = await this.shortUrlRepository.findOne({
        where: { originalUrl },
      });

      if (shortUrl) {
        return `${this.baseUrl}/${shortUrl.shortCode}`;
      }

      const shortCode = await this.generateUniqueShortCode();
      shortUrl = this.shortUrlRepository.create({
        shortCode,
        originalUrl,
      });

      await this.shortUrlRepository.save(shortUrl);

      const shortenedUrl = `${this.baseUrl}/${shortCode}`;
      this.logger.log(
        `Shortened URL created: ${shortenedUrl} for ${originalUrl}`,
      );

      return shortenedUrl;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error shortening URL: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'An error occurred while shortening the URL',
      );
    }
  }

  async getOriginalUrl(shortCode: string): Promise<string> {
    try {
      const shortUrl = await this.shortUrlRepository.findOne({
        where: { shortCode },
      });

      if (!shortUrl) {
        throw new NotFoundException('Short URL not found');
      }

      // Increment the click count
      shortUrl.clicks += 1;
      await this.shortUrlRepository.save(shortUrl);

      return shortUrl.originalUrl;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error retrieving original URL: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'An error occurred while retrieving the original URL',
      );
    }
  }

  private async generateUniqueShortCode(): Promise<string> {
    let shortCode: string;
    let existingUrl: ShortUrl | null;

    do {
      shortCode = nanoid(8); // generates a 8-character unique string
      existingUrl = await this.shortUrlRepository.findOne({
        where: { shortCode },
      });
    } while (existingUrl);

    return shortCode;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
