/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  VerifyResetOtpDto,
  ResetPasswordDto,
  ResendOtpDto,
} from './dto/auth.dto';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  // ─── REGISTER ──────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const { email, password, name, role, affiliation } = dto;

    const exists = await this.userModel.findOne({ email: email.toLowerCase() });
    if (exists)
      throw new ConflictException('An account with this email already exists');

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await this.userModel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      affiliation,
      otp,
      otpExpiresAt,
      isEmailVerified: false,
    });

    await this.mailService.sendOtpEmail(user.email, user.name, otp);

    return {
      message:
        'Registration successful. Check your email for the verification code.',
      email: user.email,
    };
  }

  // ─── VERIFY OTP (signup) ───────────────────────────────────────────────────

  async verifyOtp(dto: VerifyOtpDto) {
    const { email, otp } = dto;

    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) throw new NotFoundException('No account found with this email');
    if (user.isEmailVerified)
      throw new BadRequestException('Email is already verified');
    if (user.otp !== otp)
      throw new BadRequestException('Invalid verification code');
    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      throw new BadRequestException(
        'Verification code has expired. Please request a new one.',
      );
    }

    await this.userModel.findByIdAndUpdate(user._id, {
      isEmailVerified: true,
      otp: null,
      otpExpiresAt: null,
    });

    return { message: 'Email verified successfully. You can now log in.' };
  }

  // ─── RESEND OTP (signup) ───────────────────────────────────────────────────

  async resendOtp(dto: ResendOtpDto) {
    const user = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
    });
    if (!user) throw new NotFoundException('No account found with this email');
    if (user.isEmailVerified)
      throw new BadRequestException('Email is already verified');

    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.userModel.findByIdAndUpdate(user._id, { otp, otpExpiresAt });
    await this.mailService.sendOtpEmail(user.email, user.name, otp);

    return { message: 'A new verification code has been sent to your email.' };
  }

  // ─── LOGIN ─────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid email or password');

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email address before logging in',
      );
    }

    const tokens = await this.generateTokens(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (user._id as any).toString(),
      user.email,
      user.role,
    );

    await this.saveRefreshToken(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (user._id as any).toString(),
      tokens.refreshToken,
    );

    return {
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        affiliation: user.affiliation,
      },
      ...tokens,
    };
  }

  // ─── REFRESH TOKENS ────────────────────────────────────────────────────────

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Access denied');

    const tokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenMatches) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.generateTokens(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (user._id as any).toString(),
      user.email,
      user.role,
    );

    await this.saveRefreshToken(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (user._id as any).toString(),
      tokens.refreshToken,
    );
    return tokens;
  }

  // ─── FORGOT PASSWORD ───────────────────────────────────────────────────────
  // Generates a reset OTP and emails it. Exactly like signup OTP but stored
  // in resetOtp/resetOtpExpiresAt fields so it doesn't interfere with
  // the email verification OTP flow.

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
    });

    // Always return the same message — prevents email enumeration attacks
    // (attacker can't tell if the email exists in our system or not)
    if (!user) {
      return {
        message:
          'If an account exists with this email, you will receive a reset code.',
      };
    }

    const resetOtp = this.generateOtp();
    const resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.userModel.findByIdAndUpdate(user._id, {
      resetOtp,
      resetOtpExpiresAt,
    });

    // Send the OTP in a password-reset specific email template
    await this.mailService.sendPasswordResetOtpEmail(
      user.email,
      user.name,
      resetOtp,
    );

    return {
      message:
        'If an account exists with this email, you will receive a reset code.',
    };
  }

  // ─── VERIFY RESET OTP ──────────────────────────────────────────────────────
  // Optional but recommended separate step — validates the OTP before showing
  // the "enter new password" form on the frontend.
  //
  // WHY A SEPARATE STEP?
  // Better UX: user enters OTP first, sees it's valid, THEN sees the
  // new password form. Avoids them filling in a new password only to
  // find out their OTP was wrong.

  async verifyResetOtp(dto: VerifyResetOtpDto) {
    const { email, otp } = dto;

    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) throw new NotFoundException('No account found with this email');

    if (!user.resetOtp || user.resetOtp !== otp) {
      throw new BadRequestException('Invalid reset code');
    }

    if (!user.resetOtpExpiresAt || new Date() > user.resetOtpExpiresAt) {
      throw new BadRequestException(
        'Reset code has expired. Please request a new one.',
      );
    }

    // OTP is valid — frontend can now show the new password form
    return { message: 'OTP verified. You may now reset your password.' };
  }

  // ─── RESET PASSWORD ────────────────────────────────────────────────────────
  // Final step — re-verifies OTP + sets the new password in one atomic operation.
  // We re-verify here (not just in verifyResetOtp) so this endpoint is safe
  // even if called directly without going through verifyResetOtp first.

  async resetPassword(dto: ResetPasswordDto) {
    const { email, otp, newPassword } = dto;

    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) throw new NotFoundException('No account found with this email');

    // Re-verify the OTP
    if (!user.resetOtp || user.resetOtp !== otp) {
      throw new BadRequestException('Invalid reset code');
    }

    if (!user.resetOtpExpiresAt || new Date() > user.resetOtpExpiresAt) {
      throw new BadRequestException(
        'Reset code has expired. Please request a new one.',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.userModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetOtp: null,
      resetOtpExpiresAt: null,
      refreshToken: null, // invalidate all active sessions — user must re-login
    });

    return {
      message:
        'Password reset successful. Please log in with your new password.',
    };
  }

  // ─── LOGOUT ────────────────────────────────────────────────────────────────

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }

  // ─── PRIVATE HELPERS ───────────────────────────────────────────────────────

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: accessExpiresIn as any,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn as any,
    });

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: hashed });
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
