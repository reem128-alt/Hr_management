import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class DepartmentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: "Filter by department code" })
  @IsOptional()
  @IsString()
  code?: string;
}


