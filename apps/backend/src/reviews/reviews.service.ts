/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
// PURPOSE: All review assignment and submission logic.
//
// KEY CONCEPTS:
//
// 1. REVIEWS LIVE INSIDE PAPERS
//    We don't have a separate Reviews collection. Reviews are embedded
//    inside paper.reviewRounds[n].reviews[]. This means all review
//    operations are actually updates to the Paper document.
//
// 2. REVIEW ROUNDS
//    Each time a paper goes through review (including after revisions),
//    a new round is created. Reviewers are assigned per round.
//
// 3. INVITATION SYSTEM
//    Assigning a reviewer creates a review entry with isSubmitted: false.
//    The reviewer then accepts or declines. If they decline, the entry
//    is removed and the editor assigns someone else.

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Paper,
  PaperDocument,
  PaperStatus,
} from '../papers/schema/paper.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import {
  AssignReviewersDto,
  RespondToInvitationDto,
  SubmitReviewDto,
} from './dto/reviews.dto';
import { MailService } from '../auth/mail.service';
import { Role } from '../common/enums/role.enum';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Paper.name) private paperModel: Model<PaperDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private mailService: MailService,
    private notificationsService: NotificationsService,
  ) {}

  // ─── ASSIGN REVIEWERS (editor) ─────────────────────────────────────────────
  // Editor picks reviewers from the reviewer pool and assigns them to a paper.
  // Each assignment creates a pending review entry in the current round.

  async assignReviewers(
    paperId: string,
    dto: AssignReviewersDto,
    editorId: string,
  ) {
    const paper = await this.findPaperById(paperId);

    // Can only assign reviewers when paper is under review
    if (paper.status !== PaperStatus.UNDER_REVIEW) {
      throw new BadRequestException(
        `Reviewers can only be assigned to papers that are under review. Current status: ${paper.status}`,
      );
    }

    // Get the current (latest) review round index
    const currentRoundIndex = paper.reviewRounds.length - 1;

    if (currentRoundIndex < 0) {
      throw new BadRequestException(
        'No review round found. Move the paper to under_review status first.',
      );
    }

    const currentRound = paper.reviewRounds[currentRoundIndex];

    // Validate all reviewer IDs exist and have reviewer role
    const reviewers = await this.userModel.find({
      _id: { $in: dto.reviewerIds.map((id) => new Types.ObjectId(id)) },
      role: Role.REVIEWER,
      isEmailVerified: true,
    });

    if (reviewers.length !== dto.reviewerIds.length) {
      throw new BadRequestException(
        'One or more reviewer IDs are invalid or do not belong to verified reviewers',
      );
    }

    // Check for duplicate assignments in this round
    const alreadyAssigned = currentRound.reviews.map((r) =>
      r.reviewerId.toString(),
    );

    const duplicates = dto.reviewerIds.filter((id) =>
      alreadyAssigned.includes(id),
    );

    if (duplicates.length > 0) {
      throw new BadRequestException(
        `These reviewers are already assigned to this round: ${duplicates.join(', ')}`,
      );
    }

    // Build new review entries for each reviewer
    const newReviews = reviewers.map((reviewer) => ({
      reviewerId: reviewer._id,
      reviewerName: reviewer.name,
      decision: null,
      comments: '',
      privateNotes: '',
      score: null,
      isSubmitted: false,
      submittedAt: null,
    }));

    // Push new review entries into the current round
    const updatePath = `reviewRounds.${currentRoundIndex}.reviews`;

    const updated = await this.paperModel.findByIdAndUpdate(
      paperId,
      { $push: { [updatePath]: { $each: newReviews } } },
      { new: true },
    );

    // Send email notification to each reviewer
    for (const reviewer of reviewers) {
      await this.mailService.sendReviewInvitationEmail(
        reviewer.email,
        reviewer.name,
        paper.title,
        paperId,
      );
    }

    // In-app notification for each reviewer
    for (const reviewer of reviewers) {
      await this.notificationsService.notifyReviewAssigned(
        (reviewer._id as any).toString(),
        paper.title,
        paperId,
      );
    }

    return {
      message: `${reviewers.length} reviewer(s) assigned successfully`,
      paper: updated.toJSON(),
    };
  }

  // ─── GET ALL REVIEWS FOR A PAPER (editor/admin) ────────────────────────────

  async getPaperReviews(paperId: string) {
    const paper = await this.findPaperById(paperId);
    return {
      paperId,
      title: paper.title,
      status: paper.status,
      reviewRounds: paper.reviewRounds,
    };
  }

  // ─── GET MY ASSIGNED REVIEWS (reviewer) ────────────────────────────────────
  // Returns all papers where the logged-in user is assigned as a reviewer.

  async getMyReviews(reviewerId: string) {
    // Find papers that have this reviewer in any review round
    const papers = await this.paperModel
      .find({
        'reviewRounds.reviews.reviewerId': new Types.ObjectId(reviewerId),
      })
      .select(
        'title abstract category journal status reviewRounds submissionDate',
      )
      .exec();

    // For each paper, extract only this reviewer's review data
    // We don't want to expose other reviewers' identities or comments
    const myReviews = papers.map((paper) => {
      const paperObj = paper.toJSON() as any;

      // Find all rounds where this reviewer is assigned
      const relevantRounds = paperObj.reviewRounds
        .map((round: any) => {
          const myReview = round.reviews.find(
            (r: any) => r.reviewerId.toString() === reviewerId,
          );

          if (!myReview) return null;

          return {
            round: round.round,
            myReview,
            // Only show editor decision if it's been made
            editorDecision: round.editorDecision,
            editorComments: round.editorComments,
          };
        })
        .filter(Boolean); // remove nulls

      return {
        paperId: paperObj.id,
        title: paperObj.title,
        abstract: paperObj.abstract,
        category: paperObj.category,
        status: paperObj.status,
        fileUrl: paper.fileUrl,
        rounds: relevantRounds,
      };
    });

    return myReviews;
  }

  // ─── GET SPECIFIC PAPER FOR REVIEWER ──────────────────────────────────────
  // Reviewer needs to read the full paper before submitting review.

  async getPaperForReview(paperId: string, reviewerId: string) {
    const paper = await this.findPaperById(paperId);

    // Confirm this reviewer is actually assigned to this paper
    const isAssigned = paper.reviewRounds.some((round) =>
      round.reviews.some((r) => r.reviewerId.toString() === reviewerId),
    );

    if (!isAssigned) {
      throw new ForbiddenException(
        'You are not assigned as a reviewer for this paper',
      );
    }

    // Return paper details but hide other reviewers' identities
    // (double-blind review — reviewers don't know who else is reviewing)
    const paperObj = paper.toJSON() as any;

    paperObj.reviewRounds = paperObj.reviewRounds.map((round: any) => ({
      ...round,
      reviews: round.reviews.filter(
        (r: any) => r.reviewerId.toString() === reviewerId,
      ),
      // Only show this reviewer's own review data
    }));

    return paperObj;
  }

  // ─── RESPOND TO INVITATION (reviewer) ─────────────────────────────────────
  // Reviewer accepts or declines the review assignment.

  async respondToInvitation(
    paperId: string,
    dto: RespondToInvitationDto,
    reviewerId: string,
  ) {
    const paper = await this.findPaperById(paperId);

    const currentRoundIndex = paper.reviewRounds.length - 1;

    if (currentRoundIndex < 0) {
      throw new NotFoundException('No active review round found');
    }

    const currentRound = paper.reviewRounds[currentRoundIndex];

    // Find this reviewer's entry in the current round
    const reviewIndex = currentRound.reviews.findIndex(
      (r) => r.reviewerId.toString() === reviewerId,
    );

    if (reviewIndex === -1) {
      throw new ForbiddenException(
        'You are not assigned as a reviewer for this paper in the current round',
      );
    }

    const review = currentRound.reviews[reviewIndex];

    // Can't respond if already submitted a review
    if (review.isSubmitted) {
      throw new BadRequestException(
        'You have already submitted your review for this paper',
      );
    }

    if (dto.accepted) {
      // Reviewer accepted — no change needed to the document,
      // just confirm. In a real app you might add an 'acceptedAt' field.
      return {
        message: 'Review assignment accepted. Please submit your review.',
      };
    } else {
      // Reviewer declined — remove them from this round
      const reviewPath = `reviewRounds.${currentRoundIndex}.reviews`;

      await this.paperModel.findByIdAndUpdate(paperId, {
        $pull: {
          [reviewPath]: { reviewerId: new Types.ObjectId(reviewerId) },
        },
      });

      return {
        message: 'Review assignment declined.',
        declineReason: dto.declineReason || '',
      };
    }
  }

  // ─── SUBMIT REVIEW (reviewer) ──────────────────────────────────────────────
  // The main action — reviewer submits their decision, comments, and score.

  async submitReview(
    paperId: string,
    dto: SubmitReviewDto,
    reviewerId: string,
  ) {
    const paper = await this.findPaperById(paperId);

    if (paper.status !== PaperStatus.UNDER_REVIEW) {
      throw new BadRequestException(
        'Reviews can only be submitted for papers that are under review',
      );
    }

    const currentRoundIndex = paper.reviewRounds.length - 1;

    if (currentRoundIndex < 0) {
      throw new NotFoundException('No active review round found');
    }

    const currentRound = paper.reviewRounds[currentRoundIndex];

    // Find this reviewer's position in the reviews array
    const reviewIndex = currentRound.reviews.findIndex(
      (r) => r.reviewerId.toString() === reviewerId,
    );

    if (reviewIndex === -1) {
      throw new ForbiddenException(
        'You are not assigned as a reviewer for this paper',
      );
    }

    if (currentRound.reviews[reviewIndex].isSubmitted) {
      throw new BadRequestException(
        'You have already submitted your review for this paper',
      );
    }

    // Use MongoDB positional path to update the specific review entry
    // reviewRounds.2.reviews.1 → round index 2, review index 1
    const reviewPath = `reviewRounds.${currentRoundIndex}.reviews.${reviewIndex}`;

    await this.paperModel.findByIdAndUpdate(paperId, {
      $set: {
        [`${reviewPath}.decision`]: dto.decision,
        [`${reviewPath}.comments`]: dto.comments,
        [`${reviewPath}.privateNotes`]: dto.privateNotes || '',
        [`${reviewPath}.score`]: dto.score,
        [`${reviewPath}.isSubmitted`]: true,
        [`${reviewPath}.submittedAt`]: new Date(),
      },
    });

    // Check if ALL reviewers in this round have now submitted
    // If yes → notify editor that all reviews are in
    const updatedPaper = await this.paperModel.findById(paperId);
    const updatedRound = updatedPaper.reviewRounds[currentRoundIndex];

    const allSubmitted = updatedRound.reviews.every((r) => r.isSubmitted);

    if (allSubmitted && updatedRound.reviews.length > 0) {
      // In a full app, notify the editor here via email/notification
      // For now we just log it
      if (allSubmitted && updatedRound.reviews.length > 0) {
        // Notify all editors
        const editors = await this.userModel
          .find({
            role: Role.EDITOR,
            isEmailVerified: true,
          })
          .select('_id');

        const editorIds = editors.map((e) => (e._id as any).toString());

        await this.notificationsService.notifyAllReviewsComplete(
          editorIds,
          paper.title,
          paperId,
        );
      }

      // Notify editors that a review was submitted
      const editors = await this.userModel
        .find({
          role: Role.EDITOR,
          isEmailVerified: true,
        })
        .select('_id name');

      const editorIds = editors.map((e) => (e._id as any).toString());

      const reviewer = await this.userModel.findById(reviewerId).select('name');

      await this.notificationsService.notifyReviewSubmitted(
        editorIds,
        reviewer?.name || 'A reviewer',
        paper.title,
        paperId,
      );
    }

    return {
      message: 'Review submitted successfully',
      allReviewsComplete: allSubmitted,
    };
  }

  // ─── REMOVE REVIEWER (editor) ──────────────────────────────────────────────
  // Editor can remove a reviewer from the current round
  // (e.g. if the reviewer has a conflict of interest)

  async removeReviewer(paperId: string, reviewerId: string, editorId: string) {
    const paper = await this.findPaperById(paperId);

    if (paper.status !== PaperStatus.UNDER_REVIEW) {
      throw new BadRequestException(
        'Can only remove reviewers from papers that are under review',
      );
    }

    const currentRoundIndex = paper.reviewRounds.length - 1;
    const reviewPath = `reviewRounds.${currentRoundIndex}.reviews`;

    const updated = await this.paperModel.findByIdAndUpdate(
      paperId,
      {
        $pull: {
          [reviewPath]: { reviewerId: new Types.ObjectId(reviewerId) },
        },
      },
      { new: true },
    );

    return {
      message: 'Reviewer removed successfully',
      paper: updated.toJSON(),
    };
  }

  // ─── PRIVATE HELPERS ───────────────────────────────────────────────────────

  private async findPaperById(paperId: string): Promise<PaperDocument> {
    if (!Types.ObjectId.isValid(paperId)) {
      throw new BadRequestException('Invalid paper ID format');
    }

    const paper = await this.paperModel.findById(paperId);
    if (!paper) throw new NotFoundException('Paper not found');
    return paper;
  }
}
