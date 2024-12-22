import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiEndpointService } from '../../application/services/api-endpoint.service';
import { CreateApiEndpointDto, UpdateApiEndpointDto } from '../../application/dtos/api-endpoint.dto';

@ApiTags('api-endpoints')
@Controller('api-endpoints')
export class ApiEndpointController {
  constructor(private readonly apiEndpointService: ApiEndpointService) {}

  @Post()
  @ApiOperation({ summary: 'Create API endpoint' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'API endpoint created successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'API endpoint already exists.' })
  create(@Body() createApiEndpointDto: CreateApiEndpointDto) {
    return this.apiEndpointService.create(createApiEndpointDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all API endpoints' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all API endpoints.' })
  findAll() {
    return this.apiEndpointService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get API endpoint by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return API endpoint by id.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'API endpoint not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.apiEndpointService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update API endpoint' })
  @ApiResponse({ status: HttpStatus.OK, description: 'API endpoint updated successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'API endpoint not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'API endpoint already exists.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateApiEndpointDto: UpdateApiEndpointDto,
  ) {
    return this.apiEndpointService.update(id, updateApiEndpointDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete API endpoint' })
  @ApiResponse({ status: HttpStatus.OK, description: 'API endpoint deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'API endpoint not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.apiEndpointService.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore deleted API endpoint' })
  @ApiResponse({ status: HttpStatus.OK, description: 'API endpoint restored successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'API endpoint not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'API endpoint is not deleted.' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.apiEndpointService.restore(id);
  }
}