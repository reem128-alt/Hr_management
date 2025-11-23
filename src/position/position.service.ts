import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePositionDto } from "./dto/create-position.dto";
import { UpdatePositionDto } from "./dto/update-position.dto";
import { PositionQueryDto } from "./dto/position-query.dto";
import { PaginatedResult } from "../common/interfaces/paginated-result.interface";
import {
  buildPaginationMeta,
  getPaginationParams,
  resolveOrderBy,
} from "../common/utils/pagination.util";

@Injectable()
export class PositionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPositionDto: CreatePositionDto) {
    return this.prisma.position.create({
      data: createPositionDto,
      include: {
        employees: true,
      },
    });
  }

  async findAll(query: PositionQueryDto): Promise<PaginatedResult<any>> {
    const { page, limit, skip } = getPaginationParams(query);
    const where: any = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { level: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.level) {
      where.level = { equals: query.level, mode: "insensitive" };
    }

    const orderBy = resolveOrderBy(
      query.sortBy,
      query.sortOrder,
      ["title", "level"],
      "title",
      "asc"
    );

    const include = {
      employees: true,
    };

    const [data, total] = await this.prisma.$transaction([//many process on db exceute as one process
      this.prisma.position.findMany({
        where,
        include,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.position.count({ where }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async findOne(id: string) {
    const position = await this.prisma.position.findUnique({
      where: { id },
      include: {
        employees: true,
      },
    });

    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    return position;
  }

  async update(id: string, updatePositionDto: UpdatePositionDto) {
    await this.findOne(id);
    return this.prisma.position.update({
      where: { id },
      data: updatePositionDto,
      include: {
        employees: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.position.delete({
      where: { id },
    });
  }
}
