import { PaperStatus } from '../schema/paper.schema';
export declare class AuthorRefDto {
    userId: string;
    name: string;
    affiliation?: string;
}
export declare class CreatePaperDto {
    title: string;
    abstract: string;
    keywords: string[];
    authors: AuthorRefDto[];
    category: string;
    journal?: string;
    coverLetter?: string;
    fileUrl?: string;
    coverLetterUrl?: string;
}
export declare class UpdatePaperDto {
    title?: string;
    abstract?: string;
    keywords?: string[];
    authors?: AuthorRefDto[];
    category?: string;
    journal?: string;
    coverLetter?: string;
    fileUrl?: string;
}
export declare class UpdateStatusDto {
    status: PaperStatus;
    editorComments?: string;
    editorNotes?: string;
    volume?: number;
    issue?: number;
    doi?: string;
}
export declare class SubmitRevisionDto {
    fileUrl: string;
    revisionNote?: string;
}
export declare class PaperQueryDto {
    status?: PaperStatus;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
}
