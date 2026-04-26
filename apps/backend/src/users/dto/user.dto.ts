// PURPOSE: Defines and validates request bodies for user-related operations.
//
// UpdateProfileDto  → what a user can update about themselves
// UpdateRoleDto     → what an admin sends to change someone's role

import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum';

// ─── UPDATE OWN PROFILE ──────────────────────────────────────────────────────
// All fields are optional — user can update one or all at once

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  affiliation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  // each: true → validates every item in the array is a string
  // e.g. ['Machine Learning', 'Quantum Physics', 'Bioinformatics']
  expertise?: string[];
}

// ─── UPDATE ROLE (admin only) ─────────────────────────────────────────────────

export class UpdateRoleDto {
  @IsEnum(Role, {
    message: 'Invalid role. Must be admin, editor, reviewer, or author',
  })
  role: Role;
}
