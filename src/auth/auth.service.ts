import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../common/services/email.service";
import * as bcrypt from "bcrypt";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { SendOtpDto, OtpType } from "./dto/send-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { Role } from "../common/enums/role.enum";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService
  ) {}

  /**
   * Generate a 6-digit OTP code
   */
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP to user's email
   */
  async sendOtp(sendOtpDto: SendOtpDto) {
    const { email, type } = sendOtpDto;

    // For REGISTER type, check if user already exists
    if (type === OtpType.REGISTER) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException("User with this email already exists");
      }
    }

    // For LOGIN type, check if user exists
    if (type === OtpType.LOGIN) {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException("User not found");
      }
    }

    // Generate OTP
    const code = this.generateOtp();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

    // Delete any existing OTPs for this email and type
    await (this.prisma as any).otp.deleteMany({
      where: {
        email,
        type,
        used: false,
      },
    });

    // Create new OTP
    await (this.prisma as any).otp.create({
      data: {
        email,
        code,
        type,
        expiresAt,
      },
    });

    // Send OTP via email
    await this.emailService.sendOtpEmail(
      email,
      code,
      type === OtpType.LOGIN ? "LOGIN" : "REGISTER"
    );

    return {
      message: "OTP sent successfully to your email",
      email,
    };
  }

  /**
   * Verify OTP and complete registration
   */
  async verifyOtpForRegister(
    verifyOtpDto: VerifyOtpDto,
    registerDto: RegisterDto
  ) {
    const { email, code } = verifyOtpDto;
    const { password, role = Role.EMPLOYEE } = registerDto;

    // Verify OTP
    await this.verifyOtp({ ...verifyOtpDto, type: OtpType.REGISTER });

    // Check if user already exists (double check)
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      user,
      access_token: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
    };
  }

  /**
   * Verify OTP and complete login
   */
  async verifyOtpForLogin(verifyOtpDto: VerifyOtpDto) {
    const { email, code } = verifyOtpDto;

    // Verify OTP
    await this.verifyOtp({ ...verifyOtpDto, type: OtpType.LOGIN });

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      access_token: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
    };
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, code, type } = verifyOtpDto;

    // Find OTP
    const otp = await (this.prisma as any).otp.findFirst({
      where: {
        email,
        code,
        type,
        used: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otp) {
      throw new BadRequestException("Invalid OTP code");
    }

    // Check if OTP is expired
    if (new Date() > otp.expiresAt) {
      throw new BadRequestException("OTP has expired");
    }

    // Mark OTP as used
    await (this.prisma as any).otp.update({
      where: { id: otp.id },
      data: { used: true },
    });

    return { message: "OTP verified successfully" };
  }

  /**
   * Register - Step 1: Send OTP
   */
  async register(registerDto: RegisterDto) {
    const { email } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Send OTP for registration
    return this.sendOtp({
      email,
      type: OtpType.REGISTER,
    });
  }

  /**
   * Login - Step 1: Verify password and send OTP
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Send OTP for login
    return this.sendOtp({
      email,
      type: OtpType.LOGIN,
    });
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return user;
  }
}
