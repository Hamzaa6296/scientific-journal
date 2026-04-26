"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcryptjs");
const user_schema_1 = require("./schemas/user.schema");
const mail_service_1 = require("./mail.service");
let AuthService = class AuthService {
    constructor(userModel, jwtService, configService, mailService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailService = mailService;
    }
    async register(dto) {
        const { email, password, name, role, affiliation } = dto;
        const exists = await this.userModel.findOne({ email: email.toLowerCase() });
        if (exists)
            throw new common_1.ConflictException('An account with this email already exists');
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
            message: 'Registration successful. Check your email for the verification code.',
            email: user.email,
        };
    }
    async verifyOtp(dto) {
        const { email, otp } = dto;
        const user = await this.userModel.findOne({ email: email.toLowerCase() });
        if (!user)
            throw new common_1.NotFoundException('No account found with this email');
        if (user.isEmailVerified)
            throw new common_1.BadRequestException('Email is already verified');
        if (user.otp !== otp)
            throw new common_1.BadRequestException('Invalid verification code');
        if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
            throw new common_1.BadRequestException('Verification code has expired. Please request a new one.');
        }
        await this.userModel.findByIdAndUpdate(user._id, {
            isEmailVerified: true,
            otp: null,
            otpExpiresAt: null,
        });
        return { message: 'Email verified successfully. You can now log in.' };
    }
    async resendOtp(dto) {
        const user = await this.userModel.findOne({
            email: dto.email.toLowerCase(),
        });
        if (!user)
            throw new common_1.NotFoundException('No account found with this email');
        if (user.isEmailVerified)
            throw new common_1.BadRequestException('Email is already verified');
        const otp = this.generateOtp();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.userModel.findByIdAndUpdate(user._id, { otp, otpExpiresAt });
        await this.mailService.sendOtpEmail(user.email, user.name, otp);
        return { message: 'A new verification code has been sent to your email.' };
    }
    async login(dto) {
        const { email, password } = dto;
        const user = await this.userModel.findOne({ email: email.toLowerCase() });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid email or password');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
            throw new common_1.UnauthorizedException('Invalid email or password');
        if (!user.isEmailVerified) {
            throw new common_1.UnauthorizedException('Please verify your email address before logging in');
        }
        const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
        await this.saveRefreshToken(user._id.toString(), tokens.refreshToken);
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
    async refreshTokens(userId, refreshToken) {
        const user = await this.userModel.findById(userId);
        if (!user || !user.refreshToken)
            throw new common_1.UnauthorizedException('Access denied');
        const tokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!tokenMatches)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
        await this.saveRefreshToken(user._id.toString(), tokens.refreshToken);
        return tokens;
    }
    async forgotPassword(dto) {
        const user = await this.userModel.findOne({
            email: dto.email.toLowerCase(),
        });
        if (!user) {
            return {
                message: 'If an account exists with this email, you will receive a reset code.',
            };
        }
        const resetOtp = this.generateOtp();
        const resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.userModel.findByIdAndUpdate(user._id, {
            resetOtp,
            resetOtpExpiresAt,
        });
        await this.mailService.sendPasswordResetOtpEmail(user.email, user.name, resetOtp);
        return {
            message: 'If an account exists with this email, you will receive a reset code.',
        };
    }
    async verifyResetOtp(dto) {
        const { email, otp } = dto;
        const user = await this.userModel.findOne({ email: email.toLowerCase() });
        if (!user)
            throw new common_1.NotFoundException('No account found with this email');
        if (!user.resetOtp || user.resetOtp !== otp) {
            throw new common_1.BadRequestException('Invalid reset code');
        }
        if (!user.resetOtpExpiresAt || new Date() > user.resetOtpExpiresAt) {
            throw new common_1.BadRequestException('Reset code has expired. Please request a new one.');
        }
        return { message: 'OTP verified. You may now reset your password.' };
    }
    async resetPassword(dto) {
        const { email, otp, newPassword } = dto;
        const user = await this.userModel.findOne({ email: email.toLowerCase() });
        if (!user)
            throw new common_1.NotFoundException('No account found with this email');
        if (!user.resetOtp || user.resetOtp !== otp) {
            throw new common_1.BadRequestException('Invalid reset code');
        }
        if (!user.resetOtpExpiresAt || new Date() > user.resetOtpExpiresAt) {
            throw new common_1.BadRequestException('Reset code has expired. Please request a new one.');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await this.userModel.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            resetOtp: null,
            resetOtpExpiresAt: null,
            refreshToken: null,
        });
        return {
            message: 'Password reset successful. Please log in with your new password.',
        };
    }
    async logout(userId) {
        await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
        return { message: 'Logged out successfully' };
    }
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const accessSecret = process.env.JWT_ACCESS_SECRET;
        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
        const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: accessSecret,
            expiresIn: accessExpiresIn,
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: refreshSecret,
            expiresIn: refreshExpiresIn,
        });
        return { accessToken, refreshToken };
    }
    async saveRefreshToken(userId, refreshToken) {
        const hashed = await bcrypt.hash(refreshToken, 10);
        await this.userModel.findByIdAndUpdate(userId, { refreshToken: hashed });
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map