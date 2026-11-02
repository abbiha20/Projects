import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Invitation } from '../entities/invitation.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindAllUsersDto } from './dto/getall-user.dto';
import { Permission } from '../entities/permission.entity';
import { Role, RoleType } from '../entities/role.entity';
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async updateVerifiedUser(
    email: string,
    phoneNumber: string,
    password: string,
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const invitation = await this.invitationRepository.findOne({
      where: { email, isVerified: false },
    });
    if (!invitation) {
      throw new BadRequestException('No valid invitation found for this email');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.phoneNumber = phoneNumber;
    user.password = hashedPassword;
    user.isVerified = true;

    await this.userRepository.save(user);

    invitation.isVerified = true;
    await this.invitationRepository.save(invitation);

    const { password: _, ...result } = user;
    return result;
  }

  async getAllUsers(queryParams: FindAllUsersDto): Promise<{
    data: Partial<User>[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { search, sortBy, sortOrder, page, limit } = queryParams;

      const query = this.userRepository.createQueryBuilder('user');

      if (search) {
        query.andWhere('(user.name LIKE :search OR user.role LIKE :search)', {
          search: `%${search}%`,
        });
      }

      const total = await query.getCount();

      query
        .orderBy(`user.${sortBy}`, sortOrder)
        .skip((page - 1) * limit)
        .take(limit);

      const users = await query.getMany();

      const usersWithVerification = await Promise.all(
        users.map(async (user) => {
          const { password, phoneNumber, ...userWithoutSensitiveInfo } = user;
          const invitation = await this.invitationRepository.findOne({
            where: { email: user.email },
          });
          return {
            ...userWithoutSensitiveInfo,
            isVerified: invitation ? invitation.isVerified : user.isVerified,
          };
        }),
      );

      return {
        data: usersWithVerification,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new BadRequestException('Error fetching users: ' + error.message);
    }
  }
  async getUnverifiedUsers(queryParams: FindAllUsersDto): Promise<{
    data: Partial<User>[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { search, sortBy, sortOrder, page, limit } = queryParams;

      const query = this.userRepository.createQueryBuilder('user');

      query
        .select([
          'user.id',
          'user.email',
          'user.name',
          'user.location',
          'user.isVerified',
          'user.phoneNumber',
          'user.role',
          'user.username',
          'user.deletedAt',
        ])
        .leftJoinAndSelect(
          'invitation',
          'invitation',
          'invitation.email = user.email',
        )
        .where(
          '(user.isVerified = :isVerified OR (invitation.isVerified = :isVerified AND invitation.isVerified IS NOT NULL))',
          { isVerified: false },
        );

      if (search) {
        query.andWhere('(user.name LIKE :search OR user.role LIKE :search)', {
          search: `%${search}%`,
        });
      }

      const total = await query.getCount();

      query
        .orderBy(`user.${sortBy}`, sortOrder)
        .skip((page - 1) * limit)
        .take(limit);

      const users = await query.getMany();

      const unverifiedUsers = users.map((user) => ({
        ...user,
        isVerified: false,
      }));

      return {
        data: unverifiedUsers,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching unverified users: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Error fetching unverified users');
    }
  }
  async getVerifiedUsers(queryParams: FindAllUsersDto): Promise<{
    data: Partial<User>[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { search, sortBy, sortOrder, page, limit } = queryParams;

      const query = this.userRepository.createQueryBuilder('user');

      query
        .select([
          'user.id',
          'user.email',
          'user.name',
          'user.location',
          'user.isVerified',
          'user.phoneNumber',
          'user.role',
          'user.username',
          'user.deletedAt',
        ])
        .leftJoinAndSelect(
          'invitation',
          'invitation',
          'invitation.email = user.email',
        )
        .where(
          '(user.isVerified = :isVerified OR (invitation.isVerified = :isVerified AND invitation.isVerified IS NOT NULL))',
          { isVerified: true },
        );

      if (search) {
        query.andWhere('(user.name LIKE :search OR user.role LIKE :search)', {
          search: `%${search}%`,
        });
      }

      const total = await query.getCount();

      query
        .orderBy(`user.${sortBy}`, sortOrder)
        .skip((page - 1) * limit)
        .take(limit);

      const users = await query.getMany();

      const unverifiedUsers = users.map((user) => ({
        ...user,
        isVerified: true,
      }));

      return {
        data: unverifiedUsers,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching unverified users: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Error fetching unverified users');
    }
  }
  async updateUserNotifications(
    id: string,
    notificationSettings: any,
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, notificationSettings);

    await this.userRepository.save(user);

    const { password, ...result } = user;
    return result;
  }

  async updateUserByOwner(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);

    await this.userRepository.save(user);

    const { password, ...result } = user;
    return result;
  }

  async softDeleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.softRemove(user);
  }
  async getUserByIdWithPermissions(id: string, role: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'name',
        'location',
        'isVerified',
        'phoneNumber',
        'role',
        'username',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    let permissions;

    if (role.toLowerCase() === 'admin') {
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
      switch (role.toLowerCase()) {
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
      const roleEntity = await this.roleRepository.findOne({
        where: { type: roleType },
      });

      if (!roleEntity) {
        throw new UnauthorizedException('Role not found');
      }

      // Fetch permissions for the role
      const permissionEntity = await this.permissionRepository.findOne({
        where: { role: { id: roleEntity.id } },
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
      ...user,
      permissions: {
        [role]: permissions,
      },
    };
  }
}
