import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { RegisterDto, LoginDto, VerifyOtpDto, ForgotPasswordDto, VerifyResetOtpDto, ResetPasswordDto, ResendOtpDto } from './dto/auth.dto';
import { MailService } from './mail.service';
export declare class AuthService {
    private userModel;
    private jwtService;
    private configService;
    private mailService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService, configService: ConfigService, mailService: MailService);
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
    refreshTokens(userId: string, refreshToken: string): Promise<{
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
    logout(userId: string): Promise<{
        message: string;
    }>;
    private generateTokens;
    private saveRefreshToken;
    private generateOtp;
}
