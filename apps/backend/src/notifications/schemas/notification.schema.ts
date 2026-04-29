/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// PURPOSE: Defines the Notification document in MongoDB.
//
// DESIGN DECISION — Separate Collection:
// Unlike reviews (embedded in papers), notifications are a separate
// collection. Why? Because:
// 1. A user can have hundreds of notifications — embedding them in
//    the user document would make user documents huge
// 2. We query notifications independently (by userId, by isRead)
// 3. We delete them independently without affecting other data
//
// NOTIFICATION TYPES:
// Each type maps to a specific workflow event. The frontend uses
// the type to show the right icon and color for each notification.

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  // Paper lifecycle events
  PAPER_SUBMITTED = 'paper_submitted', // → editor
  PAPER_UNDER_REVIEW = 'paper_under_review', // → author
  PAPER_REVISION = 'paper_revision', // → author
  PAPER_ACCEPTED = 'paper_accepted', // → author
  PAPER_REJECTED = 'paper_rejected', // → author
  PAPER_PUBLISHED = 'paper_published', // → author

  // Review events
  REVIEW_ASSIGNED = 'review_assigned', // → reviewer
  REVIEW_SUBMITTED = 'review_submitted', // → editor
  ALL_REVIEWS_COMPLETE = 'all_reviews_complete', // → editor
  REVIEW_INVITATION = 'review_invitation', // → reviewer
}

@Schema({
  timestamps: true,
  toJSON: {
    transform(doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  // The user who RECEIVES this notification
  // index: true → we frequently query "all notifications for user X"
  recipientId: Types.ObjectId;

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ required: true })
  // Human-readable notification text
  // e.g. "Your paper 'Deep Learning...' has been accepted"
  message: string;

  @Prop({ default: false, index: true })
  // index: true → we frequently query unread notifications
  isRead: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Paper', default: null })
  // The paper this notification is about — null for system notifications
  // Used by frontend to navigate to the right paper when clicked
  paperId: Types.ObjectId | null;

  @Prop({ default: '' })
  // Optional extra context — e.g. editor's decision comments
  metadata: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Compound index — most common query: "unread notifications for user X"
NotificationSchema.index({ recipientId: 1, isRead: 1 });

// Auto-delete notifications older than 90 days
// TTL index — MongoDB automatically removes documents after this many seconds
NotificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 90 }, // 90 days
);
