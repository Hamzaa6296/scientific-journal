// Paper status is the most important shared type.
// The backend drives the status machine.
// The frontend reads it to show the right UI for each status.

export enum PaperStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  REVISION = "revision",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  PUBLISHED = "published",
}

export interface IAuthorRef {
  userId: string;
  name: string;
  affiliation: string;
}

export interface IPaper {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  authors: IAuthorRef[];
  submittedBy: string;
  category: string;
  status: PaperStatus;
  fileUrl: string;
  submissionDate: string;
  publishedDate?: string;
  doi?: string;
}
