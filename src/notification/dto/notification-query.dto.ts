import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class NotificationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: "Return only unread notifications" })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    return value === "true" || value === true;
  })
  unreadOnly?: boolean;

  @ApiPropertyOptional({ description: "Filter by notification type" })
  @IsOptional()
  @IsString()
  type?: string;
}
