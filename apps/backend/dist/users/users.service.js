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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../auth/schemas/user.schema");
const role_enum_1 = require("../common/enums/role.enum");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async getProfile(userId) {
        const user = await this.userModel.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user.toJSON();
    }
    async updateProfile(userId, dto) {
        const updated = await this.userModel.findByIdAndUpdate(userId, { $set: dto }, { new: true, runValidators: true });
        if (!updated)
            throw new common_1.NotFoundException('User not found');
        return updated.toJSON();
    }
    async getAllUsers(role) {
        const query = role ? { role } : {};
        const users = await this.userModel
            .find(query)
            .select('-password -refreshToken -otp -otpExpiresAt -resetOtp -resetOtpExpiresAt')
            .sort({ createdAt: -1 })
            .exec();
        return users;
    }
    async getReviewers() {
        const reviewers = await this.userModel
            .find({
            role: role_enum_1.Role.REVIEWER,
            isEmailVerified: true,
        })
            .select('name email affiliation expertise')
            .sort({ name: 1 })
            .exec();
        return reviewers;
    }
    async getUserById(id) {
        const user = await this.userModel
            .findById(id)
            .select('-password -refreshToken -otp -otpExpiresAt -resetOtp -resetOtpExpiresAt');
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateRole(id, dto, requestingUserId) {
        if (id === requestingUserId) {
            throw new common_1.BadRequestException('You cannot change your own role');
        }
        const user = await this.userModel
            .findByIdAndUpdate(id, { $set: { role: dto.role } }, { new: true })
            .select('-password -refreshToken -otp -otpExpiresAt -resetOtp -resetOtpExpiresAt');
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async deleteUser(id, requestingUserId) {
        if (id === requestingUserId) {
            throw new common_1.BadRequestException('You cannot delete your own account');
        }
        const user = await this.userModel.findByIdAndDelete(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return { message: 'User deleted successfully' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map