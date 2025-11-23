import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLeaveDto } from "./dto/create-leave.dto";
import { UpdateLeaveDto } from "./dto/update-leave.dto";
import { ApproveLeaveDto } from "./dto/approve-leave.dto";
import { LeaveStatus } from "@prisma/client";
import { LeaveQueryDto } from "./dto/leave-query.dto";
import { PaginatedResult } from "../common/interfaces/paginated-result.interface";
import {
  buildPaginationMeta,
  getPaginationParams,
  resolveOrderBy,
} from "../common/utils/pagination.util";

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLeaveDto: CreateLeaveDto) {
    // Verify employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: createLeaveDto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${createLeaveDto.employeeId} not found`
      );
    }

    // Validate dates
    const startDate = new Date(createLeaveDto.startDate);
    const endDate = new Date(createLeaveDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException("Start date must be before end date");
    }

    // Calculate days if not provided
    const days = createLeaveDto.days || this.calculateDays(startDate, endDate);

    return this.prisma.leave.create({
      data: {
        employeeId: createLeaveDto.employeeId,
        type: createLeaveDto.type,
        startDate,
        endDate,
        days,
        reason: createLeaveDto.reason,
        status: LeaveStatus.PENDING,
      },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    });
  }

  async findAll(query: LeaveQueryDto): Promise<PaginatedResult<any>> {
    const { page, limit, skip } = getPaginationParams(query);
    const filters: any[] = [];

    if (query.employeeId) {
      filters.push({ employeeId: query.employeeId });
    }

    if (query.status) {
      filters.push({ status: query.status });
    }

    if (query.search) {
      filters.push({
        OR: [
          { reason: { contains: query.search, mode: "insensitive" } },
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
        ],
      });
    }

    const where = filters.length ? { AND: filters } : {};

    const orderBy = resolveOrderBy(
      query.sortBy,
      query.sortOrder,
      ["createdAt", "startDate", "endDate"],
      "createdAt",
      "desc"
    );

    const include = {
      employee: {
        include: {
          department: true,
          position: true,
        },
      },
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.leave.findMany({
        where,
        include,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.leave.count({ where }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async findOne(id: string) {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    });

    if (!leave) {
      throw new NotFoundException(`Leave with ID ${id} not found`);
    }

    return leave;
  }

  async update(id: string, updateLeaveDto: UpdateLeaveDto) {
    const leave = await this.findOne(id);

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException("Only pending leaves can be updated");
    }

    let days = updateLeaveDto.days;
    if (updateLeaveDto.startDate && updateLeaveDto.endDate && !days) {
      const startDate = new Date(updateLeaveDto.startDate);
      const endDate = new Date(updateLeaveDto.endDate);
      days = this.calculateDays(startDate, endDate);
    }

    return this.prisma.leave.update({
      where: { id },
      data: {
        type: updateLeaveDto.type,
        startDate: updateLeaveDto.startDate
          ? new Date(updateLeaveDto.startDate)
          : undefined,
        endDate: updateLeaveDto.endDate
          ? new Date(updateLeaveDto.endDate)
          : undefined,
        days,
        reason: updateLeaveDto.reason,
      },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    });
  }

  async approve(id: string, approveLeaveDto: ApproveLeaveDto) {
    const leave = await this.findOne(id);

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        "Only pending leaves can be approved/rejected"
      );
    }

    return this.prisma.leave.update({
      where: { id },
      data: {
        status: approveLeaveDto.status,
        approverId: approveLeaveDto.approverId,
      },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const leave = await this.findOne(id);

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException("Only pending leaves can be deleted");
    }

    return this.prisma.leave.delete({
      where: { id },
    });
  }

  private calculateDays(startDate: Date, endDate: Date): number {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  }
}
