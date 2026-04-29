import { ReviewsService } from './reviews.service';
import { AssignReviewersDto, RespondToInvitationDto, SubmitReviewDto } from './dto/reviews.dto';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    assignReviewers(paperId: string, dto: AssignReviewersDto, req: any): Promise<{
        message: string;
        paper: import("../papers/schema/paper.schema").Paper & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    getPaperReviews(paperId: string): Promise<{
        paperId: string;
        title: string;
        status: import("../papers/schema/paper.schema").PaperStatus;
        reviewRounds: import("../papers/schema/paper.schema").ReviewRound[];
    }>;
    removeReviewer(paperId: string, reviewerId: string, req: any): Promise<{
        message: string;
        paper: import("../papers/schema/paper.schema").Paper & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    getMyReviews(req: any): Promise<{
        paperId: any;
        title: any;
        abstract: any;
        category: any;
        status: any;
        fileUrl: string;
        rounds: any;
    }[]>;
    getPaperForReview(paperId: string, req: any): Promise<any>;
    respondToInvitation(paperId: string, dto: RespondToInvitationDto, req: any): Promise<{
        message: string;
        declineReason?: undefined;
    } | {
        message: string;
        declineReason: string;
    }>;
    submitReview(paperId: string, dto: SubmitReviewDto, req: any): Promise<{
        message: string;
        allReviewsComplete: boolean;
    }>;
}
