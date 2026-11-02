import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Business } from '../../entities/business.entity';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  async getBusinessIdForUser(userId: string): Promise<string> {
    const businessAsAdmin = await this.businessRepository.findOne({
      where: { adminId: userId },
    });

    if (businessAsAdmin) {
      return businessAsAdmin.id;
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (user && user.businessId) {
      return user.businessId;
    }

    throw new NotFoundException('No business found for this user');
  }
}
