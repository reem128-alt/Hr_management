import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentQueryDto } from './dto/department-query.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { buildPaginationMeta, getPaginationParams, resolveOrderBy } from '../common/utils/pagination.util';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    // Check if code already exists
    if (createDepartmentDto.code) {
      const existing = await this.prisma.department.findUnique({
        where: { code: createDepartmentDto.code },
      });

      if (existing) {
        throw new ConflictException('Department with this code already exists');
      }
    }

    return this.prisma.department.create({
      data: createDepartmentDto,
      include: {
        employees: {
          include: {
            position: true,
          },
        },
      },
    });
  }

  async findAll(query: DepartmentQueryDto): Promise<PaginatedResult<any>> {
    const { page, limit, skip } = getPaginationParams(query);
    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.code) {
      where.code = { equals: query.code, mode: 'insensitive' };
    }

    const orderBy = resolveOrderBy(
      query.sortBy,
      query.sortOrder,
      ['name', 'code'],
      'name',
      'asc'
    );

    const include = {
      employees: {
        include: {
          position: true,
        },
      },
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.department.findMany({
        where,
        include,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.department.count({ where }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        employees: {
          include: {
            position: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    await this.findOne(id);

    // Check if code already exists (if updating code)
    if (updateDepartmentDto.code) {
      const existing = await this.prisma.department.findFirst({
        where: {
          code: updateDepartmentDto.code,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Department with this code already exists');
      }
    }

    return this.prisma.department.update({
      where: { id },
      data: updateDepartmentDto,
      include: {
        employees: {
          include: {
            position: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.department.delete({
      where: { id },
    });
  }
}

