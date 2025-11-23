import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsEnum,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Role } from "../../common/enums/role.enum";

export class CreateEmployeeDto {
  @ApiPropertyOptional({
    description: "Internal employee number",
    example: "EMP001",
  })
  @IsString()
  @IsOptional()
  employeeNumber?: string;

  @ApiProperty({ description: "Employee first name", example: "John" })
  @IsString()
  firstName: string;

  @ApiProperty({ description: "Employee last name", example: "Doe" })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: "Employee email",
    example: "john.doe@company.com",
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: "Employee phone number",
    example: "+1234567890",
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: "Hire date (ISO string)",
    example: "2024-01-15T00:00:00.000Z",
  })
  @IsDateString()
  @IsOptional()
  hireDate?: string;

  @ApiPropertyOptional({
    description: "Department identifier",
    example: "clx1234567890abcdef",
  })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({
    description: "Position identifier",
    example: "clx1234567890abcdef",
  })
  @IsString()
  @IsOptional()
  positionId?: string;

  @ApiPropertyOptional({
    description: "Salary rate",
    example: 50000,
  })
  @IsNumber()
  @IsOptional()
  rate?: number;

  @ApiPropertyOptional({
    description: "Whether employee is active",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    minLength: 6,
    description: "Temporary password",
    example: "TempPass123",
  })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    enum: Role,
    description: "User role",
    example: Role.EMPLOYEE,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
