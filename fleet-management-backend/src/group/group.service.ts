import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Group } from '../entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { User } from '../entities/user.entity';
type GroupWithMembers = Group & { members: User[] };

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const existingGroup = await this.groupRepository.findOne({
      where: { name: createGroupDto.name },
    });
    if (existingGroup) {
      throw new ConflictException('A group with this name already exists');
    }

    const group = this.groupRepository.create({
      ...createGroupDto,
      messageIds: [],
    });
    return this.groupRepository.save(group);
  }

  async findAll(): Promise<GroupWithMembers[]> {
    const groups = await this.groupRepository.find();
    return Promise.all(
      groups.map(async (group) => {
        const members = await this.userRepository.find({
          where: { id: In(group.memberIds) },
          select: ['id', 'name', 'email', 'username', 'phoneNumber', 'role'],
        });
        return { ...group, members } as GroupWithMembers;
      }),
    );
  }

  // Update return type for findOne
  async findOne(id: string): Promise<GroupWithMembers> {
    const group = await this.groupRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException(`Group with ID "${id}" not found`);
    }

    const members = await this.userRepository.find({
      where: { id: In(group.memberIds) },
      select: ['id', 'name', 'email', 'username', 'phoneNumber', 'role'],
    });

    return { ...group, members } as GroupWithMembers;
  }
  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.findOne(id);

    if (updateGroupDto.name && updateGroupDto.name !== group.name) {
      const existingGroup = await this.groupRepository.findOne({
        where: { name: updateGroupDto.name },
      });
      if (existingGroup) {
        throw new ConflictException('A group with this name already exists');
      }
    }

    Object.assign(group, updateGroupDto);
    return this.groupRepository.save(group);
  }

  async remove(id: string): Promise<void> {
    const result = await this.groupRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Group with ID "${id}" not found`);
    }
  }
}
