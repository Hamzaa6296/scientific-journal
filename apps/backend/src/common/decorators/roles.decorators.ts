// PURPOSE: A custom decorator that tags a route with "who is allowed here".
//
// HOW IT WORKS:
// @Roles(Role.EDITOR) stores [Role.EDITOR] as metadata on that route handler.
// The RolesGuard then READS this metadata and compares it to req.user.role.
//
// SetMetadata(key, value) is NestJS's built-in utility to attach metadata
// to a class or method. We define the key as a constant so both the
// decorator and the guard use the exact same key string.
//
// USAGE ON A ROUTE:
//   @Roles(Role.EDITOR)               ← only editors
//   @Roles(Role.EDITOR, Role.ADMIN)   ← editors OR admins

import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
