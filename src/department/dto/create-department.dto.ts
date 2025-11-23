import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class CreateDepartmentDto {
  @ApiProperty({ description: "Department name" })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: "Unique department code", example: "HR" })
  @IsString()
  @IsOptional()
  code?: string;
}
