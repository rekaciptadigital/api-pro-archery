import {
  Controller,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PermissionService } from '../../application/services/permission.service';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  UpdatePermissionStatusDto,
} from '../../application/dtos/permission.dto';

@ApiTags('role-feature-permissions')
@Controller('role-feature-permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiOperation({ summary: 'Create role feature permission' })
  @ApiResponse({
    status: 201,
    description: 'Role feature permission assigned successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role feature permission' })
  @ApiResponse({
    status: 200,
    description: 'Role feature permission updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update role feature permission status' })
  @ApiResponse({
    status: 200,
    description: 'Role feature permission status updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdatePermissionStatusDto,
  ) {
    return this.permissionService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role feature permission' })
  @ApiResponse({
    status: 200,
    description: 'Role feature permission deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.remove(id);
  }
}