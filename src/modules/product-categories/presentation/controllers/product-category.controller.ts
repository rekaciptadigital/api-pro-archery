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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductCategoryService } from '../../application/services/product-category.service';
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
  UpdateProductCategoryStatusDto,
} from '../../application/dtos/product-category.dto';
import { ProductCategoryQueryDto } from '../../application/dtos/product-category-query.dto';

@ApiTags('product-categories')
@Controller('product-categories')
export class ProductCategoryController {
  constructor(private readonly productCategoryService: ProductCategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create new product category' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product category created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Category code already exists',
  })
  create(@Body() createProductCategoryDto: CreateProductCategoryDto) {
    return this.productCategoryService.create(createProductCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product categories' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all categories' })
  findAll(@Query() query: ProductCategoryQueryDto) {
    return this.productCategoryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product category by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return category by id' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  @ApiParam({ name: 'id', type: 'number' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productCategoryService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product category' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product category updated successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Category code already exists',
  })
  @ApiParam({ name: 'id', type: 'number' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductCategoryDto: UpdateProductCategoryDto
  ) {
    return this.productCategoryService.update(id, updateProductCategoryDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update product category status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product category status updated successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  @ApiParam({ name: 'id', type: 'number' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateProductCategoryStatusDto
  ) {
    return this.productCategoryService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product category' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product category deleted successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  @ApiParam({ name: 'id', type: 'number' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productCategoryService.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore deleted product category' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product category restored successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Category is not deleted',
  })
  @ApiParam({ name: 'id', type: 'number' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.productCategoryService.restore(id);
  }
}