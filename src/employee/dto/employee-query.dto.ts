import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { Role } from "../../common/enums/role.enum";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class EmployeeQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: "Filter employees by department ID" })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ description: "Filter employees by position ID" })
  @IsOptional()
  @IsString()
  positionId?: string;

  @ApiPropertyOptional({
    description: "Include only active/inactive employees",
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    return value === "true" || value === true;
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    enum: Role,
    description: "Filter by linked user role",
  })
  @IsOptional()
  role?: Role;
}
