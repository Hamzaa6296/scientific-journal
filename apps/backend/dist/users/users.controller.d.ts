import { UsersService } from './users.service';
import { UpdateProfileDto, UpdateRoleDto } from './dto/user.dto';
import { Role } from '../common/enums/role.enum';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<import("mongoose").FlattenMaps<import("../auth/schemas/user.schema").User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<import("mongoose").FlattenMaps<import("../auth/schemas/user.schema").User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>>;
    getReviewers(): Promise<(import("mongoose").Document<unknown, {}, import("../auth/schemas/user.schema").UserDocument> & import("../auth/schemas/user.schema").User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getAllUsers(role?: Role): Promise<(import("mongoose").Document<unknown, {}, import("../auth/schemas/user.schema").UserDocument> & import("../auth/schemas/user.schema").User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getUserById(id: string): Promise<import("mongoose").Document<unknown, {}, import("../auth/schemas/user.schema").UserDocument> & import("../auth/schemas/user.schema").User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateRole(id: string, dto: UpdateRoleDto, req: any): Promise<import("mongoose").Document<unknown, {}, import("../auth/schemas/user.schema").UserDocument> & import("../auth/schemas/user.schema").User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    deleteUser(id: string, req: any): Promise<{
        message: string;
    }>;
}
