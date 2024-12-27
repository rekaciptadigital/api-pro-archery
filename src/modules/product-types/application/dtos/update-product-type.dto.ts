import { IsString, IsBoolean, IsOptional, IsNotEmpty } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateProductTypeDto {
  @ApiPropertyOptional({ description: "Product type name" })
  @IsNotEmpty({ message: "Name cannot be empty when provided" })
  @IsString({ message: "Name must be a string" })
  name?: string;

  @ApiPropertyOptional({ description: "Product type code" })
  @IsNotEmpty({ message: "Code cannot be empty when provided" })
  @IsString({ message: "Code must be a string" })
  code?: string;

  @ApiPropertyOptional({ description: "Product type description" })
  @IsOptional()
  @IsString({ message: "Description must be a string" })
  description?: string;

  @ApiPropertyOptional({ description: "Product type status" })
  @IsNotEmpty({ message: "Status cannot be empty when provided" })
  @IsBoolean({ message: "Status must be a boolean" })
  status?: boolean;
}
