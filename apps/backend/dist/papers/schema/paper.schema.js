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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperSchema = exports.Paper = exports.ReviewRound = exports.Review = exports.AuthorRef = exports.PaperStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var PaperStatus;
(function (PaperStatus) {
    PaperStatus["DRAFT"] = "draft";
    PaperStatus["SUBMITTED"] = "submitted";
    PaperStatus["UNDER_REVIEW"] = "under_review";
    PaperStatus["REVISION"] = "revision";
    PaperStatus["ACCEPTED"] = "accepted";
    PaperStatus["REJECTED"] = "rejected";
    PaperStatus["PUBLISHED"] = "published";
})(PaperStatus || (exports.PaperStatus = PaperStatus = {}));
let AuthorRef = class AuthorRef {
};
exports.AuthorRef = AuthorRef;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], AuthorRef.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AuthorRef.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], AuthorRef.prototype, "affiliation", void 0);
exports.AuthorRef = AuthorRef = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], AuthorRef);
let Review = class Review {
};
exports.Review = Review;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Review.prototype, "reviewerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Review.prototype, "reviewerName", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['accept', 'minor_revision', 'major_revision', 'reject'],
        default: null,
    }),
    __metadata("design:type", String)
], Review.prototype, "decision", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Review.prototype, "comments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Review.prototype, "privateNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 1, max: 10, default: null }),
    __metadata("design:type", Number)
], Review.prototype, "score", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Review.prototype, "isSubmitted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Review.prototype, "submittedAt", void 0);
exports.Review = Review = __decorate([
    (0, mongoose_1.Schema)({ _id: true, timestamps: true })
], Review);
let ReviewRound = class ReviewRound {
};
exports.ReviewRound = ReviewRound;
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], ReviewRound.prototype, "round", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Review], default: [] }),
    __metadata("design:type", Array)
], ReviewRound.prototype, "reviews", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['accept', 'minor_revision', 'major_revision', 'reject', null],
        default: null,
    }),
    __metadata("design:type", String)
], ReviewRound.prototype, "editorDecision", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], ReviewRound.prototype, "editorComments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], ReviewRound.prototype, "decidedAt", void 0);
exports.ReviewRound = ReviewRound = __decorate([
    (0, mongoose_1.Schema)({ _id: true })
], ReviewRound);
let Paper = class Paper {
};
exports.Paper = Paper;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 300 }),
    __metadata("design:type", String)
], Paper.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 5000 }),
    __metadata("design:type", String)
], Paper.prototype, "abstract", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Paper.prototype, "keywords", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [AuthorRef], required: true }),
    __metadata("design:type", Array)
], Paper.prototype, "authors", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Paper.prototype, "submittedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Paper.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], Paper.prototype, "journal", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: PaperStatus,
        default: PaperStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Paper.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Paper.prototype, "fileUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Paper.prototype, "coverLetterUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Paper.prototype, "coverLetter", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Paper.prototype, "submissionDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Paper.prototype, "publishedDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Paper.prototype, "doi", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], Paper.prototype, "volume", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], Paper.prototype, "issue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [ReviewRound], default: [] }),
    __metadata("design:type", Array)
], Paper.prototype, "reviewRounds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Paper.prototype, "editorNotes", void 0);
exports.Paper = Paper = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    })
], Paper);
exports.PaperSchema = mongoose_1.SchemaFactory.createForClass(Paper);
exports.PaperSchema.index({ status: 1 });
exports.PaperSchema.index({ submittedBy: 1 });
exports.PaperSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });
exports.PaperSchema.index({ status: 1, publishedDate: -1 });
//# sourceMappingURL=paper.schema.js.map