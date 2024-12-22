import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MenuPermissionService } from '../../application/services/menu-permission.service';
import { CreateMenuPermissionDto, UpdateMenuPermissionDto } from '../../application/dtos/menu-permission.dto';

@ApiTags('menu-permissions')
@Controller('menu-permissions')
export class MenuPermissionController {
  constructor(private readonly menuPermissionService: MenuPermissionService) {}

  @Post()
  @ApiOperation({ summary: 'Create menu permission' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Menu permission created successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Menu permission already exists.' })
  create(@Body() createMenuPermissionDto: CreateMenuPermissionDto) {
    return this.menuPermissionService.create(createMenuPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menu permissions' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all menu permissions.' })
  findAll() {
    return this.menuPermissionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu permission by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return menu permission by id.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Menu permission not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuPermissionService.findOne(id);
  }

  @Get('role/:roleId')
  @ApiOperation({ summary: 'Get menu permissions by role' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return menu permissions for role.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found.' })
  findByRole(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.menuPermissionService.findByRole(roleId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update menu permission' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Menu permission updated successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Menu permission not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuPermissionDto: UpdateMenuPermissionDto,
  ) {
    return this.menuPermissionService.update(id, updateMenuPermissionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete menu permission' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Menu permission deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Menu permission not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuPermissionService.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore deleted menu permission' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Menu permission restored successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Menu permission not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Menu permission is not deleted.' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.menuPermissionService.restore(id);
  }
}