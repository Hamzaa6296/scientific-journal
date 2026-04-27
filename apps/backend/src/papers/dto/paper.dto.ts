// PURPOSE: Validates all incoming request bodies for paper operations.

import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaperStatus } from '../schema/paper.schema';

// ─── AUTHOR REF DTO ───────────────────────────────────────────────────────────

export class AuthorRefDto {
  @IsMongoId({ message: 'Invalid user ID format' })
  userId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  affiliation?: string;
}

// ─── SUBMIT / CREATE PAPER ────────────────────────────────────────────────────

export class CreatePaperDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  @MaxLength(300)
  title: string;

  @IsNotEmpty({ message: 'Abstract is required' })
  @IsString()
  @MinLength(100, { message: 'Abstract must be at least 100 characters' })
  @MaxLength(5000)
  abstract: string;

  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @IsArray()
  @ValidateNested({ each: true })
  // ValidateNested → validates each object in the array against AuthorRefDto
  // Type(() => AuthorRefDto) → tells class-transformer what class to use
  @Type(() => AuthorRefDto)
  authors: AuthorRefDto[];

  @IsNotEmpty({ message: 'Category is required' })
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  journal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  coverLetter?: string;

  @IsOptional()
  @IsString()
  // URL of the uploaded file — frontend uploads file first, gets URL back,
  // then sends it here with the paper data
  fileUrl?: string;

  @IsOptional()
  @IsString()
  coverLetterUrl?: string;
}

// ─── UPDATE PAPER (draft only) ────────────────────────────────────────────────

export class UpdatePaperDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(100)
  @MaxLength(5000)
  abstract?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuthorRefDto)
  authors?: AuthorRefDto[];

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  journal?: string;

  @IsOptional()
  @IsString()
  coverLetter?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;
}

// ─── UPDATE STATUS (editor only) ─────────────────────────────────────────────

export class UpdateStatusDto {
  @IsEnum(PaperStatus, { message: 'Invalid paper status' })
  status: PaperStatus;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  // Editor's message to the author when making a decision
  editorComments?: string;

  @IsOptional()
  @IsString()
  // Internal editor notes — not shown to authors
  editorNotes?: string;

  @IsOptional()
  // Volume number when publishing
  volume?: number;

  @IsOptional()
  issue?: number;

  @IsOptional()
  @IsString()
  doi?: string;
}

// ─── SUBMIT REVISION (author) ─────────────────────────────────────────────────

export class SubmitRevisionDto {
  @IsNotEmpty()
  @IsString()
  // URL of the revised paper PDF
  fileUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  // Author's response to the reviewers — what changes they made
  revisionNote?: string;
}

// ─── QUERY PARAMS FOR LISTING PAPERS ─────────────────────────────────────────

export class PaperQueryDto {
  @IsOptional()
  @IsEnum(PaperStatus)
  status?: PaperStatus;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  // Full text search query
  search?: string;

  @IsOptional()
  // Page number for pagination (default 1)
  page?: number;

  @IsOptional()
  // Results per page (default 10)
  limit?: number;
}
