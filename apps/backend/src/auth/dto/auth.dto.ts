import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum';

// ─── REGISTER ────────────────────────────────────────────────────────────────

export class RegisterDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Invalid role' })
  role?: Role;

  @IsOptional()
  @IsString()
  affiliation?: string;
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsNotEmpty()
  password: string;
}

// ─── VERIFY OTP (email verification at signup) ───────────────────────────────

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}

// ─── RESEND OTP ───────────────────────────────────────────────────────────────

export class ResendOtpDto {
  @IsEmail()
  email: string;
}

// ─── FORGOT PASSWORD ─────────────────────────────────────────────────────────
// User submits their email → we send a reset OTP to it

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

// ─── VERIFY RESET OTP ────────────────────────────────────────────────────────
// Before letting the user set a new password, we verify the OTP they received.
// On success, the frontend shows the "enter new password" form.
// This is a separate step so the UX is: enter OTP → then enter new password.

export class VerifyResetOtpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}

// ─── RESET PASSWORD ──────────────────────────────────────────────────────────
// Final step — user submits email + OTP + new password together.
// We re-verify the OTP here as well so this endpoint can't be called
// without a valid OTP (protects against someone skipping the verify step).

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  otp: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  newPassword: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
