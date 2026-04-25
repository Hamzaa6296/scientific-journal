import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResendOtpDto,
  ResetPasswordDto,
  VerifyOtpDto,
  VerifyResetOtpDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/auth/register
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // POST /api/auth/verify-otp  ← signup email verification
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  // POST /api/auth/resend-otp
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto);
  }

  // POST /api/auth/login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // POST /api/auth/refresh
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@Body() dto: RefreshTokenDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.authService.refreshTokens(dto['userId'], dto.refreshToken);
  }

  // POST /api/auth/forgot-password
  // Step 1 of reset flow: user enters email → OTP sent to their inbox
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  // POST /api/auth/verify-reset-otp
  // Step 2 of reset flow: user enters the OTP from their email
  // On success → frontend shows the new password form
  @Post('verify-reset-otp')
  @HttpCode(HttpStatus.OK)
  verifyResetOtp(@Body() dto: VerifyResetOtpDto) {
    return this.authService.verifyResetOtp(dto);
  }

  // POST /api/auth/reset-password
  // Step 3 of reset flow: user submits email + OTP + new password
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // POST /api/auth/logout  ← protected
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.authService.logout(req.user.userId);
  }

  // GET /api/auth/me  ← protected
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      userId: req.user.userId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      email: req.user.email,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      role: req.user.role,
    };
  }
}
