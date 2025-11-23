import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PayrollService } from "./payroll.service";
import { CreatePayrollDto } from "./dto/create-payroll.dto";
import { UpdatePayrollDto } from "./dto/update-payroll.dto";
import { PayrollQueryDto } from "./dto/payroll-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../common/enums/role.enum";

@Controller("payrolls")
@UseGuards(JwtAuthGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  create(@Body() createPayrollDto: CreatePayrollDto) {
    return this.payrollService.create(createPayrollDto);
  }

  @Get()
  findAll(@Query() query: PayrollQueryDto) {
    return this.payrollService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.payrollService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  update(@Param("id") id: string, @Body() updatePayrollDto: UpdatePayrollDto) {
    return this.payrollService.update(id, updatePayrollDto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  remove(@Param("id") id: string) {
    return this.payrollService.remove(id);
  }
}
