import { Document, Types } from 'mongoose';
export type NotificationDocument = Notification & Document;
export declare enum NotificationType {
    PAPER_SUBMITTED = "paper_submitted",
    PAPER_UNDER_REVIEW = "paper_under_review",
    PAPER_REVISION = "paper_revision",
    PAPER_ACCEPTED = "paper_accepted",
    PAPER_REJECTED = "paper_rejected",
    PAPER_PUBLISHED = "paper_published",
    REVIEW_ASSIGNED = "review_assigned",
    REVIEW_SUBMITTED = "review_submitted",
    ALL_REVIEWS_COMPLETE = "all_reviews_complete",
    REVIEW_INVITATION = "review_invitation"
}
export declare class Notification {
    recipientId: Types.ObjectId;
    type: NotificationType;
    message: string;
    isRead: boolean;
    paperId: Types.ObjectId | null;
    metadata: string;
}
export declare const NotificationSchema: import("mongoose").Schema<Notification, import("mongoose").Model<Notification, any, any, any, Document<unknown, any, Notification> & Notification & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, Document<unknown, {}, import("mongoose").FlatRecord<Notification>> & import("mongoose").FlatRecord<Notification> & {
    _id: Types.ObjectId;
}>;
