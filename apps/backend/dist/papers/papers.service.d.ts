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
    createPaper(dto: CreatePaperDto, userId: string, userName: string): Promise<import("mongoose").FlattenMaps<Paper & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>>;
    submitPaper(paperId: string, userId: string): Promise<import("mongoose").FlattenMaps<Paper & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>>;
    getMySubmissions(userId: string): Promise<(import("mongoose").Document<unknown, {}, PaperDocument> & Paper & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    })[]>;
    getAllPapers(query: PaperQueryDto): Promise<{
        papers: (import("mongoose").Document<unknown, {}, PaperDocument> & Paper & import("mongoose").Document<any, any, any> & {
            _id: Types.ObjectId;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPublishedPapers(query: PaperQueryDto): Promise<{
        papers: (import("mongoose").Document<unknown, {}, PaperDocument> & Paper & import("mongoose").Document<any, any, any> & {
            _id: Types.ObjectId;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPaperById(paperId: string, userId: string, userRole: string): Promise<any>;
    updatePaper(paperId: string, dto: UpdatePaperDto, userId: string): Promise<import("mongoose").FlattenMaps<Paper & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>>;
    updateStatus(paperId: string, dto: UpdateStatusDto, editorId: string): Promise<import("mongoose").FlattenMaps<Paper & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>>;
    submitRevision(paperId: string, dto: SubmitRevisionDto, userId: string): Promise<import("mongoose").FlattenMaps<Paper & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>>;
    deletePaper(paperId: string, userId: string, userRole: string): Promise<{
        message: string;
    }>;
    private findPaperById;
    private checkOwnership;
}
