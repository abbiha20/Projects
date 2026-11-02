import {
  Injectable,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Permission } from '../entities/permission.entity';
import { Role, RoleType } from '../entities/role.entity';
import { Business } from '../entities/business.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (user && (await bcrypt.compare(password, user.password))) {
        const { ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      console.error('User validation error:', error);
      throw new InternalServerErrorException(
        'An error occurred during user validation',
      );
    }
  }

  async login(user: any) {
    try {
      const payload = { email: user.email, sub: user.id, role: user.role };
      console.log(payload);

      // Fetch user without relations
      const fullUser = await this.userRepository.findOne({
        where: { id: user.id },
      });

      if (!fullUser) {
        throw new UnauthorizedException('User not found');
      }

      // Remove sensitive information
      const { password, ...userWithoutPassword } = fullUser;

      let permissions;

      if (payload.role.toLowerCase() === 'admin') {
        // Set all permissions to true for admin
        permissions = {
          conversationAssignedToOthers: true,
          unassignedConversations: true,
          updateRolePermissions: true,
          accessMessageFeed: true,
          accessContacts: true,
          accessManualCampaigns: true,
          accessAutomatedCampaigns: true,
          editDeleteAndCreateTemplates: true,
          editDeleteAndCreateContactProperties: true,
        };
      } else {
        // For other roles (owner, manager, member)
        let roleType: RoleType;
        switch (payload.role.toLowerCase()) {
          case 'owner':
            roleType = RoleType.OWNER;
            break;
          case 'manager':
            roleType = RoleType.MANAGER;
            break;
          case 'member':
            roleType = RoleType.MEMBER;
            break;
          default:
            throw new UnauthorizedException('Invalid role');
        }

        // Find the role that matches roleType
        const role = await this.roleRepository.findOne({
          where: { type: roleType },
        });

        if (!role) {
          throw new UnauthorizedException('Role not found');
        }

        // Fetch permissions for the role
        const permissionEntity = await this.permissionRepository.findOne({
          where: { role: { id: role.id } },
        });

        if (!permissionEntity) {
          throw new UnauthorizedException('Permissions not found');
        }

        permissions = {
          conversationAssignedToOthers:
            permissionEntity.conversationAssignedToOthers,
          unassignedConversations: permissionEntity.unassignedConversations,
          updateRolePermissions: permissionEntity.updateRolePermissions,
          accessMessageFeed: permissionEntity.accessMessageFeed,
          accessContacts: permissionEntity.accessContacts,
          accessManualCampaigns: permissionEntity.accessManualCampaigns,
          accessAutomatedCampaigns: permissionEntity.accessAutomatedCampaigns,
          editDeleteAndCreateTemplates:
            permissionEntity.editDeleteAndCreateTemplates,
          editDeleteAndCreateContactProperties:
            permissionEntity.editDeleteAndCreateContactProperties,
        };
      }

      return {
        access_token: this.jwtService.sign(payload),
        user: userWithoutPassword,
        permissions: {
          [payload.role]: permissions,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new InternalServerErrorException('An error occurred during login');
    }
  }

  async register(
    email: string,
    password: string,
    name: string,
    role: 'owner' | 'member',
    username: string,
  ) {
    try {
      if (!email || !password || !name || !role || !username) {
        throw new BadRequestException('All fields are required');
      }

      const existingUser = await this.userRepository.findOne({
        where: [{ email }, { username }],
      });
      if (existingUser) {
        throw new ConflictException('Email or username already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        name,
        role,
        username,
      });

      const savedUser = await this.userRepository.save(user);
      console.log('Saved user:', savedUser);
      const { password: _, ...result } = savedUser;
      return this.login(result);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Error during registration:', error);
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async registerAdmin(
    email: string,
    password: string,
    name: string,
    username: string,
  ): Promise<User> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        name,
        username,
        role: 'admin',
        isVerified: true,
        location: '',
      });

      await this.userRepository.save(user);

      const permissions = this.permissionRepository.create({
        user,
        conversationAssignedToOthers: true,
        unassignedConversations: true,
        updateRolePermissions: true,
        accessMessageFeed: true,
        accessContacts: true,
        accessManualCampaigns: true,
        accessAutomatedCampaigns: true,
        editDeleteAndCreateTemplates: true,
        editDeleteAndCreateContactProperties: true,
      });

      await this.permissionRepository.save(permissions);

      // Create a new Business entity
      const business = this.businessRepository.create({
        businessName: username,
        adminId: user.id,
      });

      await this.businessRepository.save(business);

      return user;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error during admin registration:', error);
      throw new InternalServerErrorException('Error creating admin user');
    }
  }
}
