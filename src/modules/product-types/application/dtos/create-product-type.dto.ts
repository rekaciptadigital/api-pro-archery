import { IsString, IsBoolean, IsOptional, IsNotEmpty } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateProductTypeDto {
  @ApiProperty({ description: "Product type name" })
  @IsNotEmpty({ message: "Name is required" })
  @IsString({ message: "Name must be a string" })
  name: string;

  @ApiProperty({ description: "Product type code (unique)" })
  @IsNotEmpty({ message: "Code is required" })
  @IsString({ message: "Code must be a string" })
  code: string;

  @ApiPropertyOptional({ description: "Product type description" })
  @IsOptional()
  @IsString({ message: "Description must be a string" })
  description?: string;

  @ApiProperty({ description: "Product type status", default: true })
  @IsNotEmpty({ message: "Status is required" })
  @IsBoolean({ message: "Status must be a boolean" })
  status: boolean;
}
