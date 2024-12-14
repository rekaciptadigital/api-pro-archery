import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BrandListService } from '../../application/services/brand-list.service';
import { BrandQueryDto } from '../../application/dtos/brand-query.dto';

@ApiTags('brands')
@Controller('brands')
export class BrandController {
  constructor(
    private readonly brandListService: BrandListService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all brands' })
  @ApiResponse({ status: 200, description: 'Return all brands.' })
  findAll(@Query() query: BrandQueryDto) {
    return this.brandListService.execute(query);
  }
}