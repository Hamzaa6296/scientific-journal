import { Document, Types } from 'mongoose';
export type PaperDocument = Paper & Document;
export declare enum PaperStatus {
    DRAFT = "draft",
    SUBMITTED = "submitted",
    UNDER_REVIEW = "under_review",
    REVISION = "revision",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    PUBLISHED = "published"
}
export declare class AuthorRef {
    userId: Types.ObjectId;
    name: string;
    affiliation: string;
}
export declare class Review {
    reviewerId: Types.ObjectId;
    reviewerName: string;
    decision: string | null;
    comments: string;
    privateNotes: string;
    score: number | null;
    isSubmitted: boolean;
    submittedAt: Date | null;
}
export declare class ReviewRound {
    round: number;
    reviews: Review[];
    editorDecision: string | null;
    editorComments: string;
    decidedAt: Date | null;
}
export declare class Paper {
    title: string;
    abstract: string;
    keywords: string[];
    authors: AuthorRef[];
    submittedBy: Types.ObjectId;
    category: string;
    journal: string;
    status: PaperStatus;
    fileUrl: string;
    coverLetterUrl: string;
    coverLetter: string;
    submissionDate: Date | null;
    publishedDate: Date | null;
    doi: string;
    volume: number | null;
    issue: number | null;
    reviewRounds: ReviewRound[];
    editorNotes: string;
}
export declare const PaperSchema: import("mongoose").Schema<Paper, import("mongoose").Model<Paper, any, any, any, any, any, Paper>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Paper, Document<unknown, {}, Paper, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Paper & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    title?: import("mongoose").SchemaDefinitionProperty<string, Paper, Document<unknown, {}, Paper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Paper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    abstract?: import("mongoose").SchemaDefinitionProperty<string, Paper, Document<unknown, {}, Paper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Paper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    keywords?: import("mongoose").SchemaDefinitionProperty<string[], Paper, Document<unknown, {}, Paper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Paper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    authors?: import("mongoose").SchemaDefinitionProperty<AuthorRef[], Paper, Document<unknown, {}, Paper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Paper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    submittedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Paper, Document<unknown, {}, Paper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Paper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    category?: import("mongoose").SchemaDefinitionProperty<string, Paper, Document<unknown, {}, Paper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Paper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    journal?: import("mongoose").SchemaDefinitionProperty<string, Paper, Document<unknown, {}, Paper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Paper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    status?: import("mongoose").SchemaDefinitionProperty<PaperStatus, Paper, Document<unknown, {}, Paper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Paper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    fileUrl?: import("mongoose").SchemaDefinitionProperty<string, Paper, Document<unknown, {}, Paper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Paper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    coverLetterUrl?: import("mongoose").SchemaDefinitionProperty<string, Paper, Document<unknown, {}, Paper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Paper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    coverLetter?: import("mongoose").SchemaDefinitionProperty<string, Paper, Document<unknown, {}, Paper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Paper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    submissionDate?: import("mongoose").SchemaDefinitionProperty<Date, Paper, Document<unknown, {}, Paper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Paper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    publishedDate?: import("mongoose").SchemaDefinitionProperty<Date, Paper, Document<unknown, {}, Paper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Paper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    doi?: import("mongoose").SchemaDefinitionProperty<string, Paper, Document<unknown, {}, Paper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Paper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    volume?: import("mongoose").SchemaDefinitionProperty<number, Paper, Document<unknown, {}, Paper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Paper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    issue?: import("mongoose").SchemaDefinitionProperty<number, Paper, Document<unknown, {}, Paper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Paper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    reviewRounds?: import("mongoose").SchemaDefinitionProperty<ReviewRound[], Paper, Document<unknown, {}, Paper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Paper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    editorNotes?: import("mongoose").SchemaDefinitionProperty<string, Paper, Document<unknown, {}, Paper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Paper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, Paper>;
