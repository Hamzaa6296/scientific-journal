/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// PURPOSE: HTTP routes for /api/users/*.
//
// GUARDS USED HERE:
// JwtAuthGuard  → every route requires a valid access token
// RolesGuard    → some routes require specific roles
//
// PATTERN: Always put JwtAuthGuard first, then RolesGuard.
// JwtAuthGuard populates req.user. RolesGuard reads req.user.role.
// If JwtAuthGuard runs second, req.user won't exist when RolesGuard checks it.

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto, UpdateRoleDto } from './dto/user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorators';
import { Role } from '../common/enums/role.enum';

@Controller('users')
// Apply JwtAuthGuard to ALL routes in this controller at once.
// Every /api/users/* route requires authentication.
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/users/profile
  // Any authenticated user can get their own profile.
  // No @Roles() needed — JwtAuthGuard alone is enough.
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.userId);
  }

  // PATCH /api/users/profile
  // Any authenticated user can update their own profile.
  @Patch('profile')
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }

  // GET /api/users/reviewers
  // Editors and admins can see the reviewer pool for paper assignment.
  // IMPORTANT: This route must come BEFORE /api/users/:id
  // because if :id comes first, 'reviewers' would be treated as an id param.
  @Get('reviewers')
  @Roles(Role.EDITOR, Role.ADMIN)
  getReviewers() {
    return this.usersService.getReviewers();
  }

  // GET /api/users?role=reviewer
  // Admin can list all users, optionally filtered by role.
  // ?role=reviewer → returns only reviewers
  // ?role=editor   → returns only editors
  // no query param → returns everyone
  @Get()
  @Roles(Role.ADMIN)
  getAllUsers(@Query('role') role?: Role) {
    return this.usersService.getAllUsers(role);
  }

  // GET /api/users/:id
  // Admin can look up any user by their MongoDB id.
  @Get(':id')
  @Roles(Role.ADMIN)
  getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  // PATCH /api/users/:id/role
  // Admin can change any user's role.
  // e.g. promote an author to reviewer, or demote an editor
  @Patch(':id/role')
  @Roles(Role.ADMIN)
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Request() req,
  ) {
    return this.usersService.updateRole(id, dto, req.user.userId);
  }

  // DELETE /api/users/:id
  // Admin can delete any user account.
  @Delete(':id')
  @Roles(Role.ADMIN)
  deleteUser(@Param('id') id: string, @Request() req) {
    return this.usersService.deleteUser(id, req.user.userId);
  }
}
