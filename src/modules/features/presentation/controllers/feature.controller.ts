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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeatureService } from '../../application/services/feature.service';
import {
  CreateFeatureDto,
  UpdateFeatureDto,
  UpdateFeatureStatusDto,
} from '../../application/dtos/feature.dto';
import { PaginationQueryDto } from '../../../../common/pagination/dto/pagination-query.dto';

@ApiTags('features')
@Controller('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post()
  @ApiOperation({ summary: 'Create feature' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Feature created successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request.' })
  create(@Body() createFeatureDto: CreateFeatureDto) {
    return this.featureService.create(createFeatureDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all features' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all features.' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.featureService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feature by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return feature by id.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Feature not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.featureService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update feature' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Feature updated successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Feature not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFeatureDto: UpdateFeatureDto,
  ) {
    return this.featureService.update(id, updateFeatureDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update feature status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Feature status updated successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Feature not found.' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateFeatureStatusDto,
  ) {
    return this.featureService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete feature' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Feature deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Feature not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.featureService.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore deleted feature' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Feature restored successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Feature not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Feature is not deleted.' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.featureService.restore(id);
  }
}