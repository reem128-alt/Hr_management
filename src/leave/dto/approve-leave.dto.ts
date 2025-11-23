import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { LeaveStatus } from "@prisma/client";

export class ApproveLeaveDto {
  @ApiProperty({ enum: LeaveStatus })
  @IsEnum(LeaveStatus)
  status: LeaveStatus;

  @ApiPropertyOptional({ description: "Approver user ID" })
  @IsString()
  @IsOptional()
  approverId?: string;
}

