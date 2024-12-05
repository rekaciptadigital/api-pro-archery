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
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UserRoleService } from "../../application/services/user-role.service";
import {
  CreateUserRoleDto,
  UpdateUserRoleDto,
  UpdateUserRoleStatusDto,
} from "../../application/dtos/user-role.dto";

@ApiTags("user-roles")
@Controller("user-roles")
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Post()
  @ApiOperation({ summary: "Create user role" })
  @ApiResponse({ status: 201, description: "Role assigned to user successfully." })
  @ApiResponse({ status: 400, description: "Bad request." })
  create(@Body() createUserRoleDto: CreateUserRoleDto) {
    return this.userRoleService.create(createUserRoleDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all user roles" })
  @ApiResponse({ status: 200, description: "Return all user roles." })
  findAll() {
    return this.userRoleService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user role by id" })
  @ApiResponse({ status: 200, description: "Return user role by id." })
  @ApiResponse({ status: 404, description: "User role not found." })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.userRoleService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update user role" })
  @ApiResponse({ status: 200, description: "User role updated successfully." })
  @ApiResponse({ status: 404, description: "User role not found." })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto
  ) {
    return this.userRoleService.update(id, updateUserRoleDto);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update user role status" })
  @ApiResponse({ status: 200, description: "User role status updated successfully." })
  @ApiResponse({ status: 404, description: "User role not found." })
  updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateUserRoleStatusDto
  ) {
    return this.userRoleService.updateStatus(id, updateStatusDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete user role" })
  @ApiResponse({ status: 200, description: "User role deleted successfully." })
  @ApiResponse({ status: 404, description: "User role not found." })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.userRoleService.remove(id);
  }
}