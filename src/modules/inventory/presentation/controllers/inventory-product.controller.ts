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
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { InventoryProductService } from "../../application/services/inventory-product.service";
import { CreateInventoryProductDto } from "../../application/dtos/create-inventory-product.dto";
import { UpdateInventoryProductDto } from "../../application/dtos/update-inventory-product.dto";
import { InventoryProductQueryDto } from "../../application/dtos/inventory-product-query.dto";

@ApiTags("inventory")
@Controller("inventory")
export class InventoryProductController {
  constructor(
    private readonly inventoryProductService: InventoryProductService
  ) {}

  @Post()
  @ApiOperation({ summary: "Create new inventory product" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Inventory product created successfully",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "SKU or unique code already exists",
  })
  create(@Body() createInventoryProductDto: CreateInventoryProductDto) {
    return this.inventoryProductService.create(createInventoryProductDto);
  }

  @Get()
  @ApiOperation({
    summary: "Get all inventory products with pagination and search",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Return all inventory products with status information",
  })
  findAll(@Query() query: InventoryProductQueryDto) {
    return this.inventoryProductService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get inventory product by ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Return inventory product with status information",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Inventory product not found",
  })
  @ApiParam({ name: "id", type: "number" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.inventoryProductService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update inventory product" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Inventory product updated successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Inventory product not found",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "SKU or unique code already exists",
  })
  @ApiParam({ name: "id", type: "number" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateInventoryProductDto: UpdateInventoryProductDto
  ) {
    return this.inventoryProductService.update(id, updateInventoryProductDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete inventory product" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Inventory product deleted successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Inventory product not found",
  })
  @ApiParam({ name: "id", type: "number" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.inventoryProductService.remove(id);
  }
}
