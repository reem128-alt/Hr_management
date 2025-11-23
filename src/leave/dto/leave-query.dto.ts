import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { LeaveStatus } from "@prisma/client";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class LeaveQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: "Filter by employee ID" })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({ enum: LeaveStatus, description: "Filter by leave status" })
  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;
}


