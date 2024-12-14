import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BrandService } from '../../application/services/brand.service';
import { BrandQueryDto } from '../../application/dtos/brand-query.dto';
import { CreateBrandDto, UpdateBrandDto, UpdateBrandStatusDto } from '../../application/dtos/brand.dto';

@ApiTags('brands')
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @ApiOperation({ summary: 'Create new brand' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Brand created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandService.create(createBrandDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all brands' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all brands' })
  findAll(@Query() query: BrandQueryDto) {
    return this.brandService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brand by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return brand by id' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Brand not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update brand' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Brand updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Brand not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return this.brandService.update(id, updateBrandDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update brand status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Brand status updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Brand not found' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateBrandStatusDto,
  ) {
    return this.brandService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete brand' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Brand deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Brand not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.remove(id);
  }
}