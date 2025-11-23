import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsEnum } from "class-validator";

export enum NotificationType {
  LEAVE_APPROVED = "LEAVE_APPROVED",
  LEAVE_REJECTED = "LEAVE_REJECTED",
  LEAVE_PENDING = "LEAVE_PENDING",
  PAYROLL_GENERATED = "PAYROLL_GENERATED",
  ATTENDANCE_REMINDER = "ATTENDANCE_REMINDER",
  GENERAL = "GENERAL",
}

export class CreateNotificationDto {
  @ApiProperty({ description: "Recipient user ID" })
  @IsString()
  userId: string;

  @ApiProperty({ description: "Notification title" })
  @IsString()
  title: string;

  @ApiProperty({ description: "Notification message body" })
  @IsString()
  message: string;

  @ApiPropertyOptional({ enum: NotificationType, description: "Type of notification" })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType | string;

  @ApiPropertyOptional({ description: "Link to related resource" })
  @IsString()
  @IsOptional()
  link?: string;
}

