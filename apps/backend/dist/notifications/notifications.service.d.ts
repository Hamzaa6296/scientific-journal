import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';
export interface CreateNotificationData {
    recipientId: string;
    type: NotificationType;
    message: string;
    paperId?: string;
    metadata?: string;
}
export declare class NotificationsService {
    private notificationModel;
    constructor(notificationModel: Model<NotificationDocument>);
    createNotification(data: CreateNotificationData): Promise<void>;
    createManyNotifications(data: CreateNotificationData[]): Promise<void>;
    getMyNotifications(userId: string, page?: number, limit?: number): Promise<{
        notifications: (import("mongoose").Document<unknown, {}, NotificationDocument> & Notification & import("mongoose").Document<any, any, any> & {
            _id: Types.ObjectId;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        unreadCount: number;
    }>;
    getUnreadCount(userId: string): Promise<{
        unreadCount: number;
    }>;
    markAsRead(notificationId: string, userId: string): Promise<import("mongoose").FlattenMaps<Notification & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>>;
    markAllAsRead(userId: string): Promise<{
        message: string;
    }>;
    deleteNotification(notificationId: string, userId: string): Promise<{
        message: string;
    }>;
    deleteAllNotifications(userId: string): Promise<{
        message: string;
    }>;
    notifyPaperSubmitted(editorIds: string[], authorName: string, paperTitle: string, paperId: string): Promise<void>;
    notifyPaperDecision(authorIds: string[], type: NotificationType, paperTitle: string, paperId: string, editorComments?: string): Promise<void>;
    notifyReviewAssigned(reviewerId: string, paperTitle: string, paperId: string): Promise<void>;
    notifyReviewSubmitted(editorIds: string[], reviewerName: string, paperTitle: string, paperId: string): Promise<void>;
    notifyAllReviewsComplete(editorIds: string[], paperTitle: string, paperId: string): Promise<void>;
}
