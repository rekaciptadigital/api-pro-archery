import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeatureService } from '../../application/services/feature.service';
import {
  CreateFeatureDto,
  UpdateFeatureDto,
  UpdateFeatureStatusDto,
} from '../../application/dtos/feature.dto';

@ApiTags('features')
@Controller('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post()
  @ApiOperation({ summary: 'Create feature' })
  @ApiResponse({ status: 201, description: 'Feature created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() createFeatureDto: CreateFeatureDto) {
    return this.featureService.create(createFeatureDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all features' })
  @ApiResponse({ status: 200, description: 'Return all features.' })
  findAll() {
    return this.featureService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feature by id' })
  @ApiResponse({ status: 200, description: 'Return feature by id.' })
  @ApiResponse({ status: 404, description: 'Feature not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.featureService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update feature' })
  @ApiResponse({ status: 200, description: 'Feature updated successfully.' })
  @ApiResponse({ status: 404, description: 'Feature not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFeatureDto: UpdateFeatureDto,
  ) {
    return this.featureService.update(id, updateFeatureDto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update feature status' })
  @ApiResponse({ status: 200, description: 'Feature status updated successfully.' })
  @ApiResponse({ status: 404, description: 'Feature not found.' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateFeatureStatusDto,
  ) {
    return this.featureService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete feature' })
  @ApiResponse({ status: 200, description: 'Feature deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Feature not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.featureService.remove(id);
  }
}