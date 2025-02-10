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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InventoryLocationService } from '../../application/services/inventory-location.service';
import {
  CreateInventoryLocationDto,
  UpdateInventoryLocationDto,
} from '../../application/dtos/inventory-location.dto';
import { InventoryLocationQueryDto } from '../../application/dtos/inventory-location-query.dto';

@ApiTags('inventory-locations')
@Controller('inventory-locations')
export class InventoryLocationController {
  constructor(
    private readonly inventoryLocationService: InventoryLocationService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new inventory location' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Location created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Location code already exists',
  })
  create(@Body() createInventoryLocationDto: CreateInventoryLocationDto) {
    return this.inventoryLocationService.create(createInventoryLocationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory locations' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all locations' })
  findAll(@Query() query: InventoryLocationQueryDto) {
    return this.inventoryLocationService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory location by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return location by id' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Location not found',
  })
  @ApiParam({ name: 'id', type: 'number' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryLocationService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update inventory location' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Location updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Location not found',
  })
  @ApiParam({ name: 'id', type: 'number' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventoryLocationDto: UpdateInventoryLocationDto
  ) {
    return this.inventoryLocationService.update(id, updateInventoryLocationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete inventory location' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Location deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Location not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Location is linked to product stock',
  })
  @ApiParam({ name: 'id', type: 'number' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryLocationService.remove(id);
  }
}