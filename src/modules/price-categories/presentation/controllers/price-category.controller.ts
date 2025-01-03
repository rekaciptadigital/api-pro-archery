import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  ParseIntPipe,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PriceCategoryService } from '../../application/services/price-category.service';
import { BatchPriceCategoriesDto } from '../../application/dtos/price-category.dto';

@ApiTags('price-categories')
@Controller('price-categories')
export class PriceCategoryController {
  constructor(private readonly priceCategoryService: PriceCategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all price categories grouped by type' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return grouped price categories' })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(@Query('search') search?: string) {
    return this.priceCategoryService.findAll(search);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Batch create or update price categories' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Price categories processed successfully',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Duplicate entry' })
  batchProcess(@Body() batchDto: BatchPriceCategoriesDto) {
    return this.priceCategoryService.batchProcess(batchDto.data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete price category' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Price category deleted successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Price category not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.priceCategoryService.remove(id);
  }
}