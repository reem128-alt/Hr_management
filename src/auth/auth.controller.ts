import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Inject,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { SendOtpDto, OtpType } from "./dto/send-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { VerifyOtpRegisterDto } from "./dto/verify-otp-register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  @Post("register")
  @ApiOperation({ summary: "Step 1: Register - Send OTP to email" })
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`, 'AuthController');
    return this.authService.register(registerDto);
  }

  @Post("login")
  @ApiOperation({ summary: "Step 1: Login - Verify password and send OTP" })
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`, 'AuthController');
    return this.authService.login(loginDto);
  }

  @Post("send-otp")
  @ApiOperation({ summary: "Send OTP to email for login or registration" })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    this.logger.log(`OTP sent to email: ${sendOtpDto.email} for type: ${sendOtpDto.type}`, 'AuthController');
    return this.authService.sendOtp(sendOtpDto);
  }

  @Post("verify-otp/register")
  @ApiOperation({ summary: "Step 2: Complete registration by verifying OTP" })
  async verifyOtpRegister(@Body() verifyOtpRegisterDto: VerifyOtpRegisterDto) {
    const { email, code, password, role } = verifyOtpRegisterDto;
    this.logger.log(`OTP verification for registration: ${email}`, 'AuthController');
    return this.authService.verifyOtpForRegister(
      { email, code, type: OtpType.REGISTER },
      { email, password, role: role as any }
    );
  }

  @Post("verify-otp/login")
  @ApiOperation({ summary: "Step 2: Complete login by verifying OTP" })
  async verifyOtpLogin(@Body() verifyOtpDto: VerifyOtpDto) {
    this.logger.log(`OTP verification for login: ${verifyOtpDto.email}`, 'AuthController');
    return this.authService.verifyOtpForLogin(verifyOtpDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get authenticated user profile" })
  @Get("profile")
  async getProfile(@Request() req) {
    this.logger.log(`Profile requested for user ID: ${req.user.userId}`, 'AuthController');
    return this.authService.validateUser(req.user.userId);
  }
}
