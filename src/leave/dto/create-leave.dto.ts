import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsDateString,
  IsInt,
  IsOptional,
  IsEnum,
} from "class-validator";
import { LeaveType } from "@prisma/client";

export class CreateLeaveDto {
  @ApiProperty({ description: "Employee identifier" })
  @IsString()
  employeeId: string;

  @ApiProperty({ enum: LeaveType , example: LeaveType.ANNUAL})
  @IsEnum(LeaveType)
  type: LeaveType;

  @ApiProperty({ description: "Leave start date", example: "2024-01-15T00:00:00.000Z" })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: "Leave end date", example: "2024-01-15T00:00:00.000Z" })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: "Number of leave days", example: 5 })
  @IsInt()
  days: number;

  @ApiPropertyOptional({ description: "Reason for leave", example: "I have a family emergency" })
  @IsString()
  @IsOptional()
  reason?: string;
}
