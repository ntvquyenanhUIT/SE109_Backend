export interface Article {
    id: string;
    title: string;
    summary: string;
    content: string;
    cover_image_url: string;
    author_id: string;
    category_id: string;
    views: number;
    published_date: Date;
    updated_date?: Date;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
    tags?: string[];
    author_name?: string;
    category_name?: string;
}
export interface UpdateArticleRequest {
    title?: string;
    summary?: string;
    content?: string;
    category_id?: string;
    published_date?: Date;
    tags?: string[] | string; 
}

export interface CreateArticleRequest {
    title: string;
    summary: string;
    content: string;
    category_id: string;
    published_date: Date;
    tags?: string[] | string; 
}
export interface ArticleQuery {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    author?: string;
    sortBy?: 'created_at' | 'published_date' | 'views' | 'title';
    sortOrder?: 'ASC' | 'DESC';
}