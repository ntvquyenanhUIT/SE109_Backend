export interface Comment {
    id: string;
    article_id: string;
    author_id: string;
    content: string;
    likes: number;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
    author_name?: string; 
}

export interface CreateCommentRequest {
    article_id: string;
    content: string;
}

export interface UpdateCommentRequest {
    content: string;
}