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
import { VariantService } from '../../application/services/variant.service';
import {
  CreateVariantDto,
  UpdateVariantDto,
  UpdateVariantStatusDto,
} from '../../application/dtos/variant.dto';
import { VariantQueryDto } from '../../application/dtos/variant-query.dto';

@ApiTags('variants')
@Controller('variants')
export class VariantController {
  constructor(private readonly variantService: VariantService) {}

  @Post()
  @ApiOperation({ summary: 'Create new variant' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Variant created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input',
  })
  create(@Body() createVariantDto: CreateVariantDto) {
    return this.variantService.create(createVariantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all variants' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all variants' })
  findAll(@Query() query: VariantQueryDto) {
    return this.variantService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get variant by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return variant by id' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Variant not found' })
  @ApiParam({ name: 'id', type: 'number' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.variantService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update variant' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Variant updated successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Variant not found' })
  @ApiParam({ name: 'id', type: 'number' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVariantDto: UpdateVariantDto
  ) {
    return this.variantService.update(id, updateVariantDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update variant status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Variant status updated successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Variant not found' })
  @ApiParam({ name: 'id', type: 'number' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateVariantStatusDto
  ) {
    return this.variantService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete variant' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Variant deleted successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Variant not found' })
  @ApiParam({ name: 'id', type: 'number' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.variantService.remove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted variant' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Variant restored successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Variant not found' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Variant is not deleted',
  })
  @ApiParam({ name: 'id', type: 'number' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.variantService.restore(id);
  }
}