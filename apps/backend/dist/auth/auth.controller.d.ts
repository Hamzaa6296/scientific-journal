import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, RefreshTokenDto, RegisterDto, ResendOtpDto, ResetPasswordDto, VerifyOtpDto, VerifyResetOtpDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
        email: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        message: string;
    }>;
    resendOtp(dto: ResendOtpDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        message: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
            role: import("../common/enums/role.enum").Role;
            affiliation: string;
        };
    }>;
    refreshTokens(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    verifyResetOtp(dto: VerifyResetOtpDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
    getMe(req: any): {
        userId: any;
        email: any;
        role: any;
    };
}
