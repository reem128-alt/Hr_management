import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class PositionQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: "Filter by position level" })
  @IsOptional()
  @IsString()
  level?: string;
}
