// PURPOSE: Validates all incoming request bodies for review operations.

import {
  IsArray,
  IsBoolean,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// ─── ASSIGN REVIEWERS (editor) ────────────────────────────────────────────────

export class AssignReviewersDto {
  @IsArray()
  @IsMongoId({
    each: true,
    message: 'Each reviewer ID must be a valid MongoDB ID',
  })
  // Array of user IDs of reviewers to assign
  // e.g. ["64abc...", "64def...", "64ghi..."]
  reviewerIds: string[];
}

// ─── RESPOND TO INVITATION (reviewer) ────────────────────────────────────────

export class RespondToInvitationDto {
  @IsBoolean()
  // true  → reviewer accepts the assignment
  // false → reviewer declines (editor will need to assign someone else)
  accepted: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  // Optional reason if declining — helps editor understand why
  declineReason?: string;
}

// ─── SUBMIT REVIEW (reviewer) ─────────────────────────────────────────────────

export class SubmitReviewDto {
  @IsIn(['accept', 'minor_revision', 'major_revision', 'reject'], {
    message:
      'Decision must be: accept, minor_revision, major_revision, or reject',
  })
  // The reviewer's recommendation to the editor
  decision: 'accept' | 'minor_revision' | 'major_revision' | 'reject';

  @IsNotEmpty({ message: 'Review comments are required' })
  @IsString()
  @MaxLength(10000)
  // Detailed feedback for the author — this is what matters most
  comments: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  // Private notes for the editor only — author never sees this
  privateNotes?: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  // Overall quality score 1-10
  score: number;
}
