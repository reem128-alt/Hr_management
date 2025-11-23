import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePayrollDto } from "./dto/create-payroll.dto";
import { UpdatePayrollDto } from "./dto/update-payroll.dto";
import { ItemType } from "@prisma/client";
import { PayrollQueryDto } from "./dto/payroll-query.dto";
import { PaginatedResult } from "../common/interfaces/paginated-result.interface";
import {
  buildPaginationMeta,
  getPaginationParams,
  resolveOrderBy,
} from "../common/utils/pagination.util";

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPayrollDto: CreatePayrollDto) {
    // Verify employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: createPayrollDto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${createPayrollDto.employeeId} not found`
      );
    }

    // Validate dates
    const periodStart = new Date(createPayrollDto.periodStart);
    const periodEnd = new Date(createPayrollDto.periodEnd);

    if (periodStart >= periodEnd) {
      throw new BadRequestException(
        "Period start date must be before period end date"
      );
    }

    // Calculate net salary from items if not provided
    let netSalary = createPayrollDto.netSalary;
    if (!netSalary && createPayrollDto.items) {
      netSalary = this.calculateNetSalary(
        createPayrollDto.grossSalary,
        createPayrollDto.items
      );
    }

    // Create payroll with items
    const payroll = await this.prisma.payroll.create({
      data: {
        employeeId: createPayrollDto.employeeId,
        periodStart,
        periodEnd,
        grossSalary: createPayrollDto.grossSalary,
        netSalary: netSalary || createPayrollDto.grossSalary,
        items: {
          create: createPayrollDto.items.map((item) => ({
            label: item.label,
            amount: item.amount,
            type: item.type as ItemType,
          })),
        },
      },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
        items: true,
      },
    });

    return payroll;
  }

  async findAll(query: PayrollQueryDto): Promise<PaginatedResult<any>> {
    const { page, limit, skip } = getPaginationParams(query);
    const filters: any[] = [];

    if (query.employeeId) {
      filters.push({ employeeId: query.employeeId });
    }

    if (query.startDate || query.endDate) {
      filters.push({
        periodStart: {
          ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
          ...(query.endDate ? { lte: new Date(query.endDate) } : {}),
        },
      });
    }

    if (query.search) {
      filters.push({
        OR: [
          {
            employee: {
              is: {
                firstName: { contains: query.search, mode: "insensitive" },
              },
            },
          },
          {
            employee: {
              is: { lastName: { contains: query.search, mode: "insensitive" } },
            },
          },
          {
            employee: {
              is: { email: { contains: query.search, mode: "insensitive" } },
            },
          },
          {
            items: {
              some: { label: { contains: query.search, mode: "insensitive" } },
            },
          },
        ],
      });
    }

    const where = filters.length ? { AND: filters } : {};

    const orderBy = resolveOrderBy(
      query.sortBy,
      query.sortOrder,
      ["periodStart", "periodEnd", "netSalary", "grossSalary"],
      "periodStart",
      "desc"
    );

    const include = {
      employee: {
        include: {
          department: true,
          position: true,
        },
      },
      items: true,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.payroll.findMany({
        where,
        include,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.payroll.count({ where }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async findOne(id: string) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
        items: true,
      },
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${id} not found`);
    }

    return payroll;
  }

  async update(id: string, updatePayrollDto: UpdatePayrollDto) {
    await this.findOne(id);

    // If items are being updated, delete old items and create new ones
    if (updatePayrollDto.items) {
      await this.prisma.payrollItem.deleteMany({
        where: { payrollId: id },
      });
    }

    // Calculate net salary if items are updated
    let netSalary = updatePayrollDto.netSalary;
    if (updatePayrollDto.items && updatePayrollDto.grossSalary) {
      netSalary = this.calculateNetSalary(
        updatePayrollDto.grossSalary,
        updatePayrollDto.items
      );
    }

    return this.prisma.payroll.update({
      where: { id },
      data: {
        periodStart: updatePayrollDto.periodStart
          ? new Date(updatePayrollDto.periodStart)
          : undefined,
        periodEnd: updatePayrollDto.periodEnd
          ? new Date(updatePayrollDto.periodEnd)
          : undefined,
        grossSalary: updatePayrollDto.grossSalary,
        netSalary,
        items: updatePayrollDto.items
          ? {
              create: updatePayrollDto.items.map((item) => ({
                label: item.label,
                amount: item.amount,
                type: item.type as ItemType,
              })),
            }
          : undefined,
      },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
        items: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Delete items first (cascade should handle this, but being explicit)
    await this.prisma.payrollItem.deleteMany({
      where: { payrollId: id },
    });

    return this.prisma.payroll.delete({
      where: { id },
    });
  }

  private calculateNetSalary(grossSalary: number, items: any[]): number {
    let netSalary = grossSalary;

    for (const item of items) {
      if (item.type === "ALLOWANCE" || item.type === "OVERTIME") {
        netSalary += item.amount;
      } else if (item.type === "DEDUCTION") {
        netSalary -= item.amount;
      }
    }

    return netSalary;
  }
}
