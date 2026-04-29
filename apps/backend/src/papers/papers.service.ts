/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

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
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class PapersService {
  constructor(
    @InjectModel(Paper.name) private paperModel: Model<PaperDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notificationsService: NotificationsService,
  ) {}

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

  // ─── CREATE DRAFT ──────────────────────────────────────────────────────────

  async createPaper(dto: CreatePaperDto, userId: string, userName: string) {
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
    });

    if (!paper) {
      throw new InternalServerErrorException('Failed to create paper');
    }

    return paper.toJSON();
  }

  // ─── SUBMIT PAPER (draft → submitted) ─────────────────────────────────────

  async submitPaper(paperId: string, userId: string) {
    const paper = await this.findPaperById(paperId);
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
      { status: PaperStatus.SUBMITTED, submissionDate: new Date() },
      { new: true },
    );

    const editors = await this.userModel
      .find({ role: Role.EDITOR, isEmailVerified: true })
      .select('_id');

    const editorIds = editors.map((e) => (e._id as any).toString());

    if (editorIds.length > 0) {
      await this.notificationsService.notifyPaperSubmitted(
        editorIds,
        userId,
        paper.title,
        paperId,
      );
    }

    return updated.toJSON();
  }

  // ─── GET MY SUBMISSIONS ────────────────────────────────────────────────────

  async getMySubmissions(userId: string) {
    const papers = await this.paperModel
      .find({ submittedBy: new Types.ObjectId(userId) })
      .select('-reviewRounds.reviews.privateNotes')
      .sort({ createdAt: -1 })
      .exec();

    return papers;
  }

  // ─── GET ALL PAPERS ────────────────────────────────────────────────────────

  async getAllPapers(query: PaperQueryDto) {
    const { status, category, search, page = 1, limit = 10 } = query;

    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;

    const [papers, total] = await Promise.all([
      this.paperModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.paperModel.countDocuments(filter),
    ]);

    return {
      papers,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── GET PUBLISHED PAPERS ──────────────────────────────────────────────────

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
        .sort({ publishedDate: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.paperModel.countDocuments(filter),
    ]);

    return {
      papers,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── GET SINGLE PAPER ──────────────────────────────────────────────────────

  async getPaperById(paperId: string, userId: string, userRole: string) {
    const paper = await this.findPaperById(paperId);

    if (paper.status === PaperStatus.PUBLISHED) {
      return paper.toJSON();
    }

    const isOwner = paper.submittedBy.toString() === userId;
    const isEditorOrAdmin = [Role.EDITOR, Role.ADMIN].includes(
      userRole as Role,
    );

    if (!isOwner && !isEditorOrAdmin) {
      throw new ForbiddenException('You do not have access to this paper');
    }

    const paperObj = paper.toJSON() as any;

    if (isOwner && !isEditorOrAdmin) {
      paperObj.reviewRounds = paperObj.reviewRounds?.map((round: any) => ({
        ...round,
        reviews: round.reviews?.map((review: any) => {
          const { privateNotes, ...publicReview } = review;
          return publicReview;
        }),
      }));
    }

    return paperObj;
  }

  // ─── UPDATE PAPER (draft only) ─────────────────────────────────────────────

  async updatePaper(paperId: string, dto: UpdatePaperDto, userId: string) {
    const paper = await this.findPaperById(paperId);
    this.checkOwnership(paper, userId);

    if (paper.status !== PaperStatus.DRAFT) {
      throw new BadRequestException('Only draft papers can be edited.');
    }

    const cleanDto = Object.fromEntries(
      Object.entries(dto).filter(
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

  async updateStatus(paperId: string, dto: UpdateStatusDto, editorId: string) {
    const paper = await this.findPaperById(paperId);

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

    // ─── NOTIFY AUTHORS ON STATUS CHANGE ───────────────────────────────────
    const notifyStatuses = [
      PaperStatus.UNDER_REVIEW,
      PaperStatus.ACCEPTED,
      PaperStatus.REJECTED,
      PaperStatus.REVISION,
      PaperStatus.PUBLISHED,
    ];

    if (notifyStatuses.includes(dto.status)) {
      const typeMap: Record<string, NotificationType> = {
        [PaperStatus.UNDER_REVIEW]: NotificationType.PAPER_UNDER_REVIEW,
        [PaperStatus.ACCEPTED]: NotificationType.PAPER_ACCEPTED,
        [PaperStatus.REJECTED]: NotificationType.PAPER_REJECTED,
        [PaperStatus.REVISION]: NotificationType.PAPER_REVISION,
        [PaperStatus.PUBLISHED]: NotificationType.PAPER_PUBLISHED,
      };

      const authorIds = paper.authors.map((a) => a.userId.toString());

      await this.notificationsService.notifyPaperDecision(
        authorIds,
        typeMap[dto.status],
        paper.title,
        paperId,
        dto.editorComments,
      );
    }

    return updated.toJSON(); // ← single return, correct place
  }

  // ─── SUBMIT REVISION (author) ──────────────────────────────────────────────

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

    // updateData defined HERE — this is where it belongs
    const updated = await this.paperModel.findByIdAndUpdate(
      paperId,
      {
        fileUrl: dto.fileUrl,
        status: PaperStatus.UNDER_REVIEW,
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

    return updated.toJSON(); // ← single return, correct place
  }

  // ─── DELETE PAPER ──────────────────────────────────────────────────────────

  async deletePaper(paperId: string, userId: string, userRole: string) {
    const paper = await this.findPaperById(paperId);

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
