import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "reemhasan088@gmail.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6, example: "Reem1994" })
  @IsString()
  password: string;
}
