/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// PURPOSE: Blocks authenticated users who don't have the required role.
//
// This runs AFTER JwtAuthGuard — it assumes req.user already exists.
// It reads the roles attached by @Roles() decorator and compares
// them to the logged-in user's role from req.user.role.
//
// ALWAYS USE BOTH GUARDS TOGETHER:
//   @UseGuards(JwtAuthGuard, RolesGuard)   ← JWT first, then Roles
//   @Roles(Role.EDITOR)
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  // Reflector is NestJS's tool for reading metadata set by decorators
  constructor(private reflactor: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    // 1. Read the roles metadata set by @Roles() on this route
    const requiredRoles = this.reflactor.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), // check the method first
      context.getClass(), // then check the controller class
    ]);
    // 2. No @Roles() on this route? Any authenticated user can access it
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 3. Get the user object that JwtAuthGuard attached to the request
    const { user } = context.switchToHttp().getRequest();
    // 4. Is the user's role in the allowed list?
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const hasRole = requiredRoles.includes(user.role as Role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }
    return true;
  }
}
