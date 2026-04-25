import { Role } from '../../common/enums/role.enum';
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    role?: Role;
    affiliation?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class VerifyOtpDto {
    email: string;
    otp: string;
}
export declare class ResendOtpDto {
    email: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class VerifyResetOtpDto {
    email: string;
    otp: string;
}
export declare class ResetPasswordDto {
    email: string;
    otp: string;
    newPassword: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
