import { Document } from 'mongoose';
import { Role } from '../../common/enums/role.enum';
export type UserDocument = User & Document;
export declare class User {
    name: string;
    email: string;
    password: string;
    role: Role;
    isEmailVerified: boolean;
    otp: string | null;
    otpExpiresAt: Date | null;
    resetOtp: string | null;
    resetOtpExpiresAt: Date | null;
    affiliation: string;
    bio: string;
    expertise: string[];
    refreshToken: string | null;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
}>;
