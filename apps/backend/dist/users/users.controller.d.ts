import { UsersService } from './users.service';
import { UpdateProfileDto, UpdateRoleDto } from './dto/user.dto';
import { Role } from '../common/enums/role.enum';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<import("../auth/schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<import("../auth/schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getReviewers(): Promise<(import("mongoose").Document<unknown, {}, import("../auth/schemas/user.schema").UserDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../auth/schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAllUsers(role?: Role): Promise<(import("mongoose").Document<unknown, {}, import("../auth/schemas/user.schema").UserDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../auth/schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getUserById(id: string): Promise<import("mongoose").Document<unknown, {}, import("../auth/schemas/user.schema").UserDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../auth/schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateRole(id: string, dto: UpdateRoleDto, req: any): Promise<import("mongoose").Document<unknown, {}, import("../auth/schemas/user.schema").UserDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../auth/schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteUser(id: string, req: any): Promise<{
        message: string;
    }>;
}
