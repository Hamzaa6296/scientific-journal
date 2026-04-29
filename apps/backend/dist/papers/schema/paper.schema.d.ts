import { Document, Types } from 'mongoose';
export type PaperDocument = Paper & Document;
export declare enum PaperStatus {
    DRAFT = "draft",
    SUBMITTED = "submitted",
    UNDER_REVIEW = "under_review",
    REVISION = "revision",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    PUBLISHED = "published"
}
export declare class AuthorRef {
    userId: Types.ObjectId;
    name: string;
    affiliation: string;
}
export declare class Review {
    reviewerId: Types.ObjectId;
    reviewerName: string;
    decision: string | null;
    comments: string;
    privateNotes: string;
    score: number | null;
    isSubmitted: boolean;
    submittedAt: Date | null;
}
export declare class ReviewRound {
    round: number;
    reviews: Review[];
    editorDecision: string | null;
    editorComments: string;
    decidedAt: Date | null;
}
export declare class Paper {
    title: string;
    abstract: string;
    keywords: string[];
    authors: AuthorRef[];
    submittedBy: Types.ObjectId;
    category: string;
    journal: string;
    status: PaperStatus;
    fileUrl: string;
    coverLetterUrl: string;
    coverLetter: string;
    submissionDate: Date | null;
    publishedDate: Date | null;
    doi: string;
    volume: number | null;
    issue: number | null;
    reviewRounds: ReviewRound[];
    editorNotes: string;
}
export declare const PaperSchema: import("mongoose").Schema<Paper, import("mongoose").Model<Paper, any, any, any, Document<unknown, any, Paper> & Paper & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Paper, Document<unknown, {}, import("mongoose").FlatRecord<Paper>> & import("mongoose").FlatRecord<Paper> & {
    _id: Types.ObjectId;
}>;
