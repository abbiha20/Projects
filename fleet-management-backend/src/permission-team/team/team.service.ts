import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { GetAllTeamsDto } from '../dto/get-all-teams.dto';
import { Team } from '../../entities/team.entity';
import { User } from '../../entities/user.entity';
import { TeamMember } from '../../entities/team-memeber.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
  ) {}

  async createTeam(
    createTeamDto: CreateTeamDto,
    userId: string,
  ): Promise<Team> {
    const team = this.teamRepository.create({
      ...createTeamDto,
      createdBy: { id: userId },
    });
    return this.teamRepository.save(team);
  }

  async updateTeam(id: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const team = await this.teamRepository.findOne({ where: { id } });
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    Object.assign(team, updateTeamDto);
    return this.teamRepository.save(team);
  }

  async getAllTeams(
    queryParams: GetAllTeamsDto,
  ): Promise<{ data: Team[]; total: number; page: number; limit: number }> {
    const { search, sortBy, sortOrder, page, limit } = queryParams;

    const query = this.teamRepository.createQueryBuilder('team');

    if (search) {
      query.where('team.name LIKE :search', { search: `%${search}%` });
    }

    const total = await query.getCount();

    query
      .orderBy(`team.${sortBy || 'createdAt'}`, sortOrder || 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const teams = await query.getMany();

    return {
      data: teams,
      total,
      page,
      limit,
    };
  }
  async addMembersToTeam(teamId: string, memberIds: string[]): Promise<void> {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const users = await this.userRepository.findByIds(memberIds);
    if (users.length !== memberIds.length) {
      throw new NotFoundException('One or more users not found');
    }

    const newMembers = users.map((user) => {
      const teamMember = new TeamMember();
      teamMember.user = user;
      teamMember.team = team;
      teamMember.role = 'member';
      return teamMember;
    });

    await this.teamMemberRepository.save(newMembers);
  }
  async removeMembersFromTeam(teamId: string, memberIds: string[]) {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID "${teamId}" not found`);
    }

    // Ensure memberIds is an array
    if (!Array.isArray(memberIds)) {
      memberIds = [memberIds].filter(Boolean);
    }

    // Find the TeamMember entries
    const teamMembers = await this.teamMemberRepository.find({
      where: {
        team: { id: teamId },
        user: { id: In(memberIds) },
      },
      relations: ['user'],
    });

    if (teamMembers.length === 0) {
      return {
        success: false,
        message: 'No matching members found in the team',
        removedCount: 0,
        notFoundMembers: memberIds,
      };
    }

    // Perform the soft delete
    const result = await this.teamMemberRepository.softDelete(
      teamMembers.map((member) => member.id),
    );

    const removedMembers = teamMembers.map((member) => member.user.id);
    const notFoundMembers = memberIds.filter(
      (id) => !removedMembers.includes(id),
    );

    return {
      success: true,
      message: `${result.affected} members removed successfully`,
      removedCount: result.affected,
      removedMembers,
      notFoundMembers,
    };
  }

  async getTeamMembers(
    teamId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: 'username' | 'role';
      sortOrder?: 'ASC' | 'DESC';
      search?: string;
    },
  ): Promise<{
    members: TeamMember[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'username',
      sortOrder = 'DESC',
      search,
    } = options;

    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const queryBuilder = this.teamMemberRepository
      .createQueryBuilder('teamMember')
      .leftJoinAndSelect('teamMember.user', 'user')
      .where('teamMember.team.id = :teamId', { teamId });

    if (search) {
      queryBuilder.andWhere(
        '(user.username LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy(`user.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const members = await queryBuilder.getMany();

    return {
      members,
      total,
      page,
      limit,
    };
  }

  async deleteTeam(
    teamId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const team = await this.teamRepository.findOne({
        where: { id: teamId },
        relations: ['members'],
      });

      if (!team) {
        throw new NotFoundException(`Team with ID "${teamId}" not found`);
      }

      // Soft delete team members first
      if (team.members && team.members.length > 0) {
        await this.teamMemberRepository.softDelete({
          team: { id: teamId },
        });
      }

      // Soft delete the team
      await this.teamRepository.softDelete(teamId);

      return {
        success: true,
        message: 'Team and its members have been successfully deleted',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete team: ${error.message}`);
    }
  }
}
