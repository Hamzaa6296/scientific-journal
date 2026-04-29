import { PapersService } from './papers.service';
import { CreatePaperDto, PaperQueryDto, SubmitRevisionDto, UpdatePaperDto, UpdateStatusDto } from './dto/paper.dto';
export declare class PapersController {
    private readonly papersService;
    constructor(papersService: PapersService);
    getPublishedPapers(query: PaperQueryDto): Promise<{
        papers: (import("mongoose").Document<unknown, {}, import("./schema/paper.schema").PaperDocument> & import("./schema/paper.schema").Paper & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    createPaper(dto: CreatePaperDto, req: any): Promise<import("mongoose").FlattenMaps<import("./schema/paper.schema").Paper & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>>;
    getMySubmissions(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./schema/paper.schema").PaperDocument> & import("./schema/paper.schema").Paper & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    submitPaper(id: string, req: any): Promise<import("mongoose").FlattenMaps<import("./schema/paper.schema").Paper & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>>;
    submitRevision(id: string, dto: SubmitRevisionDto, req: any): Promise<import("mongoose").FlattenMaps<import("./schema/paper.schema").Paper & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>>;
    updatePaper(id: string, dto: UpdatePaperDto, req: any): Promise<import("mongoose").FlattenMaps<import("./schema/paper.schema").Paper & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>>;
    deletePaper(id: string, req: any): Promise<{
        message: string;
    }>;
    getAllPapers(query: PaperQueryDto): Promise<{
        papers: (import("mongoose").Document<unknown, {}, import("./schema/paper.schema").PaperDocument> & import("./schema/paper.schema").Paper & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    updateStatus(id: string, dto: UpdateStatusDto, req: any): Promise<import("mongoose").FlattenMaps<import("./schema/paper.schema").Paper & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>>;
    getPaperById(id: string, req: any): Promise<any>;
}
