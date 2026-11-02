import { IsBoolean, IsOptional } from 'class-validator';

export class CreateUpdatePermissionDto {
  @IsBoolean()
  @IsOptional()
  conversationAssignedToOthers?: boolean;

  @IsBoolean()
  @IsOptional()
  unassignedConversations?: boolean;

  @IsBoolean()
  @IsOptional()
  updateRolePermissions?: boolean;

  @IsBoolean()
  @IsOptional()
  accessMessageFeed?: boolean;

  @IsBoolean()
  @IsOptional()
  accessContacts?: boolean;
  //e
  @IsBoolean()
  @IsOptional()
  accessManualCampaigns?: boolean;

  @IsBoolean()
  @IsOptional()
  accessAutomatedCampaigns?: boolean;

  @IsBoolean()
  @IsOptional()
  editDeleteAndCreateTemplates?: boolean;

  @IsBoolean()
  @IsOptional()
  editDeleteAndCreateContactProperties?: boolean;
}
