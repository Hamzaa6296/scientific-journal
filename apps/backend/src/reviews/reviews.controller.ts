/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// PURPOSE: HTTP routes for /api/reviews/*.
//
// ROLE BREAKDOWN:
// Editor  → assign reviewers, view all reviews, remove reviewers
// Reviewer → see assigned papers, accept/decline, submit review
// Admin   → same as editor

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import {
  AssignReviewersDto,
  RespondToInvitationDto,
  SubmitReviewDto,
} from './dto/reviews.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorators';
import { Role } from '../common/enums/role.enum';

@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ─── EDITOR ROUTES ─────────────────────────────────────────────────────────

  // POST /api/reviews/:paperId/assign
  // Editor assigns reviewers to a paper that is under_review
  @Post(':paperId/assign')
  @Roles(Role.EDITOR, Role.ADMIN)
  assignReviewers(
    @Param('paperId') paperId: string,
    @Body() dto: AssignReviewersDto,
    @Request() req,
  ) {
    return this.reviewsService.assignReviewers(paperId, dto, req.user.userId);
  }

  // GET /api/reviews/:paperId
  // Editor sees all reviews for a specific paper including all rounds
  @Get(':paperId/all')
  @Roles(Role.EDITOR, Role.ADMIN)
  getPaperReviews(@Param('paperId') paperId: string) {
    return this.reviewsService.getPaperReviews(paperId);
  }

  // DELETE /api/reviews/:paperId/reviewer/:reviewerId
  // Editor removes a reviewer from the current round
  @Delete(':paperId/reviewer/:reviewerId')
  @Roles(Role.EDITOR, Role.ADMIN)
  removeReviewer(
    @Param('paperId') paperId: string,
    @Param('reviewerId') reviewerId: string,
    @Request() req,
  ) {
    return this.reviewsService.removeReviewer(
      paperId,
      reviewerId,
      req.user.userId,
    );
  }

  // ─── REVIEWER ROUTES ───────────────────────────────────────────────────────

  // GET /api/reviews/my-reviews
  // Reviewer sees all papers assigned to them
  // MUST come before /:paperId to avoid route conflict
  @Get('my-reviews')
  @Roles(Role.REVIEWER)
  getMyReviews(@Request() req) {
    return this.reviewsService.getMyReviews(req.user.userId);
  }

  // GET /api/reviews/my-reviews/:paperId
  // Reviewer reads a specific paper assigned to them
  @Get('my-reviews/:paperId')
  @Roles(Role.REVIEWER)
  getPaperForReview(@Param('paperId') paperId: string, @Request() req) {
    return this.reviewsService.getPaperForReview(paperId, req.user.userId);
  }

  // PATCH /api/reviews/:paperId/respond
  // Reviewer accepts or declines the invitation
  @Patch(':paperId/respond')
  @Roles(Role.REVIEWER)
  respondToInvitation(
    @Param('paperId') paperId: string,
    @Body() dto: RespondToInvitationDto,
    @Request() req,
  ) {
    return this.reviewsService.respondToInvitation(
      paperId,
      dto,
      req.user.userId,
    );
  }

  // PATCH /api/reviews/:paperId/submit
  // Reviewer submits their completed review
  @Patch(':paperId/submit')
  @Roles(Role.REVIEWER)
  submitReview(
    @Param('paperId') paperId: string,
    @Body() dto: SubmitReviewDto,
    @Request() req,
  ) {
    return this.reviewsService.submitReview(paperId, dto, req.user.userId);
  }
}
