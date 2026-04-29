import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getMyNotifications(req: any, page?: number, limit?: number): Promise<{
        notifications: (import("mongoose").Document<unknown, {}, import("./schemas/notification.schema").NotificationDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/notification.schema").Notification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        unreadCount: number;
    }>;
    getUnreadCount(req: any): Promise<{
        unreadCount: number;
    }>;
    markAllAsRead(req: any): Promise<{
        message: string;
    }>;
    deleteAllNotifications(req: any): Promise<{
        message: string;
    }>;
    markAsRead(id: string, req: any): Promise<import("./schemas/notification.schema").Notification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteNotification(id: string, req: any): Promise<{
        message: string;
    }>;
}
