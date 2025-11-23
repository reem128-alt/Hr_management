import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import * as bcrypt from "bcrypt";
import { EmployeeQueryDto } from "./dto/employee-query.dto";
import { PaginatedResult } from "../common/interfaces/paginated-result.interface";
import {
  buildPaginationMeta,
  getPaginationParams,
  resolveOrderBy,
} from "../common/utils/pagination.util";

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const { password, role, ...employeeData } = createEmployeeDto;

    // Check if email already exists
    const existingEmployee = await this.prisma.employee.findUnique({
      where: { email: employeeData.email },
    });

    if (existingEmployee) {
      throw new ConflictException("Employee with this email already exists");
    }

    // Check if employee number already exists
    if (employeeData.employeeNumber) {
      const existingNumber = await this.prisma.employee.findUnique({
        where: { employeeNumber: employeeData.employeeNumber },
      });

      if (existingNumber) {
        throw new ConflictException("Employee number already exists");
      }
    }

    // Create user if password is provided
    let userId: string | undefined;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.prisma.user.create({
        data: {
          email: employeeData.email,
          password: hashedPassword,
          role: role || "EMPLOYEE",
        },
      });
      userId = user.id;
    }

    return this.prisma.employee.create({
      data: {
        ...employeeData,
        userId,
        hireDate: employeeData.hireDate
          ? new Date(employeeData.hireDate)
          : undefined,
      },
      include: {
        department: true,
        position: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findAll(query: EmployeeQueryDto): Promise<PaginatedResult<any>> {
    const { search, departmentId, positionId, isActive, role } = query;
    const { page, limit, skip } = getPaginationParams(query);

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { employeeNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (positionId) {
      where.positionId = positionId;
    }

    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    }

    if (role) {
      where.user = {
        is: {
          role,
        },
      };
    }

    const orderBy = resolveOrderBy(
      query.sortBy,
      query.sortOrder,
      ["firstName", "lastName", "employeeNumber", "createdAt"],
      "createdAt"
    );

    const include = {
      department: true,
      position: true,
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        include,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto & { password?: string }
  ) {
    const { password, ...employeeData } = updateEmployeeDto;

    const employee = await this.findOne(id);

    // Update password if provided
    if (password && employee.userId) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.prisma.user.update({
        where: { id: employee.userId },
        data: { password: hashedPassword },
      });
    }

    return this.prisma.employee.update({
      where: { id },
      data: {
        ...employeeData,
        hireDate: employeeData.hireDate
          ? new Date(employeeData.hireDate)
          : undefined,
      },
      include: {
        department: true,
        position: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (employee?.userId) {
      await this.prisma.user.delete({
        where: { id: employee.userId },
      });
    }

    return this.prisma.employee.delete({
      where: { id },
    });
  }
}
