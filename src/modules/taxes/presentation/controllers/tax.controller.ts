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
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { TaxService } from "../../application/services/tax.service";
import {
  CreateTaxDto,
  UpdateTaxDto,
  UpdateTaxStatusDto,
} from "../../application/dtos/tax.dto";
import { TaxQueryDto } from "../../application/dtos/tax-query.dto";

@ApiTags("taxes")
@Controller("taxes")
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Post()
  @ApiOperation({ summary: "Create new tax" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Tax created successfully",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input",
  })
  create(@Body() createTaxDto: CreateTaxDto) {
    return this.taxService.create(createTaxDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all taxes" })
  @ApiResponse({ status: HttpStatus.OK, description: "Return all taxes" })
  findAll(@Query() query: TaxQueryDto) {
    return this.taxService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get tax by ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "Return tax by id" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Tax not found" })
  @ApiParam({ name: "id", type: "number" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.taxService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update tax" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Tax updated successfully",
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Tax not found" })
  @ApiParam({ name: "id", type: "number" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateTaxDto: UpdateTaxDto
  ) {
    return this.taxService.update(id, updateTaxDto);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update tax status" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Tax status updated successfully",
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Tax not found" })
  @ApiParam({ name: "id", type: "number" })
  updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateTaxStatusDto
  ) {
    return this.taxService.updateStatus(id, updateStatusDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete tax" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Tax deleted successfully",
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Tax not found" })
  @ApiParam({ name: "id", type: "number" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.taxService.remove(id);
  }

  @Post(":id/restore")
  @ApiOperation({ summary: "Restore deleted tax" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Tax restored successfully",
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Tax not found" })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Tax is not deleted",
  })
  @ApiParam({ name: "id", type: "number" })
  restore(@Param("id", ParseIntPipe) id: number) {
    return this.taxService.restore(id);
  }
}
