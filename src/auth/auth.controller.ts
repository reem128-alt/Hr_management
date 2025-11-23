import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { SendOtpDto, OtpType } from "./dto/send-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { VerifyOtpRegisterDto } from "./dto/verify-otp-register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Step 1: Register - Send OTP to email" })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @ApiOperation({ summary: "Step 1: Login - Verify password and send OTP" })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("send-otp")
  @ApiOperation({ summary: "Send OTP to email for login or registration" })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto);
  }

  @Post("verify-otp/register")
  @ApiOperation({ summary: "Step 2: Complete registration by verifying OTP" })
  async verifyOtpRegister(@Body() verifyOtpRegisterDto: VerifyOtpRegisterDto) {
    const { email, code, password, role } = verifyOtpRegisterDto;
    return this.authService.verifyOtpForRegister(
      { email, code, type: OtpType.REGISTER },
      { email, password, role: role as any }
    );
  }

  @Post("verify-otp/login")
  @ApiOperation({ summary: "Step 2: Complete login by verifying OTP" })
  async verifyOtpLogin(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtpForLogin(verifyOtpDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get authenticated user profile" })
  @Get("profile")
  async getProfile(@Request() req) {
    return this.authService.validateUser(req.user.userId);
  }
}
