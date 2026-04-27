// PURPOSE: Defines the Paper document shape in MongoDB.
//
// KEY DESIGN DECISIONS:
//
// 1. EMBEDDED REVIEW ROUNDS
//    Each paper has a reviewRounds array. Every time a paper goes through
//    a review cycle (including after revisions), a new round is added.
//    This gives us full history of all reviews across all rounds.
//
// 2. STATUS AS STRING ENUM
//    We use a string enum so status values are human-readable in MongoDB.
//    'under_review' is clearer than 2 when debugging or querying.
//
// 3. AUTHORS ARRAY
//    A paper can have multiple authors. The submittedBy field tracks
//    who actually submitted it (for permission checks).

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaperDocument = Paper & Document;

// ─── PAPER STATUS ENUM ────────────────────────────────────────────────────────

export enum PaperStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  REVISION = 'revision',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
}

// ─── NESTED SCHEMAS ───────────────────────────────────────────────────────────
// These are embedded sub-documents, not separate MongoDB collections.
// They live inside the Paper document itself.

// Represents one author on the paper (papers can have co-authors)
@Schema({ _id: false })
// _id: false → don't create a separate _id for each sub-document
// since we don't need to reference authors independently
export class AuthorRef {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  // ref: 'User' → enables Mongoose populate() to fetch full user data if needed
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  affiliation: string;
}

// Represents a single reviewer's review within a round
@Schema({ _id: true, timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reviewerId: Types.ObjectId;

  @Prop({ required: true })
  reviewerName: string;

  @Prop({
    type: String,
    enum: ['accept', 'minor_revision', 'major_revision', 'reject'],
    default: null,
  })
  // null means the reviewer hasn't submitted their review yet
  decision: string | null;

  @Prop({ default: '' })
  // The reviewer's detailed comments to the author
  comments: string;

  @Prop({ default: '' })
  // Private notes visible only to the editor, not the author
  privateNotes: string;

  @Prop({ min: 1, max: 10, default: null })
  // Overall quality score — editors use this to compare reviewer opinions
  score: number | null;

  @Prop({ default: false })
  // Has the reviewer submitted their review or is it still pending?
  isSubmitted: boolean;

  @Prop({ default: null })
  submittedAt: Date | null;
}

// Represents one full round of review (there can be multiple rounds after revisions)
@Schema({ _id: true })
export class ReviewRound {
  @Prop({ required: true, min: 1 })
  // Round 1 = initial review, Round 2 = after first revision, etc.
  round: number;

  @Prop({ type: [Review], default: [] })
  // Array of individual reviewer reviews for this round
  reviews: Review[];

  @Prop({
    type: String,
    enum: ['accept', 'minor_revision', 'major_revision', 'reject', null],
    default: null,
  })
  // The editor's final decision for this round (after reading all reviews)
  editorDecision: string | null;

  @Prop({ default: '' })
  // Editor's message to the author explaining the decision
  editorComments: string;

  @Prop({ default: null })
  decidedAt: Date | null;
}

// ─── MAIN PAPER SCHEMA ────────────────────────────────────────────────────────

@Schema({
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (ret as any).id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Paper {
  @Prop({ required: true, trim: true, maxlength: 300 })
  title: string;

  @Prop({ required: true, trim: true, maxlength: 5000 })
  abstract: string;

  @Prop({ type: [String], default: [] })
  // e.g. ['machine learning', 'neural networks', 'computer vision']
  keywords: string[];

  @Prop({ type: [AuthorRef], required: true })
  // All authors including co-authors
  authors: AuthorRef[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  // The user who submitted the paper — used for permission checks
  submittedBy: Types.ObjectId;

  @Prop({ required: true, trim: true })
  // Research field e.g. 'Computer Science', 'Physics', 'Biology'
  category: string;

  @Prop({ trim: true, default: '' })
  // Which journal this is submitted to
  journal: string;

  @Prop({
    type: String,
    enum: PaperStatus,
    default: PaperStatus.DRAFT,
  })
  status: PaperStatus;

  @Prop({ default: '' })
  // URL to the uploaded PDF — stored in Cloudinary or local disk
  fileUrl: string;

  @Prop({ default: '' })
  // URL to the cover letter PDF
  coverLetterUrl: string;

  @Prop({ default: '' })
  // Author's cover letter as plain text (alternative to PDF)
  coverLetter: string;

  @Prop({ default: null })
  submissionDate: Date | null;

  @Prop({ default: null })
  publishedDate: Date | null;

  @Prop({ default: '' })
  // Digital Object Identifier — assigned when paper is published
  // e.g. '10.1234/journal.2024.001'
  doi: string;

  @Prop({ default: null })
  volume: number | null;

  @Prop({ default: null })
  issue: number | null;

  @Prop({ type: [ReviewRound], default: [] })
  // Full history of all review rounds
  reviewRounds: ReviewRound[];

  @Prop({ default: '' })
  // Internal notes from editor — never shown to authors
  editorNotes: string;
}

export const PaperSchema = SchemaFactory.createForClass(Paper);

// ─── INDEXES ──────────────────────────────────────────────────────────────────
// Indexes speed up common queries significantly.
// Without indexes, MongoDB scans every document for every query.

// We frequently query papers by status (editor dashboard)
PaperSchema.index({ status: 1 });

// We frequently query papers by submittedBy (author dashboard)
PaperSchema.index({ submittedBy: 1 });

// Full-text search on title, abstract, keywords
PaperSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });

// Published papers sorted by date (public listing)
PaperSchema.index({ status: 1, publishedDate: -1 });
