import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsDateString, IsNumber, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreatePayrollItemDto {
  @ApiProperty({ description: "Description of payroll item" })
  @IsString()
  label: string;

  @ApiProperty({ description: "Item amount" })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: "Item type (ALLOWANCE, DEDUCTION, OVERTIME)" ,
    
  })
  @IsString()
  type: string;
}

export class CreatePayrollDto {
  @ApiProperty({ description: "Employee identifier" })
  @IsString()
  employeeId: string;

  @ApiProperty({ description: "Payroll period start date" })
  @IsDateString()
  periodStart: string;

  @ApiProperty({ description: "Payroll period end date" })
  @IsDateString()
  periodEnd: string;

  @ApiProperty({ description: "Gross salary amount" })
  @IsNumber()
  grossSalary: number;

  @ApiProperty({ description: "Net salary amount" })
  @IsNumber()
  netSalary: number;

  @ApiProperty({
    description: "Breakdown of payroll items",
    type: [CreatePayrollItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePayrollItemDto)
  items: CreatePayrollItemDto[];
}

