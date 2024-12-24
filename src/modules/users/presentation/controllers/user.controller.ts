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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from '../../application/services/user.service';
import { CreateUserDto, UpdateUserDto } from '../../application/dtos/user.dto';
import { UpdateUserStatusDto } from '../../application/dtos/user-status.dto';
import { UserListQueryDto } from '../../application/dtos/user-list.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Successfully created user' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with sorting and searching' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully retrieved users' })
  findAll(@Query() query: UserListQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully retrieved user' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully updated user' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update user status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User status updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateUserStatusDto,
  ) {
    return this.userService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore deleted user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User restored successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'User is not deleted' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.userService.restore(id);
  }
}