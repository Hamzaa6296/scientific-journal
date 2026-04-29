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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const paper_schema_1 = require("../papers/schema/paper.schema");
const user_schema_1 = require("../auth/schemas/user.schema");
const mail_service_1 = require("../auth/mail.service");
const role_enum_1 = require("../common/enums/role.enum");
const notifications_service_1 = require("../notifications/notifications.service");
let ReviewsService = class ReviewsService {
    constructor(paperModel, userModel, mailService, notificationsService) {
        this.paperModel = paperModel;
        this.userModel = userModel;
        this.mailService = mailService;
        this.notificationsService = notificationsService;
    }
    async assignReviewers(paperId, dto, editorId) {
        const paper = await this.findPaperById(paperId);
        if (paper.status !== paper_schema_1.PaperStatus.UNDER_REVIEW) {
            throw new common_1.BadRequestException(`Reviewers can only be assigned to papers that are under review. Current status: ${paper.status}`);
        }
        const currentRoundIndex = paper.reviewRounds.length - 1;
        if (currentRoundIndex < 0) {
            throw new common_1.BadRequestException('No review round found. Move the paper to under_review status first.');
        }
        const currentRound = paper.reviewRounds[currentRoundIndex];
        const reviewers = await this.userModel.find({
            _id: { $in: dto.reviewerIds.map((id) => new mongoose_2.Types.ObjectId(id)) },
            role: role_enum_1.Role.REVIEWER,
            isEmailVerified: true,
        });
        if (reviewers.length !== dto.reviewerIds.length) {
            throw new common_1.BadRequestException('One or more reviewer IDs are invalid or do not belong to verified reviewers');
        }
        const alreadyAssigned = currentRound.reviews.map((r) => r.reviewerId.toString());
        const duplicates = dto.reviewerIds.filter((id) => alreadyAssigned.includes(id));
        if (duplicates.length > 0) {
            throw new common_1.BadRequestException(`These reviewers are already assigned to this round: ${duplicates.join(', ')}`);
        }
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
        const updatePath = `reviewRounds.${currentRoundIndex}.reviews`;
        const updated = await this.paperModel.findByIdAndUpdate(paperId, { $push: { [updatePath]: { $each: newReviews } } }, { new: true });
        for (const reviewer of reviewers) {
            await this.mailService.sendReviewInvitationEmail(reviewer.email, reviewer.name, paper.title, paperId);
        }
        for (const reviewer of reviewers) {
            await this.notificationsService.notifyReviewAssigned(reviewer._id.toString(), paper.title, paperId);
        }
        return {
            message: `${reviewers.length} reviewer(s) assigned successfully`,
            paper: updated.toJSON(),
        };
    }
    async getPaperReviews(paperId) {
        const paper = await this.findPaperById(paperId);
        return {
            paperId,
            title: paper.title,
            status: paper.status,
            reviewRounds: paper.reviewRounds,
        };
    }
    async getMyReviews(reviewerId) {
        const papers = await this.paperModel
            .find({
            'reviewRounds.reviews.reviewerId': new mongoose_2.Types.ObjectId(reviewerId),
        })
            .select('title abstract category journal status reviewRounds submissionDate')
            .exec();
        const myReviews = papers.map((paper) => {
            const paperObj = paper.toJSON();
            const relevantRounds = paperObj.reviewRounds
                .map((round) => {
                const myReview = round.reviews.find((r) => r.reviewerId.toString() === reviewerId);
                if (!myReview)
                    return null;
                return {
                    round: round.round,
                    myReview,
                    editorDecision: round.editorDecision,
                    editorComments: round.editorComments,
                };
            })
                .filter(Boolean);
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
    async getPaperForReview(paperId, reviewerId) {
        const paper = await this.findPaperById(paperId);
        const isAssigned = paper.reviewRounds.some((round) => round.reviews.some((r) => r.reviewerId.toString() === reviewerId));
        if (!isAssigned) {
            throw new common_1.ForbiddenException('You are not assigned as a reviewer for this paper');
        }
        const paperObj = paper.toJSON();
        paperObj.reviewRounds = paperObj.reviewRounds.map((round) => ({
            ...round,
            reviews: round.reviews.filter((r) => r.reviewerId.toString() === reviewerId),
        }));
        return paperObj;
    }
    async respondToInvitation(paperId, dto, reviewerId) {
        const paper = await this.findPaperById(paperId);
        const currentRoundIndex = paper.reviewRounds.length - 1;
        if (currentRoundIndex < 0) {
            throw new common_1.NotFoundException('No active review round found');
        }
        const currentRound = paper.reviewRounds[currentRoundIndex];
        const reviewIndex = currentRound.reviews.findIndex((r) => r.reviewerId.toString() === reviewerId);
        if (reviewIndex === -1) {
            throw new common_1.ForbiddenException('You are not assigned as a reviewer for this paper in the current round');
        }
        const review = currentRound.reviews[reviewIndex];
        if (review.isSubmitted) {
            throw new common_1.BadRequestException('You have already submitted your review for this paper');
        }
        if (dto.accepted) {
            return {
                message: 'Review assignment accepted. Please submit your review.',
            };
        }
        else {
            const reviewPath = `reviewRounds.${currentRoundIndex}.reviews`;
            await this.paperModel.findByIdAndUpdate(paperId, {
                $pull: {
                    [reviewPath]: { reviewerId: new mongoose_2.Types.ObjectId(reviewerId) },
                },
            });
            return {
                message: 'Review assignment declined.',
                declineReason: dto.declineReason || '',
            };
        }
    }
    async submitReview(paperId, dto, reviewerId) {
        const paper = await this.findPaperById(paperId);
        if (paper.status !== paper_schema_1.PaperStatus.UNDER_REVIEW) {
            throw new common_1.BadRequestException('Reviews can only be submitted for papers that are under review');
        }
        const currentRoundIndex = paper.reviewRounds.length - 1;
        if (currentRoundIndex < 0) {
            throw new common_1.NotFoundException('No active review round found');
        }
        const currentRound = paper.reviewRounds[currentRoundIndex];
        const reviewIndex = currentRound.reviews.findIndex((r) => r.reviewerId.toString() === reviewerId);
        if (reviewIndex === -1) {
            throw new common_1.ForbiddenException('You are not assigned as a reviewer for this paper');
        }
        if (currentRound.reviews[reviewIndex].isSubmitted) {
            throw new common_1.BadRequestException('You have already submitted your review for this paper');
        }
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
        const updatedPaper = await this.paperModel.findById(paperId);
        const updatedRound = updatedPaper.reviewRounds[currentRoundIndex];
        const allSubmitted = updatedRound.reviews.every((r) => r.isSubmitted);
        if (allSubmitted && updatedRound.reviews.length > 0) {
            if (allSubmitted && updatedRound.reviews.length > 0) {
                const editors = await this.userModel
                    .find({
                    role: role_enum_1.Role.EDITOR,
                    isEmailVerified: true,
                })
                    .select('_id');
                const editorIds = editors.map((e) => e._id.toString());
                await this.notificationsService.notifyAllReviewsComplete(editorIds, paper.title, paperId);
            }
            const editors = await this.userModel
                .find({
                role: role_enum_1.Role.EDITOR,
                isEmailVerified: true,
            })
                .select('_id name');
            const editorIds = editors.map((e) => e._id.toString());
            const reviewer = await this.userModel.findById(reviewerId).select('name');
            await this.notificationsService.notifyReviewSubmitted(editorIds, reviewer?.name || 'A reviewer', paper.title, paperId);
        }
        return {
            message: 'Review submitted successfully',
            allReviewsComplete: allSubmitted,
        };
    }
    async removeReviewer(paperId, reviewerId, editorId) {
        const paper = await this.findPaperById(paperId);
        if (paper.status !== paper_schema_1.PaperStatus.UNDER_REVIEW) {
            throw new common_1.BadRequestException('Can only remove reviewers from papers that are under review');
        }
        const currentRoundIndex = paper.reviewRounds.length - 1;
        const reviewPath = `reviewRounds.${currentRoundIndex}.reviews`;
        const updated = await this.paperModel.findByIdAndUpdate(paperId, {
            $pull: {
                [reviewPath]: { reviewerId: new mongoose_2.Types.ObjectId(reviewerId) },
            },
        }, { new: true });
        return {
            message: 'Reviewer removed successfully',
            paper: updated.toJSON(),
        };
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
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(paper_schema_1.Paper.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mail_service_1.MailService,
        notifications_service_1.NotificationsService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map