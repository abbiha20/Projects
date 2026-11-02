// permissions.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../../entities/permission.entity';
import { Repository } from 'typeorm';
import { Role, RoleType } from '../../entities/role.entity';
import { User } from './../../entities/user.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private permissionKeys = [
    'conversationAssignedToOthers',
    'unassignedConversations',
    'updateRolePermissions',
    'accessMessageFeed',
    'accessContacts',
    'accessManualCampaigns',
    'accessAutomatedCampaigns',
    'editDeleteAndCreateTemplates',
    'editDeleteAndCreateContactProperties',
  ];

  // Method to set permissions
  async setPermissions(permissionsDto: any, userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    for (const [roleKey, permissions] of Object.entries(permissionsDto)) {
      // Convert roleKey to RoleType enum
      const roleType = this.getRoleType(roleKey);
      if (!roleType) {
        throw new Error(`Invalid role type: ${roleKey}`);
      }

      // Find or create the role
      let role = await this.roleRepository.findOne({
        where: { type: roleType },
      });
      if (!role) {
        role = this.roleRepository.create({ type: roleType });
        await this.roleRepository.save(role);
      }

      // Find or create the permission for this user and role
      let permission = await this.permissionRepository.findOne({
        where: { user, role },
      });

      if (!permission) {
        permission = this.permissionRepository.create({
          user,
          role,
        });
      }

      // Update the permission fields
      for (const key of this.permissionKeys) {
        if (permissions.hasOwnProperty(key)) {
          permission[key] = permissions[key];
        }
      }

      // Save the updated permission
      await this.permissionRepository.save(permission);
    }
  }

  async getPermissions(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const permissions = await this.permissionRepository.find({
      where: { user: { id: user.id } },
      relations: ['role'],
    });

    const result = {};
    for (const permission of permissions) {
      if (!permission.role) {
        console.warn(
          `Permission with ID ${permission.id} has no role associated.`,
        );
        continue; // Skip or handle as needed
      }
      if (!permission.role.type) {
        console.warn(`Role for Permission ID ${permission.id} has no type.`);
        continue; // Skip or handle as needed
      }
      const roleKey = permission.role.type.toLowerCase();

      result[roleKey] = {};
      for (const key of this.permissionKeys) {
        result[roleKey][key] = permission[key];
      }
    }

    return result;
  }

  // Helper method to get RoleType from string
  private getRoleType(roleKey: string): RoleType | null {
    switch (roleKey.toLowerCase()) {
      case 'owner':
        return RoleType.OWNER;
      case 'manager':
        return RoleType.MANAGER;
      case 'member':
        return RoleType.MEMBER;
      default:
        return null;
    }
  }
}
