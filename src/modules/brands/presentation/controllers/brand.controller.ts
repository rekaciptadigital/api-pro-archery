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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BrandService } from '../../application/services/brand.service';
import { CreateBrandDto, UpdateBrandDto, UpdateBrandStatusDto } from '../../application/dtos/brand.dto';
import { BrandQueryDto } from '../../application/dtos/brand-query.dto';

@ApiTags('brands')
@Controller('brands')
@ApiBearerAuth()
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @ApiOperation({ summary: 'Create brand' })
  @ApiResponse({ status: 201, description: 'Brand created successfully.' })
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandService.create(createBrandDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all brands' })
  @ApiResponse({ status: 200, description: 'Return all brands.' })
  findAll(@Query() query: BrandQueryDto) {
    return this.brandService.findAll(query);
  }

  @Get('deleted')
  @ApiOperation({ summary: 'Get deleted brands' })
  @ApiResponse({ status: 200, description: 'Return deleted brands.' })
  findDeleted(@Query() query: BrandQueryDto) {
    return this.brandService.findDeleted(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brand by id' })
  @ApiResponse({ status: 200, description: 'Return brand by id.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update brand' })
  @ApiResponse({ status: 200, description: 'Brand updated successfully.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return this.brandService.update(id, updateBrandDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update brand status' })
  @ApiResponse({ status: 200, description: 'Brand status updated successfully.' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateBrandStatusDto,
  ) {
    return this.brandService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete brand' })
  @ApiResponse({ status: 200, description: 'Brand deleted successfully.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.remove(id);
  }
}