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
exports.ReviewsController = void 0;
const common_1 = require("@nestjs/common");
const reviews_service_1 = require("./reviews.service");
const reviews_dto_1 = require("./dto/reviews.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorators_1 = require("../common/decorators/roles.decorators");
const role_enum_1 = require("../common/enums/role.enum");
let ReviewsController = class ReviewsController {
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    assignReviewers(paperId, dto, req) {
        return this.reviewsService.assignReviewers(paperId, dto, req.user.userId);
    }
    getPaperReviews(paperId) {
        return this.reviewsService.getPaperReviews(paperId);
    }
    removeReviewer(paperId, reviewerId, req) {
        return this.reviewsService.removeReviewer(paperId, reviewerId, req.user.userId);
    }
    getMyReviews(req) {
        return this.reviewsService.getMyReviews(req.user.userId);
    }
    getPaperForReview(paperId, req) {
        return this.reviewsService.getPaperForReview(paperId, req.user.userId);
    }
    respondToInvitation(paperId, dto, req) {
        return this.reviewsService.respondToInvitation(paperId, dto, req.user.userId);
    }
    submitReview(paperId, dto, req) {
        return this.reviewsService.submitReview(paperId, dto, req.user.userId);
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, common_1.Post)(':paperId/assign'),
    (0, roles_decorators_1.Roles)(role_enum_1.Role.EDITOR, role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('paperId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reviews_dto_1.AssignReviewersDto, Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "assignReviewers", null);
__decorate([
    (0, common_1.Get)(':paperId/all'),
    (0, roles_decorators_1.Roles)(role_enum_1.Role.EDITOR, role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('paperId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "getPaperReviews", null);
__decorate([
    (0, common_1.Delete)(':paperId/reviewer/:reviewerId'),
    (0, roles_decorators_1.Roles)(role_enum_1.Role.EDITOR, role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('paperId')),
    __param(1, (0, common_1.Param)('reviewerId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "removeReviewer", null);
__decorate([
    (0, common_1.Get)('my-reviews'),
    (0, roles_decorators_1.Roles)(role_enum_1.Role.REVIEWER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "getMyReviews", null);
__decorate([
    (0, common_1.Get)('my-reviews/:paperId'),
    (0, roles_decorators_1.Roles)(role_enum_1.Role.REVIEWER),
    __param(0, (0, common_1.Param)('paperId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "getPaperForReview", null);
__decorate([
    (0, common_1.Patch)(':paperId/respond'),
    (0, roles_decorators_1.Roles)(role_enum_1.Role.REVIEWER),
    __param(0, (0, common_1.Param)('paperId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reviews_dto_1.RespondToInvitationDto, Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "respondToInvitation", null);
__decorate([
    (0, common_1.Patch)(':paperId/submit'),
    (0, roles_decorators_1.Roles)(role_enum_1.Role.REVIEWER),
    __param(0, (0, common_1.Param)('paperId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reviews_dto_1.SubmitReviewDto, Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "submitReview", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, common_1.Controller)('reviews'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [reviews_service_1.ReviewsService])
], ReviewsController);
//# sourceMappingURL=reviews.controller.js.map