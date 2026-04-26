// PURPOSE: All user management business logic.
//
// WHAT THIS SERVICE HANDLES:
// - Getting own profile
// - Updating own profile
// - Admin: listing all users, changing roles, deleting users
// - Editor/Admin: listing reviewers (for paper assignment)

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { UpdateProfileDto, UpdateRoleDto } from './dto/user.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    // We reuse the User model from the auth module.
    // This works because AuthModule exports MongooseModule,
    // and UsersModule imports AuthModule — so the model is shared.
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // ─── GET OWN PROFILE ───────────────────────────────────────────────────────
  // Called by any authenticated user to get their own full profile.
  // userId comes from req.user.userId (set by JwtStrategy).

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) throw new NotFoundException('User not found');

    // toJSON() applies our schema transform — removes password, __v, renames _id to id
    return user.toJSON();
  }

  // ─── UPDATE OWN PROFILE ────────────────────────────────────────────────────
  // User can update their name, affiliation, bio, expertise.
  // They cannot change their own email or role here.

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // { new: true } → returns the UPDATED document, not the original
    // runValidators: true → runs schema validators on the update
    const updated = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: dto },
      { new: true, runValidators: true },
    );

    if (!updated) throw new NotFoundException('User not found');

    return updated.toJSON();
  }

  // ─── GET ALL USERS (admin only) ────────────────────────────────────────────
  // Returns paginated list of all users.
  // Supports optional filtering by role.

  async getAllUsers(role?: Role) {
    // Build query dynamically — if role is provided, filter by it
    const query = role ? { role } : {};

    const users = await this.userModel
      .find(query)
      .select(
        '-password -refreshToken -otp -otpExpiresAt -resetOtp -resetOtpExpiresAt',
      )
      // .select('-fieldName') → excludes sensitive fields from the result
      // We never want to send password hashes or tokens to the frontend
      .sort({ createdAt: -1 }) // newest first
      .exec();

    return users;
  }

  // ─── GET ALL REVIEWERS (editor + admin) ────────────────────────────────────
  // Editors use this to see available reviewers when assigning papers.
  // Returns only verified reviewers with their expertise fields.

  async getReviewers() {
    const reviewers = await this.userModel
      .find({
        role: Role.REVIEWER,
        isEmailVerified: true,
      })
      .select('name email affiliation expertise')
      // Only return fields the editor needs to make assignment decisions
      .sort({ name: 1 }) // alphabetical
      .exec();

    return reviewers;
  }

  // ─── GET USER BY ID (admin only) ───────────────────────────────────────────

  async getUserById(id: string) {
    const user = await this.userModel
      .findById(id)
      .select(
        '-password -refreshToken -otp -otpExpiresAt -resetOtp -resetOtpExpiresAt',
      );

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  // ─── UPDATE USER ROLE (admin only) ─────────────────────────────────────────
  // Admin can promote an author to reviewer/editor, or demote someone.

  async updateRole(id: string, dto: UpdateRoleDto, requestingUserId: string) {
    // Prevent admin from changing their own role
    // (avoids accidentally locking yourself out of admin access)
    if (id === requestingUserId) {
      throw new BadRequestException('You cannot change your own role');
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: { role: dto.role } }, { new: true })
      .select(
        '-password -refreshToken -otp -otpExpiresAt -resetOtp -resetOtpExpiresAt',
      );

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  // ─── DELETE USER (admin only) ──────────────────────────────────────────────

  async deleteUser(id: string, requestingUserId: string) {
    // Prevent admin from deleting themselves
    if (id === requestingUserId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const user = await this.userModel.findByIdAndDelete(id);

    if (!user) throw new NotFoundException('User not found');

    return { message: 'User deleted successfully' };
  }
}
