/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// PURPOSE: All paper management business logic.
//
// THE STATE MACHINE:
// The most important thing here is enforcing valid status transitions.
// We never allow arbitrary status changes — only valid transitions are permitted.
// This prevents data corruption (e.g. moving a rejected paper to published).

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Paper, PaperDocument, PaperStatus } from './schema/paper.schema';
import {
  CreatePaperDto,
  UpdatePaperDto,
  UpdateStatusDto,
  SubmitRevisionDto,
  PaperQueryDto,
} from './dto/paper.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class PapersService {
  constructor(
    @InjectModel(Paper.name) private paperModel: Model<PaperDocument>,
  ) {}

  // ─── VALID STATUS TRANSITIONS ───────────────────────────────────────────────
  // This map defines what status an editor can move a paper TO
  // based on what status it's currently IN.
  // Any transition not in this map is FORBIDDEN.
  private readonly validTransitions: Record<PaperStatus, PaperStatus[]> = {
    [PaperStatus.DRAFT]: [PaperStatus.SUBMITTED],
    [PaperStatus.SUBMITTED]: [PaperStatus.UNDER_REVIEW, PaperStatus.REJECTED],
    [PaperStatus.UNDER_REVIEW]: [
      PaperStatus.ACCEPTED,
      PaperStatus.REVISION,
      PaperStatus.REJECTED,
    ],
    [PaperStatus.REVISION]: [PaperStatus.UNDER_REVIEW],
    [PaperStatus.ACCEPTED]: [PaperStatus.PUBLISHED],
    [PaperStatus.REJECTED]: [],
    [PaperStatus.PUBLISHED]: [],
  };

  // ─── CREATE / SAVE DRAFT ────────────────────────────────────────────────────
  // Author creates a paper. If they set status to 'submitted', it goes to
  // the editor queue immediately. Otherwise it saves as a draft.

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createPaper(dto: CreatePaperDto, userId: string, userName: string) {
    // Make sure the submitting user is listed as one of the authors
    const isAuthorListed = dto.authors.some(
      (a) => a.userId.toString() === userId,
    );

    if (!isAuthorListed) {
      throw new BadRequestException(
        'You must include yourself as one of the authors',
      );
    }

    const paper = await this.paperModel.create({
      ...dto,
      authors: dto.authors.map((author) => ({
        ...author,
        userId: new Types.ObjectId(author.userId),
      })),
      submittedBy: new Types.ObjectId(userId),
      status: PaperStatus.DRAFT,
      // submissionDate is set when the paper moves to 'submitted' status
    });

    if (!paper) {
      throw new InternalServerErrorException('Failed to create paper');
    }

    return paper.toJSON();
  }

  // ─── SUBMIT PAPER (draft → submitted) ──────────────────────────────────────
  // Separate from create — author explicitly submits when ready.
  // Can also be done in one step by creating with status: 'submitted'.

  async submitPaper(paperId: string, userId: string) {
    const paper = await this.findPaperById(paperId);

    // Only the submitting author can submit
    this.checkOwnership(paper, userId);

    if (paper.status !== PaperStatus.DRAFT) {
      throw new BadRequestException(
        `Only draft papers can be submitted. Current status: ${paper.status}`,
      );
    }

    if (!paper.fileUrl) {
      throw new BadRequestException(
        'Please upload the paper PDF before submitting',
      );
    }

    const updated = await this.paperModel.findByIdAndUpdate(
      paperId,
      {
        status: PaperStatus.SUBMITTED,
        submissionDate: new Date(),
      },
      { new: true },
    );

    return updated.toJSON();
  }

  // ─── GET MY SUBMISSIONS (author) ───────────────────────────────────────────

  async getMySubmissions(userId: string) {
    const papers = await this.paperModel
      .find({ submittedBy: new Types.ObjectId(userId) })
      .select('-reviewRounds.reviews.privateNotes')
      // Authors cannot see reviewers' private notes
      .sort({ createdAt: -1 })
      .exec();

    return papers;
  }

  // ─── GET ALL PAPERS (editor/admin) ─────────────────────────────────────────
  // Supports filtering by status, category, and full-text search.
  // Also supports pagination.

  async getAllPapers(query: PaperQueryDto) {
    const { status, category, search, page = 1, limit = 10 } = query;

    // Build filter object dynamically based on query params
    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = { $regex: category, $options: 'i' };
    // $regex with $options: 'i' → case-insensitive partial match

    if (search) {
      // $text uses the text index we defined on the schema
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    // skip → how many documents to skip for pagination
    // e.g. page 2, limit 10 → skip 10

    const [papers, total] = await Promise.all([
      this.paperModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.paperModel.countDocuments(filter),
      // Count total matching documents for frontend pagination
    ]);

    return {
      papers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── GET PUBLISHED PAPERS (public) ─────────────────────────────────────────
  // No authentication required — anyone can browse published papers.

  async getPublishedPapers(query: PaperQueryDto) {
    const { category, search, page = 1, limit = 10 } = query;

    const filter: any = { status: PaperStatus.PUBLISHED };
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;

    const [papers, total] = await Promise.all([
      this.paperModel
        .find(filter)
        .select(
          'title abstract keywords authors category journal publishedDate doi volume issue',
        )
        // Public listing only shows metadata, not internal review history
        .sort({ publishedDate: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.paperModel.countDocuments(filter),
    ]);

    return {
      papers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── GET SINGLE PAPER ──────────────────────────────────────────────────────
  // What data is shown depends on the user's role:
  // - Author: sees own paper without private notes
  // - Editor/Admin: sees full paper including private notes
  // - Public: sees published papers only

  async getPaperById(paperId: string, userId: string, userRole: string) {
    const paper = await this.findPaperById(paperId);

    // Public paper — anyone can see it
    if (paper.status === PaperStatus.PUBLISHED) {
      return paper.toJSON();
    }

    // Non-published paper — must be owner, editor, or admin
    const isOwner = paper.submittedBy.toString() === userId;
    const isEditorOrAdmin = [Role.EDITOR, Role.ADMIN].includes(
      userRole as Role,
    );

    if (!isOwner && !isEditorOrAdmin) {
      throw new ForbiddenException('You do not have access to this paper');
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const paperObj = paper.toJSON() as any;

    // Strip private notes for authors
    if (isOwner && !isEditorOrAdmin) {
      paperObj.reviewRounds = paperObj.reviewRounds?.map((round: any) => ({
        ...round,
        reviews: round.reviews?.map((review: any) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { privateNotes, ...publicReview } = review;
          return publicReview;
        }),
      }));
    }

    return paperObj;
  }

  // ─── UPDATE PAPER (author, draft only) ─────────────────────────────────────

  async updatePaper(paperId: string, dto: UpdatePaperDto, userId: string) {
    const paper = await this.findPaperById(paperId);

    this.checkOwnership(paper, userId);

    if (paper.status !== PaperStatus.DRAFT) {
      throw new BadRequestException('Only draft papers can be edited.');
    }

    // Remove any empty string values from the update
    // so they don't overwrite existing valid data
    const cleanDto = Object.fromEntries(
      Object.entries(dto).filter(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, value]) => value !== '' && value !== null && value !== undefined,
      ),
    );

    const updated = await this.paperModel.findByIdAndUpdate(
      paperId,
      { $set: cleanDto },
      { new: true, runValidators: true },
    );

    return updated.toJSON();
  }

  // ─── UPDATE STATUS (editor only) ───────────────────────────────────────────
  // This is the state machine enforcer.
  // Editors move papers through the workflow here.

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateStatus(paperId: string, dto: UpdateStatusDto, editorId: string) {
    const paper = await this.findPaperById(paperId);

    // Check if this transition is allowed
    const allowedNextStatuses = this.validTransitions[paper.status];

    if (!allowedNextStatuses.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot move paper from '${paper.status}' to '${dto.status}'. ` +
          `Allowed transitions: ${allowedNextStatuses.join(', ') || 'none'}`,
      );
    }

    const updateData: any = { status: dto.status };

    // When moving to UNDER_REVIEW — start a new review round
    if (dto.status === PaperStatus.UNDER_REVIEW) {
      const currentRound = paper.reviewRounds?.length || 0;
      updateData.$push = {
        reviewRounds: {
          round: currentRound + 1,
          reviews: [],
          editorDecision: null,
          editorComments: dto.editorComments || '',
          decidedAt: null,
        },
      };
    }

    // When making a final decision (accept/reject/revision)
    if (
      [
        PaperStatus.ACCEPTED,
        PaperStatus.REJECTED,
        PaperStatus.REVISION,
      ].includes(dto.status)
    ) {
      const lastRoundIndex = (paper.reviewRounds?.length || 1) - 1;
      updateData[`reviewRounds.${lastRoundIndex}.editorDecision`] = dto.status;
      updateData[`reviewRounds.${lastRoundIndex}.editorComments`] =
        dto.editorComments || '';
      updateData[`reviewRounds.${lastRoundIndex}.decidedAt`] = new Date();
    }

    // When publishing
    if (dto.status === PaperStatus.PUBLISHED) {
      updateData.publishedDate = new Date();
      if (dto.doi) updateData.doi = dto.doi;
      if (dto.volume) updateData.volume = dto.volume;
      if (dto.issue) updateData.issue = dto.issue;
    }

    if (dto.editorNotes) updateData.editorNotes = dto.editorNotes;

    const updated = await this.paperModel.findByIdAndUpdate(
      paperId,
      updateData,
      { new: true },
    );

    return updated.toJSON();
  }

  // ─── SUBMIT REVISION (author) ──────────────────────────────────────────────
  // After an editor requests revision, the author uploads the revised paper.
  // This moves the paper back to UNDER_REVIEW for another round.

  async submitRevision(
    paperId: string,
    dto: SubmitRevisionDto,
    userId: string,
  ) {
    const paper = await this.findPaperById(paperId);

    this.checkOwnership(paper, userId);

    if (paper.status !== PaperStatus.REVISION) {
      throw new BadRequestException(
        'Revisions can only be submitted for papers with revision status',
      );
    }

    const updated = await this.paperModel.findByIdAndUpdate(
      paperId,
      {
        fileUrl: dto.fileUrl,
        status: PaperStatus.UNDER_REVIEW,
        // Push a new review round for the revision
        $push: {
          reviewRounds: {
            round: (paper.reviewRounds?.length || 0) + 1,
            reviews: [],
            editorDecision: null,
            editorComments: dto.revisionNote || '',
            decidedAt: null,
          },
        },
      },
      { new: true },
    );

    return updated.toJSON();
  }

  // ─── DELETE PAPER (author, draft only) ─────────────────────────────────────

  async deletePaper(paperId: string, userId: string, userRole: string) {
    const paper = await this.findPaperById(paperId);

    // Admins can delete any paper, authors can only delete their own drafts
    if (userRole !== Role.ADMIN) {
      this.checkOwnership(paper, userId);

      if (paper.status !== PaperStatus.DRAFT) {
        throw new BadRequestException(
          'Only draft papers can be deleted. Contact an editor for submitted papers.',
        );
      }
    }

    await this.paperModel.findByIdAndDelete(paperId);

    return { message: 'Paper deleted successfully' };
  }

  // ─── PRIVATE HELPERS ───────────────────────────────────────────────────────

  private async findPaperById(paperId: string): Promise<PaperDocument> {
    // Validate MongoDB ObjectId format before querying
    if (!Types.ObjectId.isValid(paperId)) {
      throw new BadRequestException('Invalid paper ID format');
    }

    const paper = await this.paperModel.findById(paperId);
    if (!paper) throw new NotFoundException('Paper not found');
    return paper;
  }

  private checkOwnership(paper: PaperDocument, userId: string) {
    if (paper.submittedBy.toString() !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this paper',
      );
    }
  }
}
