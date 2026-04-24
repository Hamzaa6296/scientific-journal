// Review decision types shared between backend logic and frontend display.

export enum ReviewDecision {
  ACCEPT = "accept",
  MINOR_REVISION = "minor_revision",
  MAJOR_REVISION = "major_revision",
  REJECT = "reject",
}

export interface IReview {
  id: string;
  paperId: string;
  reviewerId: string;
  decision: ReviewDecision;
  comments: string;
  score: number;
  submittedAt: string;
}
