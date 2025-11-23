import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserQueryDto } from "./dto/user-query.dto";
import { PaginatedResult } from "../common/interfaces/paginated-result.interface";
import {
  buildPaginationMeta,
  getPaginationParams,
  resolveOrderBy,
} from "../common/utils/pagination.util";

const USER_SELECT = {
  id: true,
  email: true,
  profileImage: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, role } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
      select: USER_SELECT,
    });
  }

  async findAll(query: UserQueryDto): Promise<PaginatedResult<any>> {
    const { page, limit, skip } = getPaginationParams(query);
    const filters: any[] = [];

    if (query.role) {
      filters.push({ role: query.role });
    }

    if (query.search) {
      filters.push({
        OR: [
          { email: { contains: query.search, mode: "insensitive" } },
        ],
      });
    }

    const where = filters.length ? { AND: filters } : undefined;

    const orderBy = resolveOrderBy(
      query.sortBy,
      query.sortOrder,
      ["email", "createdAt", "role"],
      "createdAt",
      "desc"
    );

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const data: Record<string, unknown> = {};

    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException("Another user already uses this email");
      }

      data.email = updateUserDto.email;
    }

    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.role) {
      data.role = updateUserDto.role;
    }

    if (Object.keys(data).length === 0) {
      return this.findOne(id);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({
      where: { id },
      select: USER_SELECT,
    });
  }

  async updateProfileImage(userId: string, imagePath: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { profileImage: imagePath },
      select: USER_SELECT,
    });
  }
}
