import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsEnum, Length } from "class-validator";
import { OtpType } from "./send-otp.dto";

export class VerifyOtpDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "123456", minLength: 6, maxLength: 6 })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiProperty({ enum: OtpType, example: OtpType.LOGIN })
  @IsEnum(OtpType)
  type: OtpType;
}
