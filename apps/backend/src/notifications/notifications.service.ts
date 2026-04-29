/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// PURPOSE: Creates and manages in-app notifications.
//
// TWO RESPONSIBILITIES:
// 1. INTERNAL: createNotification() is called by other services
//    (PapersService, ReviewsService) whenever a workflow event happens.
//    It's not an HTTP endpoint — it's a programmatic API for other services.
//
// 2. EXTERNAL: HTTP endpoints let users read and manage their notifications.
//
// HOW OTHER SERVICES USE THIS:
// Instead of importing NotificationsService directly (which creates
// circular dependencies), we use NestJS's ModuleRef or simply import
// NotificationsModule into PapersModule and ReviewsModule.

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from './schemas/notification.schema';

// Shape of data needed to create a notification
export interface CreateNotificationData {
  recipientId: string;
  type: NotificationType;
  message: string;
  paperId?: string;
  metadata?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  // ─── CREATE NOTIFICATION (internal — called by other services) ─────────────
  // This is the core method. Every workflow event calls this.

  async createNotification(data: CreateNotificationData): Promise<void> {
    await this.notificationModel.create({
      recipientId: new Types.ObjectId(data.recipientId),
      type: data.type,
      message: data.message,
      paperId: data.paperId ? new Types.ObjectId(data.paperId) : null,
      metadata: data.metadata || '',
      isRead: false,
    });
    // We don't return the notification — callers don't need it
    // Fire and forget — if notification creation fails, it shouldn't
    // break the main workflow (paper submission, review, etc.)
  }

  // ─── CREATE MULTIPLE NOTIFICATIONS AT ONCE ─────────────────────────────────
  // Used when multiple people need to be notified of the same event
  // e.g. all authors of a paper get notified when it's accepted

  async createManyNotifications(data: CreateNotificationData[]): Promise<void> {
    const notifications = data.map((n) => ({
      recipientId: new Types.ObjectId(n.recipientId),
      type: n.type,
      message: n.message,
      paperId: n.paperId ? new Types.ObjectId(n.paperId) : null,
      metadata: n.metadata || '',
      isRead: false,
    }));

    // insertMany is much faster than calling create() in a loop
    await this.notificationModel.insertMany(notifications);
  }

  // ─── GET MY NOTIFICATIONS ──────────────────────────────────────────────────

  async getMyNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find({ recipientId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 }) // newest first
        .skip(skip)
        .limit(limit)
        .exec(),

      this.notificationModel.countDocuments({
        recipientId: new Types.ObjectId(userId),
      }),

      this.notificationModel.countDocuments({
        recipientId: new Types.ObjectId(userId),
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

  // ─── GET UNREAD COUNT ──────────────────────────────────────────────────────
  // Lightweight endpoint — called frequently by the frontend
  // to update the bell icon badge without fetching all notifications

  async getUnreadCount(userId: string) {
    const count = await this.notificationModel.countDocuments({
      recipientId: new Types.ObjectId(userId),
      isRead: false,
    });

    return { unreadCount: count };
  }

  // ─── MARK ONE AS READ ──────────────────────────────────────────────────────

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(notificationId),
        // Make sure users can only mark their OWN notifications as read
        recipientId: new Types.ObjectId(userId),
      },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification.toJSON();
  }

  // ─── MARK ALL AS READ ──────────────────────────────────────────────────────

  async markAllAsRead(userId: string) {
    const result = await this.notificationModel.updateMany(
      {
        recipientId: new Types.ObjectId(userId),
        isRead: false,
      },
      { isRead: true },
    );

    // result.modifiedCount → how many documents were actually updated
    return {
      message: `${result.modifiedCount} notification(s) marked as read`,
    };
  }

  // ─── DELETE ONE NOTIFICATION ───────────────────────────────────────────────

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await this.notificationModel.findOneAndDelete({
      _id: new Types.ObjectId(notificationId),
      recipientId: new Types.ObjectId(userId),
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return { message: 'Notification deleted' };
  }

  // ─── DELETE ALL NOTIFICATIONS ──────────────────────────────────────────────

  async deleteAllNotifications(userId: string) {
    await this.notificationModel.deleteMany({
      recipientId: new Types.ObjectId(userId),
    });

    return { message: 'All notifications deleted' };
  }

  // ─── HELPER METHODS FOR WORKFLOW EVENTS ────────────────────────────────────
  // These are convenience wrappers called by PapersService and ReviewsService.
  // Each one creates the right notification with the right message.

  async notifyPaperSubmitted(
    editorIds: string[],
    authorName: string,
    paperTitle: string,
    paperId: string,
  ) {
    await this.createManyNotifications(
      editorIds.map((editorId) => ({
        recipientId: editorId,
        type: NotificationType.PAPER_SUBMITTED,
        message: `New paper submitted by ${authorName}: "${paperTitle}"`,
        paperId,
      })),
    );
  }

  async notifyPaperDecision(
    authorIds: string[],
    type: NotificationType,
    paperTitle: string,
    paperId: string,
    editorComments?: string,
  ) {
    const messageMap = {
      [NotificationType.PAPER_UNDER_REVIEW]: `Your paper "${paperTitle}" is now under review`,
      [NotificationType.PAPER_REVISION]: `Revision requested for your paper "${paperTitle}"`,
      [NotificationType.PAPER_ACCEPTED]: `Congratulations! Your paper "${paperTitle}" has been accepted`,
      [NotificationType.PAPER_REJECTED]: `Your paper "${paperTitle}" was not accepted for publication`,
      [NotificationType.PAPER_PUBLISHED]: `Your paper "${paperTitle}" is now published`,
    };

    await this.createManyNotifications(
      authorIds.map((authorId) => ({
        recipientId: authorId,
        type,
        message: messageMap[type] || `Update on your paper "${paperTitle}"`,
        paperId,
        metadata: editorComments || '',
      })),
    );
  }

  async notifyReviewAssigned(
    reviewerId: string,
    paperTitle: string,
    paperId: string,
  ) {
    await this.createNotification({
      recipientId: reviewerId,
      type: NotificationType.REVIEW_ASSIGNED,
      message: `You have been assigned to review: "${paperTitle}"`,
      paperId,
    });
  }

  async notifyReviewSubmitted(
    editorIds: string[],
    reviewerName: string,
    paperTitle: string,
    paperId: string,
  ) {
    await this.createManyNotifications(
      editorIds.map((editorId) => ({
        recipientId: editorId,
        type: NotificationType.REVIEW_SUBMITTED,
        message: `${reviewerName} submitted a review for "${paperTitle}"`,
        paperId,
      })),
    );
  }

  async notifyAllReviewsComplete(
    editorIds: string[],
    paperTitle: string,
    paperId: string,
  ) {
    await this.createManyNotifications(
      editorIds.map((editorId) => ({
        recipientId: editorId,
        type: NotificationType.ALL_REVIEWS_COMPLETE,
        message: `All reviews are in for "${paperTitle}". Ready for your decision.`,
        paperId,
      })),
    );
  }
}
