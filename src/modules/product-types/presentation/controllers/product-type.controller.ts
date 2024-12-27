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
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductTypeService } from '../../application/services/product-type.service';
import { CreateProductTypeDto } from '../../application/dtos/create-product-type.dto';
import { UpdateProductTypeDto } from '../../application/dtos/update-product-type.dto';
import { ProductTypeQueryDto } from '../../application/dtos/product-type-query.dto';

@ApiTags('product-types')
@Controller('product-types')
export class ProductTypeController {
  constructor(private readonly productTypeService: ProductTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create new product type' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product type created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Product type code already exists',
  })
  create(@Body() createProductTypeDto: CreateProductTypeDto) {
    return this.productTypeService.create(createProductTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product types with pagination and filtering' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all product types' })
  findAll(@Query() query: ProductTypeQueryDto) {
    return this.productTypeService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product type by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return product type by id' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product type not found' })
  @ApiParam({ name: 'id', type: 'number' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productTypeService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product type' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product type updated successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product type not found' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Product type code already exists',
  })
  @ApiParam({ name: 'id', type: 'number' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductTypeDto: UpdateProductTypeDto
  ) {
    return this.productTypeService.update(id, updateProductTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product type' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product type deleted successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product type not found' })
  @ApiParam({ name: 'id', type: 'number' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productTypeService.remove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted product type' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product type restored successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product type not found' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Product type is not deleted',
  })
  @ApiParam({ name: 'id', type: 'number' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.productTypeService.restore(id);
  }
}