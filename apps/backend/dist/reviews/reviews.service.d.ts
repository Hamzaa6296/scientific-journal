import { Model, Types } from 'mongoose';
import { Paper, PaperDocument, PaperStatus } from '../papers/schema/paper.schema';
import { UserDocument } from '../auth/schemas/user.schema';
import { AssignReviewersDto, RespondToInvitationDto, SubmitReviewDto } from './dto/reviews.dto';
import { MailService } from '../auth/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ReviewsService {
    private paperModel;
    private userModel;
    private mailService;
    private notificationsService;
    constructor(paperModel: Model<PaperDocument>, userModel: Model<UserDocument>, mailService: MailService, notificationsService: NotificationsService);
    assignReviewers(paperId: string, dto: AssignReviewersDto, editorId: string): Promise<{
        message: string;
        paper: Paper & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    getPaperReviews(paperId: string): Promise<{
        paperId: string;
        title: string;
        status: PaperStatus;
        reviewRounds: import("../papers/schema/paper.schema").ReviewRound[];
    }>;
    getMyReviews(reviewerId: string): Promise<{
        paperId: any;
        title: any;
        abstract: any;
        category: any;
        status: any;
        fileUrl: string;
        rounds: any;
    }[]>;
    getPaperForReview(paperId: string, reviewerId: string): Promise<any>;
    respondToInvitation(paperId: string, dto: RespondToInvitationDto, reviewerId: string): Promise<{
        message: string;
        declineReason?: undefined;
    } | {
        message: string;
        declineReason: string;
    }>;
    submitReview(paperId: string, dto: SubmitReviewDto, reviewerId: string): Promise<{
        message: string;
        allReviewsComplete: boolean;
    }>;
    removeReviewer(paperId: string, reviewerId: string, editorId: string): Promise<{
        message: string;
        paper: Paper & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    private findPaperById;
}
