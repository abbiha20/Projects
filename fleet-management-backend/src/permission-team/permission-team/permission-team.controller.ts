import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  BadRequestException,
  NotFoundException,
  Logger,
  HttpCode,
  HttpStatus,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TeamService } from '../team/team.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { Request } from 'express';
import { GetAllTeamsDto } from '../dto/get-all-teams.dto';
import { PermissionsService } from '../permission/permission.service';

@Controller('permission-team')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionTeamController {
  private readonly logger = new Logger(PermissionTeamController.name);

  constructor(
    private readonly teamService: TeamService,
    private readonly permissionService: PermissionsService,
  ) {}
  @Post()
  @Roles('admin', 'owner', 'manager', 'memeber')
  async createTeam(@Body() createTeamDto: CreateTeamDto, @Req() req: Request) {
    if (!req.user) {
      throw new BadRequestException('User not found in request');
    }

    const user = req.user as { userId: string; email: string; role: string };
    console.log(user);
    if (!user.userId) {
      throw new BadRequestException('User ID not found');
    }

    return this.teamService.createTeam(createTeamDto, user.userId);
  }

  @Put(':id')
  @Roles('admin', 'owner', 'manager', 'memeber')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      skipMissingProperties: true,
      forbidNonWhitelisted: true,
    }),
  )
  async updateTeam(
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    try {
      const filteredDto = Object.fromEntries(
        Object.entries(updateTeamDto).filter(([_, v]) => v !== undefined),
      );

      const updatedTeam = await this.teamService.updateTeam(id, filteredDto);
      return {
        success: true,
        message: 'Team updated successfully',
        data: updatedTeam,
      };
    } catch (error) {
      this.logger.error(`Error updating team: ${error.message}`);

      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to update team',
        error: 'Bad Request',
      });
    }
  }

  @Get()
  @Roles('admin', 'owner', 'manager', 'memeber')
  async getAllTeams(@Query() queryParams: GetAllTeamsDto) {
    return this.teamService.getAllTeams(queryParams);
  }

  @Post(':teamId/members')
  @Roles('admin', 'owner', 'manager', 'memeber')
  async addMembersToTeam(
    @Param('teamId') teamId: string,
    @Body() body: { members: string[] },
  ) {
    try {
      const { members } = body;
      if (!members || !Array.isArray(members)) {
        throw new BadRequestException('Invalid members array');
      }
      await this.teamService.addMembersToTeam(teamId, members);
      return { message: 'Members added successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error adding members: ' + error.message);
    }
  }
  @Delete(':teamId/members')
  @Roles('admin', 'owner', 'manager', 'memeber')
  @HttpCode(HttpStatus.OK)
  async removeMembersFromTeam(
    @Param('teamId') teamId: string,
    @Body() body: { members: string[] },
  ) {
    return await this.teamService.removeMembersFromTeam(teamId, body.members);
  }
  @Get(':teamId/members')
  @Roles('admin', 'owner', 'manager', 'memeber')
  async getTeamMembers(
    @Param('teamId') teamId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy: 'username' | 'role',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('search') search?: string,
  ) {
    try {
      const result = await this.teamService.getTeamMembers(teamId, {
        page,
        limit,
        sortBy,
        sortOrder,
        search,
      });
      return {
        success: true,
        ...result,
        members: result.members.map((member) => ({
          userId: member.user.id,
          username: member.user.username,
          email: member.user.email,
          role: member.role,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Error fetching team members: ' + error.message,
      );
    }
  }

  // @Get('user')
  // async getUserPermissions(@Req() req: AuthenticatedRequest) {
  //   if (!req.user || !req.user.userId) {
  //     throw new BadRequestException('User ID is missing');
  //   }
  //   return this.permissionService.getUserPermissions(req.user.userId);
  // }

  // @Get('role/:roleType')
  // async getRolePermissions(@Param('roleType') roleType: RoleType) {
  //   if (!Object.values(RoleType).includes(roleType)) {
  //     throw new BadRequestException('Invalid role type');
  //   }
  //   return this.permissionService.getPermissionsByRole(roleType);
  // }
  @Post('set')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async setPermissions(@Body() permissionsDto: any, @Req() req: Request) {
    const userId = req.user['userId'];
    await this.permissionService.setPermissions(permissionsDto, userId);
    return { message: 'Permissions updated successfully' };
  }

  @Get('get')
  async getPermissions(@Req() req: Request) {
    const userId = req.user['userId'];
    const permissions = await this.permissionService.getPermissions(userId);
    return permissions;
  }

  @Delete(':id')
  @Roles('admin', 'owner', 'manager', 'memeber')
  @HttpCode(HttpStatus.OK)
  async deleteTeam(@Param('id') id: string) {
    try {
      const result = await this.teamService.deleteTeam(id);
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      this.logger.error(`Error deleting team: ${error.message}`);

      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to delete team',
        error: 'Bad Request',
      });
    }
  }
}
