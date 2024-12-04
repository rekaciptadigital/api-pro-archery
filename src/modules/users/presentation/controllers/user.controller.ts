import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UserService } from '../../application/services/user.service';
import { CreateUserDto, UpdateUserDto } from '../../application/dtos/user.dto';
import { UserQueryDto } from '../../application/dtos/user-query.dto';
import { UserResponseDto, PaginatedUserResponseDto } from '../../application/dtos/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved users',
    type: PaginatedUserResponseDto,
  })
  async findAll(@Query() query: UserQueryDto): Promise<PaginatedUserResponseDto> {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved user',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully created user',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully updated user',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Successfully deleted user' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.userService.remove(id);
  }
}