// src/contacts/custom-property.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CustomPropertyService } from './custom-property.service';
import { CreateCustomPropertyDefinitionDto } from './customDto/create-custom-property-definition.dto';
import { UpdateCustomPropertyDefinitionDto } from './customDto/update-custom-property-definition.dto';
import { AddCustomPropertyDto } from './customDto/add-custom-property.dto';
import { UpdateCustomPropertyDto } from './customDto/update-custom-property.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
@Controller('custom-properties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomPropertyController {
  constructor(private readonly customPropertyService: CustomPropertyService) {}

  @Post('definition')
  @Roles('owner', 'admin') // Allow both owner and admin
  createPropertyDefinition(
    @Body() createDto: CreateCustomPropertyDefinitionDto,
  ) {
    return this.customPropertyService.createPropertyDefinition(createDto);
  }

  @Get('definition')
  @Roles('member') // Accessible to all roles (member and above)
  getAllPropertyDefinitions() {
    return this.customPropertyService.getAllPropertyDefinitions();
  }

  @Get('definition/:id')
  @Roles('member') // Accessible to all roles (member and above)
  getPropertyDefinition(@Param('id') id: string) {
    return this.customPropertyService.getPropertyDefinition(id);
  }

  @Patch('definition/:id')
  @Roles('owner', 'admin') // Allow both owner and admin
  updatePropertyDefinition(
    @Param('id') id: string,
    @Body() updateDto: UpdateCustomPropertyDefinitionDto,
  ) {
    return this.customPropertyService.updatePropertyDefinition(id, updateDto);
  }

  @Delete('definition/:id')
  @Roles('owner', 'admin')
  async deletePropertyDefinition(@Param('id') id: string) {
    await this.customPropertyService.deletePropertyDefinition(id);
    return { message: 'Custom property definition soft deleted successfully' };
  }

  @Post()
  @Roles('manager')
  addCustomProperty(@Body() addDto: AddCustomPropertyDto) {
    return this.customPropertyService.addCustomProperty(addDto);
  }

  @Patch(':id')
  @Roles('manager')
  updateCustomProperty(
    @Param('id') id: string,
    @Body() updateDto: UpdateCustomPropertyDto,
  ) {
    return this.customPropertyService.updateCustomProperty(id, updateDto);
  }

  @Delete(':id')
  @Roles('manager') // Managers and above can delete custom properties
  deleteCustomProperty(@Param('id') id: string) {
    return this.customPropertyService.deleteCustomProperty(id);
  }

  @Get('contact/:contactId')
  @Roles('member') // Accessible to all roles (member and above)
  getCustomPropertiesForContact(@Param('contactId') contactId: string) {
    return this.customPropertyService.getCustomPropertiesForContact(contactId);
  }
}
