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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoleService } from '../../application/services/role.service';
import { CreateRoleDto, UpdateRoleDto, UpdateRoleStatusDto } from '../../application/dtos/role.dto';
import { PaginationQueryDto } from '../../../../common/pagination/dto/pagination-query.dto';

@ApiTags('roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: 'Create role' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Role created successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request.' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all roles.' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.roleService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return role by id.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Role updated successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update role status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Role status updated successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found.' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateRoleStatusDto,
  ) {
    return this.roleService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Role deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore deleted role' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Role restored successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Role is not deleted.' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.restore(id);
  }
}