import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UserService } from "../../application/services/user.service";
import { CreateUserDto, UpdateUserDto } from "../../application/dtos/user.dto";

@ApiTags("users")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: "Create user" })
  @ApiResponse({ status: 201, description: "User created successfully." })
  @ApiResponse({ status: 400, description: "Bad request." })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, description: "Return all users." })
  findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by id" })
  @ApiResponse({ status: 200, description: "Return user by id." })
  @ApiResponse({ status: 404, description: "User not found." })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update user" })
  @ApiResponse({ status: 200, description: "User updated successfully." })
  @ApiResponse({ status: 404, description: "User not found." })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete user" })
  @ApiResponse({ status: 200, description: "User deleted successfully." })
  @ApiResponse({ status: 404, description: "User not found." })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
