import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum } from "class-validator";

export enum OtpType {
  LOGIN = "LOGIN",
  REGISTER = "REGISTER",
}

export class SendOtpDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: OtpType, example: OtpType.LOGIN })
  @IsEnum(OtpType)
  type: OtpType;
}
