import { Model, Types } from 'mongoose';
import { Paper, PaperDocument } from './schema/paper.schema';
import { CreatePaperDto, UpdatePaperDto, UpdateStatusDto, SubmitRevisionDto, PaperQueryDto } from './dto/paper.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UserDocument } from '../auth/schemas/user.schema';
export declare class PapersService {
    private paperModel;
    private userModel;
    private notificationsService;
    constructor(paperModel: Model<PaperDocument>, userModel: Model<UserDocument>, notificationsService: NotificationsService);
    private readonly validTransitions;
    createPaper(dto: CreatePaperDto, userId: string, userName: string): Promise<Paper & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    submitPaper(paperId: string, userId: string): Promise<Paper & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getMySubmissions(userId: string): Promise<(import("mongoose").Document<unknown, {}, PaperDocument, {}, import("mongoose").DefaultSchemaOptions> & Paper & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAllPapers(query: PaperQueryDto): Promise<{
        papers: (import("mongoose").Document<unknown, {}, PaperDocument, {}, import("mongoose").DefaultSchemaOptions> & Paper & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
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
    }>;
    getPublishedPapers(query: PaperQueryDto): Promise<{
        papers: (import("mongoose").Document<unknown, {}, PaperDocument, {}, import("mongoose").DefaultSchemaOptions> & Paper & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
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
    }>;
    getPaperById(paperId: string, userId: string, userRole: string): Promise<any>;
    updatePaper(paperId: string, dto: UpdatePaperDto, userId: string): Promise<Paper & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateStatus(paperId: string, dto: UpdateStatusDto, editorId: string): Promise<Paper & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    submitRevision(paperId: string, dto: SubmitRevisionDto, userId: string): Promise<Paper & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deletePaper(paperId: string, userId: string, userRole: string): Promise<{
        message: string;
    }>;
    private findPaperById;
    private checkOwnership;
}
