"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PapersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const paper_schema_1 = require("./schema/paper.schema");
const role_enum_1 = require("../common/enums/role.enum");
let PapersService = class PapersService {
    constructor(paperModel) {
        this.paperModel = paperModel;
        this.validTransitions = {
            [paper_schema_1.PaperStatus.DRAFT]: [paper_schema_1.PaperStatus.SUBMITTED],
            [paper_schema_1.PaperStatus.SUBMITTED]: [paper_schema_1.PaperStatus.UNDER_REVIEW, paper_schema_1.PaperStatus.REJECTED],
            [paper_schema_1.PaperStatus.UNDER_REVIEW]: [
                paper_schema_1.PaperStatus.ACCEPTED,
                paper_schema_1.PaperStatus.REVISION,
                paper_schema_1.PaperStatus.REJECTED,
            ],
            [paper_schema_1.PaperStatus.REVISION]: [paper_schema_1.PaperStatus.UNDER_REVIEW],
            [paper_schema_1.PaperStatus.ACCEPTED]: [paper_schema_1.PaperStatus.PUBLISHED],
            [paper_schema_1.PaperStatus.REJECTED]: [],
            [paper_schema_1.PaperStatus.PUBLISHED]: [],
        };
    }
    async createPaper(dto, userId, userName) {
        const isAuthorListed = dto.authors.some((a) => a.userId.toString() === userId);
        if (!isAuthorListed) {
            throw new common_1.BadRequestException('You must include yourself as one of the authors');
        }
        const paper = await this.paperModel.create({
            ...dto,
            authors: dto.authors.map((author) => ({
                ...author,
                userId: new mongoose_2.Types.ObjectId(author.userId),
            })),
            submittedBy: new mongoose_2.Types.ObjectId(userId),
            status: paper_schema_1.PaperStatus.DRAFT,
        });
        if (!paper) {
            throw new common_1.InternalServerErrorException('Failed to create paper');
        }
        return paper.toJSON();
    }
    async submitPaper(paperId, userId) {
        const paper = await this.findPaperById(paperId);
        this.checkOwnership(paper, userId);
        if (paper.status !== paper_schema_1.PaperStatus.DRAFT) {
            throw new common_1.BadRequestException(`Only draft papers can be submitted. Current status: ${paper.status}`);
        }
        if (!paper.fileUrl) {
            throw new common_1.BadRequestException('Please upload the paper PDF before submitting');
        }
        const updated = await this.paperModel.findByIdAndUpdate(paperId, {
            status: paper_schema_1.PaperStatus.SUBMITTED,
            submissionDate: new Date(),
        }, { new: true });
        return updated.toJSON();
    }
    async getMySubmissions(userId) {
        const papers = await this.paperModel
            .find({ submittedBy: new mongoose_2.Types.ObjectId(userId) })
            .select('-reviewRounds.reviews.privateNotes')
            .sort({ createdAt: -1 })
            .exec();
        return papers;
    }
    async getAllPapers(query) {
        const { status, category, search, page = 1, limit = 10 } = query;
        const filter = {};
        if (status)
            filter.status = status;
        if (category)
            filter.category = { $regex: category, $options: 'i' };
        if (search) {
            filter.$text = { $search: search };
        }
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
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getPublishedPapers(query) {
        const { category, search, page = 1, limit = 10 } = query;
        const filter = { status: paper_schema_1.PaperStatus.PUBLISHED };
        if (category)
            filter.category = { $regex: category, $options: 'i' };
        if (search)
            filter.$text = { $search: search };
        const skip = (page - 1) * limit;
        const [papers, total] = await Promise.all([
            this.paperModel
                .find(filter)
                .select('title abstract keywords authors category journal publishedDate doi volume issue')
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
    async getPaperById(paperId, userId, userRole) {
        const paper = await this.findPaperById(paperId);
        if (paper.status === paper_schema_1.PaperStatus.PUBLISHED) {
            return paper.toJSON();
        }
        const isOwner = paper.submittedBy.toString() === userId;
        const isEditorOrAdmin = [role_enum_1.Role.EDITOR, role_enum_1.Role.ADMIN].includes(userRole);
        if (!isOwner && !isEditorOrAdmin) {
            throw new common_1.ForbiddenException('You do not have access to this paper');
        }
        const paperObj = paper.toJSON();
        if (isOwner && !isEditorOrAdmin) {
            paperObj.reviewRounds = paperObj.reviewRounds?.map((round) => ({
                ...round,
                reviews: round.reviews?.map((review) => {
                    const { privateNotes, ...publicReview } = review;
                    return publicReview;
                }),
            }));
        }
        return paperObj;
    }
    async updatePaper(paperId, dto, userId) {
        const paper = await this.findPaperById(paperId);
        this.checkOwnership(paper, userId);
        if (paper.status !== paper_schema_1.PaperStatus.DRAFT) {
            throw new common_1.BadRequestException('Only draft papers can be edited.');
        }
        const cleanDto = Object.fromEntries(Object.entries(dto).filter(([_, value]) => value !== '' && value !== null && value !== undefined));
        const updated = await this.paperModel.findByIdAndUpdate(paperId, { $set: cleanDto }, { new: true, runValidators: true });
        return updated.toJSON();
    }
    async updateStatus(paperId, dto, editorId) {
        const paper = await this.findPaperById(paperId);
        const allowedNextStatuses = this.validTransitions[paper.status];
        if (!allowedNextStatuses.includes(dto.status)) {
            throw new common_1.BadRequestException(`Cannot move paper from '${paper.status}' to '${dto.status}'. ` +
                `Allowed transitions: ${allowedNextStatuses.join(', ') || 'none'}`);
        }
        const updateData = { status: dto.status };
        if (dto.status === paper_schema_1.PaperStatus.UNDER_REVIEW) {
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
        if ([
            paper_schema_1.PaperStatus.ACCEPTED,
            paper_schema_1.PaperStatus.REJECTED,
            paper_schema_1.PaperStatus.REVISION,
        ].includes(dto.status)) {
            const lastRoundIndex = (paper.reviewRounds?.length || 1) - 1;
            updateData[`reviewRounds.${lastRoundIndex}.editorDecision`] = dto.status;
            updateData[`reviewRounds.${lastRoundIndex}.editorComments`] =
                dto.editorComments || '';
            updateData[`reviewRounds.${lastRoundIndex}.decidedAt`] = new Date();
        }
        if (dto.status === paper_schema_1.PaperStatus.PUBLISHED) {
            updateData.publishedDate = new Date();
            if (dto.doi)
                updateData.doi = dto.doi;
            if (dto.volume)
                updateData.volume = dto.volume;
            if (dto.issue)
                updateData.issue = dto.issue;
        }
        if (dto.editorNotes)
            updateData.editorNotes = dto.editorNotes;
        const updated = await this.paperModel.findByIdAndUpdate(paperId, updateData, { new: true });
        return updated.toJSON();
    }
    async submitRevision(paperId, dto, userId) {
        const paper = await this.findPaperById(paperId);
        this.checkOwnership(paper, userId);
        if (paper.status !== paper_schema_1.PaperStatus.REVISION) {
            throw new common_1.BadRequestException('Revisions can only be submitted for papers with revision status');
        }
        const updated = await this.paperModel.findByIdAndUpdate(paperId, {
            fileUrl: dto.fileUrl,
            status: paper_schema_1.PaperStatus.UNDER_REVIEW,
            $push: {
                reviewRounds: {
                    round: (paper.reviewRounds?.length || 0) + 1,
                    reviews: [],
                    editorDecision: null,
                    editorComments: dto.revisionNote || '',
                    decidedAt: null,
                },
            },
        }, { new: true });
        return updated.toJSON();
    }
    async deletePaper(paperId, userId, userRole) {
        const paper = await this.findPaperById(paperId);
        if (userRole !== role_enum_1.Role.ADMIN) {
            this.checkOwnership(paper, userId);
            if (paper.status !== paper_schema_1.PaperStatus.DRAFT) {
                throw new common_1.BadRequestException('Only draft papers can be deleted. Contact an editor for submitted papers.');
            }
        }
        await this.paperModel.findByIdAndDelete(paperId);
        return { message: 'Paper deleted successfully' };
    }
    async findPaperById(paperId) {
        if (!mongoose_2.Types.ObjectId.isValid(paperId)) {
            throw new common_1.BadRequestException('Invalid paper ID format');
        }
        const paper = await this.paperModel.findById(paperId);
        if (!paper)
            throw new common_1.NotFoundException('Paper not found');
        return paper;
    }
    checkOwnership(paper, userId) {
        if (paper.submittedBy.toString() !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to modify this paper');
        }
    }
};
exports.PapersService = PapersService;
exports.PapersService = PapersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(paper_schema_1.Paper.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PapersService);
//# sourceMappingURL=papers.service.js.map