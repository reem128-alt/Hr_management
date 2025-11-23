import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class CreatePositionDto {
  @ApiProperty({ description: "Position title", example: "Software Engineer" })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: "Seniority level" })
  @IsString()
  @IsOptional()
  level?: string;
}
