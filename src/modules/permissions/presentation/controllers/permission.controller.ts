import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PermissionService } from '../../application/services/permission.service';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  UpdatePermissionStatusDto,
} from '../../application/dtos/permission.dto';
import { PaginationQueryDto } from '../../../../common/pagination/dto/pagination-query.dto';

@ApiTags('role-feature-permissions')
@Controller('role-feature-permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all role feature permissions' })
  @ApiResponse({ status: 200, description: 'Return all role feature permissions.' })
  @ApiQuery({ type: PaginationQueryDto })
  findAll(@Query() query: PaginationQueryDto) {
    return this.permissionService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role feature permission by id' })
  @ApiResponse({ status: 200, description: 'Return role feature permission by id.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create role feature permission' })
  @ApiResponse({ status: 201, description: 'Role feature permission created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Role or Feature not found.' })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role feature permission' })
  @ApiResponse({ status: 200, description: 'Role feature permission updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Permission, Role, or Feature not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update role feature permission status' })
  @ApiResponse({ status: 200, description: 'Role feature permission status updated successfully.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdatePermissionStatusDto,
  ) {
    return this.permissionService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role feature permission' })
  @ApiResponse({ status: 200, description: 'Role feature permission deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.remove(id);
  }
}