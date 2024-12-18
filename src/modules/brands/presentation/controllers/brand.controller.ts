import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { BrandQueryDto } from "../../application/dtos/brand-query.dto";
import {
  CreateBrandDto,
  UpdateBrandDto,
  UpdateBrandStatusDto,
} from "../../application/dtos/brand.dto";
import { BrandService } from "../../application/services/brand.service";

@ApiTags("brands")
@Controller("brands")
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @ApiOperation({ summary: "Create new brand" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Brand created successfully",
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: "Invalid input or code format" 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: "Brand code already exists" 
  })
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandService.create(createBrandDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all brands" })
  @ApiResponse({ status: HttpStatus.OK, description: "Return all brands" })
  findAll(@Query() query: BrandQueryDto) {
    return this.brandService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get brand by ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "Return brand by id" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Brand not found" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.brandService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update brand" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Brand updated successfully",
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Brand not found" })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: "Brand code already exists" 
  })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateBrandDto: UpdateBrandDto
  ) {
    return this.brandService.update(id, updateBrandDto);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update brand status" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Brand status updated successfully",
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Brand not found" })
  updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateBrandStatusDto
  ) {
    return this.brandService.updateStatus(id, updateStatusDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete brand" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Brand deleted successfully",
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Brand not found" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.brandService.remove(id);
  }

  @Post(":id/restore")
  @ApiOperation({ summary: "Restore deleted brand" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Brand restored successfully",
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Brand not found" })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: "Brand is not deleted" 
  })
  restore(@Param("id", ParseIntPipe) id: number) {
    return this.brandService.restore(id);
  }
}