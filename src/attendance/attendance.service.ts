import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAttendanceDto } from "./dto/create-attendance.dto";
import { UpdateAttendanceDto } from "./dto/update-attendance.dto";
import { AttendanceQueryDto } from "./dto/attendance-query.dto";
import { PaginatedResult } from "../common/interfaces/paginated-result.interface";
import {
  buildPaginationMeta,
  getPaginationParams,
  resolveOrderBy,
} from "../common/utils/pagination.util";

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    // Verify employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: createAttendanceDto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${createAttendanceDto.employeeId} not found`
      );
    }

    // Calculate hours if checkIn and checkOut are provided
    let hours = createAttendanceDto.hours;
    if (createAttendanceDto.checkIn && createAttendanceDto.checkOut && !hours) {
      const checkIn = new Date(createAttendanceDto.checkIn);
      const checkOut = new Date(createAttendanceDto.checkOut);
      hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60); // Convert to hours
    }

    return this.prisma.attendance.create({
      data: {
        employeeId: createAttendanceDto.employeeId,
        date: new Date(createAttendanceDto.date),
        checkIn: createAttendanceDto.checkIn
          ? new Date(createAttendanceDto.checkIn)
          : null,
        checkOut: createAttendanceDto.checkOut
          ? new Date(createAttendanceDto.checkOut)
          : null,
        hours,
        note: createAttendanceDto.note,
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

  async findAll(query: AttendanceQueryDto): Promise<PaginatedResult<any>> {
    const { page, limit, skip } = getPaginationParams(query);
    const filters: any[] = [];

    if (query.employeeId) {
      filters.push({ employeeId: query.employeeId });
    }

    if (query.startDate || query.endDate) {
      filters.push({
        date: {
          ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
          ...(query.endDate ? { lte: new Date(query.endDate) } : {}),
        },
      });
    }

    if (query.search) {
      filters.push({
        OR: [
          { note: { contains: query.search, mode: "insensitive" } },
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
      ["date", "createdAt"],
      "date",
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
      this.prisma.attendance.findMany({
        where,
        include,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async findOne(id: string) {
    const attendance = await this.prisma.attendance.findUnique({
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

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    return attendance;
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    await this.findOne(id);

    // Calculate hours if checkIn and checkOut are provided
    let hours = updateAttendanceDto.hours;
    if (updateAttendanceDto.checkIn && updateAttendanceDto.checkOut && !hours) {
      const checkIn = new Date(updateAttendanceDto.checkIn);
      const checkOut = new Date(updateAttendanceDto.checkOut);
      hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
    }

    return this.prisma.attendance.update({
      where: { id },
      data: {
        date: updateAttendanceDto.date
          ? new Date(updateAttendanceDto.date)
          : undefined,
        checkIn: updateAttendanceDto.checkIn
          ? new Date(updateAttendanceDto.checkIn)
          : undefined,
        checkOut: updateAttendanceDto.checkOut
          ? new Date(updateAttendanceDto.checkOut)
          : undefined,
        hours,
        note: updateAttendanceDto.note,
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
    await this.findOne(id);
    return this.prisma.attendance.delete({
      where: { id },
    });
  }

  async checkIn(employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if attendance record exists for today
    let attendance = await this.prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (attendance) {
      // Update existing record
      attendance = await this.prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          checkIn: new Date(),
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
    } else {
      // Create new record
      attendance = await this.prisma.attendance.create({
        data: {
          employeeId,
          date: today,
          checkIn: new Date(),
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

    return attendance;
  }

  async checkOut(employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await this.prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException("No check-in record found for today");
    }

    const checkOutTime = new Date();
    const checkInTime = attendance.checkIn
      ? new Date(attendance.checkIn)
      : checkOutTime;
    const hours =
      (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: checkOutTime,
        hours,
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
}
