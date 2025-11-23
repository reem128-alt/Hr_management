import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsUrl,
} from "class-validator";
import { Role } from "../../common/enums/role.enum";

export class CreateUserDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6, example: "ChangeMe123" })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ 
    description: "URL to the user's profile image",
    example: "https://example.com/images/profile.jpg"
  })
  @IsOptional()
  @IsUrl()
  profileImage?: string;

  @ApiProperty({ enum: Role, default: Role.EMPLOYEE, required: false })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
