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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("./schemas/notification.schema");
let NotificationsService = class NotificationsService {
    constructor(notificationModel) {
        this.notificationModel = notificationModel;
    }
    async createNotification(data) {
        await this.notificationModel.create({
            recipientId: new mongoose_2.Types.ObjectId(data.recipientId),
            type: data.type,
            message: data.message,
            paperId: data.paperId ? new mongoose_2.Types.ObjectId(data.paperId) : null,
            metadata: data.metadata || '',
            isRead: false,
        });
    }
    async createManyNotifications(data) {
        const notifications = data.map((n) => ({
            recipientId: new mongoose_2.Types.ObjectId(n.recipientId),
            type: n.type,
            message: n.message,
            paperId: n.paperId ? new mongoose_2.Types.ObjectId(n.paperId) : null,
            metadata: n.metadata || '',
            isRead: false,
        }));
        await this.notificationModel.insertMany(notifications);
    }
    async getMyNotifications(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [notifications, total, unreadCount] = await Promise.all([
            this.notificationModel
                .find({ recipientId: new mongoose_2.Types.ObjectId(userId) })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.notificationModel.countDocuments({
                recipientId: new mongoose_2.Types.ObjectId(userId),
            }),
            this.notificationModel.countDocuments({
                recipientId: new mongoose_2.Types.ObjectId(userId),
                isRead: false,
            }),
        ]);
        return {
            notifications,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            unreadCount,
        };
    }
    async getUnreadCount(userId) {
        const count = await this.notificationModel.countDocuments({
            recipientId: new mongoose_2.Types.ObjectId(userId),
            isRead: false,
        });
        return { unreadCount: count };
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.notificationModel.findOneAndUpdate({
            _id: new mongoose_2.Types.ObjectId(notificationId),
            recipientId: new mongoose_2.Types.ObjectId(userId),
        }, { isRead: true }, { new: true });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return notification.toJSON();
    }
    async markAllAsRead(userId) {
        const result = await this.notificationModel.updateMany({
            recipientId: new mongoose_2.Types.ObjectId(userId),
            isRead: false,
        }, { isRead: true });
        return {
            message: `${result.modifiedCount} notification(s) marked as read`,
        };
    }
    async deleteNotification(notificationId, userId) {
        const notification = await this.notificationModel.findOneAndDelete({
            _id: new mongoose_2.Types.ObjectId(notificationId),
            recipientId: new mongoose_2.Types.ObjectId(userId),
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return { message: 'Notification deleted' };
    }
    async deleteAllNotifications(userId) {
        await this.notificationModel.deleteMany({
            recipientId: new mongoose_2.Types.ObjectId(userId),
        });
        return { message: 'All notifications deleted' };
    }
    async notifyPaperSubmitted(editorIds, authorName, paperTitle, paperId) {
        await this.createManyNotifications(editorIds.map((editorId) => ({
            recipientId: editorId,
            type: notification_schema_1.NotificationType.PAPER_SUBMITTED,
            message: `New paper submitted by ${authorName}: "${paperTitle}"`,
            paperId,
        })));
    }
    async notifyPaperDecision(authorIds, type, paperTitle, paperId, editorComments) {
        const messageMap = {
            [notification_schema_1.NotificationType.PAPER_UNDER_REVIEW]: `Your paper "${paperTitle}" is now under review`,
            [notification_schema_1.NotificationType.PAPER_REVISION]: `Revision requested for your paper "${paperTitle}"`,
            [notification_schema_1.NotificationType.PAPER_ACCEPTED]: `Congratulations! Your paper "${paperTitle}" has been accepted`,
            [notification_schema_1.NotificationType.PAPER_REJECTED]: `Your paper "${paperTitle}" was not accepted for publication`,
            [notification_schema_1.NotificationType.PAPER_PUBLISHED]: `Your paper "${paperTitle}" is now published`,
        };
        await this.createManyNotifications(authorIds.map((authorId) => ({
            recipientId: authorId,
            type,
            message: messageMap[type] || `Update on your paper "${paperTitle}"`,
            paperId,
            metadata: editorComments || '',
        })));
    }
    async notifyReviewAssigned(reviewerId, paperTitle, paperId) {
        await this.createNotification({
            recipientId: reviewerId,
            type: notification_schema_1.NotificationType.REVIEW_ASSIGNED,
            message: `You have been assigned to review: "${paperTitle}"`,
            paperId,
        });
    }
    async notifyReviewSubmitted(editorIds, reviewerName, paperTitle, paperId) {
        await this.createManyNotifications(editorIds.map((editorId) => ({
            recipientId: editorId,
            type: notification_schema_1.NotificationType.REVIEW_SUBMITTED,
            message: `${reviewerName} submitted a review for "${paperTitle}"`,
            paperId,
        })));
    }
    async notifyAllReviewsComplete(editorIds, paperTitle, paperId) {
        await this.createManyNotifications(editorIds.map((editorId) => ({
            recipientId: editorId,
            type: notification_schema_1.NotificationType.ALL_REVIEWS_COMPLETE,
            message: `All reviews are in for "${paperTitle}". Ready for your decision.`,
            paperId,
        })));
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map