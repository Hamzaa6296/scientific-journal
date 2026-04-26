import { Role } from '../../common/enums/role.enum';
export declare class UpdateProfileDto {
    name?: string;
    affiliation?: string;
    bio?: string;
    expertise?: string[];
}
export declare class UpdateRoleDto {
    role: Role;
}
