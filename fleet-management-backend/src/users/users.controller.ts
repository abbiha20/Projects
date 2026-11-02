import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  NotFoundException,
  Query,
  Req,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { UserService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request } from 'express';
import { FindAllUsersDto } from './dto/getall-user.dto';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Public()
  @Put('update')
  async updateUser(@Body() updateUserDto: UpdateUserDto) {
    const password = updateUserDto.password || '12345';

    try {
      const result = await this.userService.updateVerifiedUser(
        updateUserDto.email,
        updateUserDto.phoneNumber,
        password,
      );
      return { message: 'User updated successfully', user: result };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error updating user: ' + error.message);
    }
  }

  @Get()
  @Roles('owner', 'admin')
  async getAllUsers(
    @Query() queryParams: FindAllUsersDto,
    @Req() req: Request,
  ) {
    const userRole = req.user['role'];
    const result = await this.userService.getAllUsers(queryParams);

    if (userRole === 'admin') {
      result.data = result.data.map((user) => {
        const { ...userWithoutSensitiveInfo } = user;
        return userWithoutSensitiveInfo;
      });
    }
    //hee
    return result;
  }
  // Controller
  @Get('unverified')
  @Roles('owner', 'admin')
  async getUnverifiedUsers(
    @Query() queryParams: FindAllUsersDto,
    @Req() req: Request,
  ) {
    try {
      const userRole = req.user['role'];
      const result = await this.userService.getUnverifiedUsers(queryParams);

      if (userRole === 'admin') {
        result.data = result.data.map((user) => {
          const { ...userWithoutSensitiveInfo } = user;
          return userWithoutSensitiveInfo;
        });
      }

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while fetching unverified users',
      );
    }
  }
  @Post('verified-users')
  @Roles('owner', 'admin')
  async getVerifiedUsers(
    @Query() queryParams: FindAllUsersDto,
    @Req() req: Request,
  ) {
    try {
      const userRole = req.user['role'];
      const result = await this.userService.getVerifiedUsers(queryParams);

      if (userRole === 'admin') {
        result.data = result.data.map((user) => {
          const { ...userWithoutSensitiveInfo } = user;
          return userWithoutSensitiveInfo;
        });
      }

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while fetching unverified users',
      );
    }
  }
  @Put(':id/notifications')
  @Roles('owner', 'admin', 'manager')
  async updateUserNotifications(
    @Param('id') id: string,
    @Body() notificationSettings: any,
    @Req() req: Request,
  ) {
    const userRole = req.user['role'];
    const userId = req.user['id'];

    try {
      if (userRole === 'manager' && id !== userId) {
        throw new BadRequestException(
          'You can only update your own notification settings',
        );
      }

      const updatedUser = await this.userService.updateUserNotifications(
        id,
        notificationSettings,
      );
      return {
        message: 'User notification settings updated successfully',
        user: updatedUser,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Error updating user notifications: ' + error.message,
      );
    }
  }

  @Put(':id')
  @Roles('owner', 'admin')
  async updateUserByOwner(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const userRole = req.user['role'];

    if (updateUserDto.password) {
      throw new BadRequestException(
        'Password cannot be updated through this endpoint',
      );
    }

    try {
      let updatedUser;
      if (userRole === 'admin') {
        const { ...allowedUpdates } = updateUserDto;
        updatedUser = await this.userService.updateUserByOwner(
          id,
          allowedUpdates,
        );
      } else {
        updatedUser = await this.userService.updateUserByOwner(
          id,
          updateUserDto,
        );
      }
      return { message: 'User updated successfully', user: updatedUser };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error updating user: ' + error.message);
    }
  }

  @Delete(':id')
  @Roles('owner')
  async softDeleteUser(@Param('id') id: string) {
    try {
      await this.userService.softDeleteUser(id);
      return { message: 'User soft deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Error soft deleting user: ' + error.message,
      );
    }
  }
  @Get('me')
  async getProfile(@Req() req: Request) {
    const userId = req.user['userId'];
    const userRole = req.user['role'];
    const userWithPermissions =
      await this.userService.getUserByIdWithPermissions(userId, userRole);
    return userWithPermissions;
  }
}
