import { Model } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { UpdateProfileDto, UpdateRoleDto } from './dto/user.dto';
import { Role } from '../common/enums/role.enum';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    getProfile(userId: string): Promise<import("mongoose").FlattenMaps<User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<import("mongoose").FlattenMaps<User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>>;
    getAllUsers(role?: Role): Promise<(import("mongoose").Document<unknown, {}, UserDocument> & User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getReviewers(): Promise<(import("mongoose").Document<unknown, {}, UserDocument> & User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getUserById(id: string): Promise<import("mongoose").Document<unknown, {}, UserDocument> & User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateRole(id: string, dto: UpdateRoleDto, requestingUserId: string): Promise<import("mongoose").Document<unknown, {}, UserDocument> & User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    deleteUser(id: string, requestingUserId: string): Promise<{
        message: string;
    }>;
}
