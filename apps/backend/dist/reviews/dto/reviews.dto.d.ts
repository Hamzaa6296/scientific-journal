export declare class AssignReviewersDto {
    reviewerIds: string[];
}
export declare class RespondToInvitationDto {
    accepted: boolean;
    declineReason?: string;
}
export declare class SubmitReviewDto {
    decision: 'accept' | 'minor_revision' | 'major_revision' | 'reject';
    comments: string;
    privateNotes?: string;
    score: number;
}
