import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { Role } from "../../common/enums/role.enum";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class UserQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: Role, description: "Filter by user role" })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}


