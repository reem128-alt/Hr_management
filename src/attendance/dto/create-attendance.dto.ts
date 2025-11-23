import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
} from "class-validator";
import { Expose } from "class-transformer";

export class CreateAttendanceDto {
  @ApiProperty({
    description: "Employee identifier",
    example: "cmi6e0x030003k4g64ihqobci",
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @ApiProperty({
    description: "Attendance date in ISO format",
    example: "2025-11-19T00:00:00.000Z",
  })
  @Expose()
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiPropertyOptional({
    description: "Check-in time in ISO format",
    example: "2025-11-19T09:00:00.000Z",
  })
  @Expose()
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @ApiPropertyOptional({
    description: "Check-out time in ISO format",
    example: "2025-11-19T18:00:00.000Z",
  })
  @Expose()
  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @ApiPropertyOptional({ description: "Total hours worked", example: 8 })
  @Expose()
  @IsOptional()
  @IsNumber()
  hours?: number;

  @ApiPropertyOptional({
    description: "Additional notes",
    example: "Regular working day",
  })
  @Expose()
  @IsOptional()
  @IsString()
  note?: string;
}
