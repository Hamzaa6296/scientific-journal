import { PapersService } from './papers.service';
import { CreatePaperDto, PaperQueryDto, SubmitRevisionDto, UpdatePaperDto, UpdateStatusDto } from './dto/paper.dto';
export declare class PapersController {
    private readonly papersService;
    constructor(papersService: PapersService);
    getPublishedPapers(query: PaperQueryDto): Promise<{
        papers: (import("mongoose").Document<unknown, {}, import("./schema/paper.schema").PaperDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schema/paper.schema").Paper & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
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
    createPaper(dto: CreatePaperDto, req: any): Promise<import("./schema/paper.schema").Paper & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getMySubmissions(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./schema/paper.schema").PaperDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schema/paper.schema").Paper & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    submitPaper(id: string, req: any): Promise<import("./schema/paper.schema").Paper & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    submitRevision(id: string, dto: SubmitRevisionDto, req: any): Promise<import("./schema/paper.schema").Paper & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updatePaper(id: string, dto: UpdatePaperDto, req: any): Promise<import("./schema/paper.schema").Paper & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deletePaper(id: string, req: any): Promise<{
        message: string;
    }>;
    getAllPapers(query: PaperQueryDto): Promise<{
        papers: (import("mongoose").Document<unknown, {}, import("./schema/paper.schema").PaperDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schema/paper.schema").Paper & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
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
    updateStatus(id: string, dto: UpdateStatusDto, req: any): Promise<import("./schema/paper.schema").Paper & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getPaperById(id: string, req: any): Promise<any>;
}
