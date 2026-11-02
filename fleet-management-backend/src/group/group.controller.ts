import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpStatus,
  InternalServerErrorException,
  HttpCode,
  Req,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupMessageService } from './group-message.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Controller('groups')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private groupMessageService: GroupMessageService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createGroupDto: CreateGroupDto) {
    try {
      const group = await this.groupService.create(createGroupDto);
      return {
        status: 'success',
        message: 'Group created successfully',
        data: group,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Get()
  async findAll() {
    try {
      const groups = await this.groupService.findAll();
      return {
        status: 'success',
        data: groups,
      };
    } catch (error) {
      console.error('Error retrieving groups:', error);
      throw new InternalServerErrorException('Failed to retrieve groups');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const group = await this.groupService.findOne(id);
      return {
        status: 'success',
        data: group,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    try {
      const updatedGroup = await this.groupService.update(id, updateGroupDto);
      return {
        status: 'success',
        message: 'Group updated successfully',
        data: updatedGroup,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    try {
      await this.groupService.remove(id);
      return {
        status: 'success',
        message: 'Group deleted successfully',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Post('message/:groupId')
  async sendMessage(
    @Param('groupId') groupId: string,
    @Body() messageData: { content: string; fileURLs?: string[] },
    @Req() req: any,
  ) {
    const senderId = req.user['userId'];
    const userRole = req.user['role'];
    return this.groupMessageService.sendMessageToGroup(
      groupId,
      messageData.content,
      senderId,
      messageData.fileURLs,
      userRole,
    );
  }

  @Get('message/:groupId')
  async getGroupMessages(@Param('groupId') groupId: string) {
    return this.groupMessageService.getGroupMessages(groupId);
  }
}
