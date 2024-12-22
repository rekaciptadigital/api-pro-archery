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
  HttpStatus,
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
  @ApiResponse({ status: HttpStatus.CREATED, description: "Role assigned to user successfully." })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad request." })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: "User already has this role." })
  create(@Body() createUserRoleDto: CreateUserRoleDto) {
    return this.userRoleService.create(createUserRoleDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all user roles" })
  @ApiResponse({ status: HttpStatus.OK, description: "Return all user roles." })
  findAll() {
    return this.userRoleService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user role by id" })
  @ApiResponse({ status: HttpStatus.OK, description: "Return user role by id." })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "User role not found." })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.userRoleService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update user role" })
  @ApiResponse({ status: HttpStatus.OK, description: "User role updated successfully." })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "User role not found." })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: "Role assignment already exists." })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto
  ) {
    return this.userRoleService.update(id, updateUserRoleDto);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update user role status" })
  @ApiResponse({ status: HttpStatus.OK, description: "User role status updated successfully." })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "User role not found." })
  updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateUserRoleStatusDto
  ) {
    return this.userRoleService.updateStatus(id, updateStatusDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete user role" })
  @ApiResponse({ status: HttpStatus.OK, description: "User role deleted successfully." })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "User role not found." })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.userRoleService.remove(id);
  }

  @Post(":id/restore")
  @ApiOperation({ summary: "Restore deleted user role" })
  @ApiResponse({ status: HttpStatus.OK, description: "User role restored successfully." })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "User role not found." })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "User role is not deleted." })
  restore(@Param("id", ParseIntPipe) id: number) {
    return this.userRoleService.restore(id);
  }
}