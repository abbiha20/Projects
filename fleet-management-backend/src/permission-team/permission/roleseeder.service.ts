import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleType } from '../../entities/role.entity';

@Injectable()
export class RoleSeederService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async seed() {
    for (const roleType of Object.values(RoleType)) {
      const existingRole = await this.roleRepository.findOne({
        where: { type: roleType },
      });
      if (!existingRole) {
        const newRole = this.roleRepository.create({ type: roleType });
        await this.roleRepository.save(newRole);
        console.log(`Created role: ${roleType}`);
      }
    }
  }
}
