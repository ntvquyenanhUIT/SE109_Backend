import pool from '@/config/db';
import { Article, CreateArticleRequest, UpdateArticleRequest, ArticleQuery } from '@/models/article';
import { PoolClient } from 'pg';

export class ArticleService {
    static async getAllArticles(query: ArticleQuery) {
        const {
            page = 1,
            limit = 10,
            search,
            category,
            author,
            sortBy = 'published_date',
            sortOrder = 'DESC'
        } = query;

        const offset = (page - 1) * limit;
        let queryText = `
            SELECT 
                a.*,
                u.username as author_name,
                c.name as category_name,
                ARRAY_AGG(at.tag) FILTER (WHERE at.tag IS NOT NULL) as tags
            FROM articles a
            LEFT JOIN users u ON a.author_id = u.id
            LEFT JOIN categories c ON a.category_id = c.id
            LEFT JOIN article_tags at ON a.id = at.article_id
            WHERE a.deleted_at IS NULL
        `;

        const conditions: string[] = [];
        const values: any[] = [];
        let paramCount = 0;

        if (search) {
            paramCount++;
            conditions.push(`(a.title ILIKE $${paramCount} OR a.summary ILIKE $${paramCount} OR a.content ILIKE $${paramCount})`);
            values.push(`%${search}%`);
        }

        if (category) {
            paramCount++;
            conditions.push(`c.slug = $${paramCount}`);
            values.push(category);
        }

        if (author) {
            paramCount++;
            conditions.push(`u.username = $${paramCount}`);
            values.push(author);
        }

        if (conditions.length > 0) {
            queryText += ` AND ${conditions.join(' AND ')}`;
        }

        queryText += ` GROUP BY a.id, u.username, c.name`;
        queryText += ` ORDER BY a.${sortBy} ${sortOrder}`;
        queryText += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
        values.push(limit, offset);

        const result = await pool.query(queryText, values);

        let countQuery = `
            SELECT COUNT(DISTINCT a.id) as total
            FROM articles a
            LEFT JOIN users u ON a.author_id = u.id
            LEFT JOIN categories c ON a.category_id = c.id
            WHERE a.deleted_at IS NULL
        `;

        if (conditions.length > 0) {
            countQuery += ` AND ${conditions.join(' AND ')}`;
        }

        const countResult = await pool.query(countQuery, values.slice(0, -2));
        const total = parseInt(countResult.rows[0].total);

        return {
            articles: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    static async getArticleById(id: string): Promise<Article | null> {
        const queryText = `
            SELECT 
                a.*,
                u.username as author_name,
                c.name as category_name,
                ARRAY_AGG(at.tag) FILTER (WHERE at.tag IS NOT NULL) as tags
            FROM articles a
            LEFT JOIN users u ON a.author_id = u.id
            LEFT JOIN categories c ON a.category_id = c.id
            LEFT JOIN article_tags at ON a.id = at.article_id
            WHERE a.id = $1 AND a.deleted_at IS NULL
            GROUP BY a.id, u.username, c.name
        `;

        const result = await pool.query(queryText, [id]);
        return result.rows[0] || null;
    }

    static async createArticle(articleData: CreateArticleRequest, authorId: string, coverImageUrl: string): Promise<Article> {
        const client: PoolClient = await pool.connect();

        try {
            await client.query('BEGIN');

            const insertArticleQuery = `
        INSERT INTO articles (title, summary, content, cover_image_url, author_id, category_id, published_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `;

            const articleResult = await client.query(insertArticleQuery, [
                articleData.title,
                articleData.summary,
                articleData.content,
                coverImageUrl,
                authorId,
                articleData.category_id,
                articleData.published_date
            ]);

            const article = articleResult.rows[0];

            if (articleData.tags) {
                const tagInsertQuery = `
            INSERT INTO article_tags (article_id, tag)
            VALUES ($1, $2)
            `;

                // Process tags based on their type
                let tagsArray: string[] = [];

                if (typeof articleData.tags === 'string') {
                    // Handle comma-separated string
                    tagsArray = (articleData.tags as string).split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
                } else if (Array.isArray(articleData.tags)) {
                    tagsArray = articleData.tags as string[];
                }

                // Insert each tag
                for (const tag of tagsArray) {
                    if (tag && tag.trim()) {
                        await client.query(tagInsertQuery, [article.id, tag.trim()]);
                    }
                }
            }

            await client.query('COMMIT');

            return await this.getArticleById(article.id) as Article;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async updateArticle(id: string, updateData: UpdateArticleRequest, newCoverImageUrl?: string): Promise<Article | null> {
        const client: PoolClient = await pool.connect();

        try {
            await client.query('BEGIN');

            const fields: string[] = [];
            const values: any[] = [];
            let paramCount = 0;

            if (updateData.title !== undefined) {
                fields.push(`title = $${++paramCount}`);
                values.push(updateData.title);
            }

            if (updateData.summary !== undefined) {
                fields.push(`summary = $${++paramCount}`);
                values.push(updateData.summary);
            }

            if (updateData.content !== undefined) {
                fields.push(`content = $${++paramCount}`);
                values.push(updateData.content);
            }

            if (updateData.category_id !== undefined) {
                fields.push(`category_id = $${++paramCount}`);
                values.push(updateData.category_id);
            }

            if (updateData.published_date !== undefined) {
                fields.push(`published_date = $${++paramCount}`);
                values.push(updateData.published_date);
            }

            if (newCoverImageUrl) {
                fields.push(`cover_image_url = $${++paramCount}`);
                values.push(newCoverImageUrl);
            }

            if (fields.length === 0) {
                throw new Error('No fields to update');
            }

            fields.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(id);

            const updateQuery = `
                UPDATE articles 
                SET ${fields.join(', ')}
                WHERE id = $${++paramCount} AND deleted_at IS NULL
                RETURNING *
            `;

            const result = await client.query(updateQuery, values);

            if (result.rows.length === 0) {
                return null;
            }

            if (updateData.tags !== undefined) {
                await client.query('DELETE FROM article_tags WHERE article_id = $1', [id]);

                if (updateData.tags.length > 0) {
                    const tagInsertQuery = `INSERT INTO article_tags (article_id, tag) VALUES ($1, $2)`;
                    for (const tag of updateData.tags) {
                        await client.query(tagInsertQuery, [id, tag.trim()]);
                    }
                }
            }

            await client.query('COMMIT');

            return await this.getArticleById(id);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async deleteArticle(id: string): Promise<boolean> {
        const client: PoolClient = await pool.connect();

        try {
            await client.query('BEGIN');

            // Soft delete comments
            await client.query('UPDATE comments SET deleted_at = CURRENT_TIMESTAMP WHERE article_id = $1', [id]);

            // Soft delete the article
            const result = await client.query(
                'UPDATE articles SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING id', 
                [id]
            );

            await client.query('COMMIT');

            return (result.rowCount ?? 0) > 0;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async incrementViews(id: string): Promise<void> {
        await pool.query('UPDATE articles SET views = views + 1 WHERE id = $1 AND deleted_at IS NULL', [id]);
    }

    static async getPopularArticles(limit: number = 5): Promise<Article[]> {
        const queryText = `
            SELECT 
                a.*,
                u.username as author_name,
                c.name as category_name,
                ARRAY_AGG(at.tag) FILTER (WHERE at.tag IS NOT NULL) as tags
            FROM articles a
            LEFT JOIN users u ON a.author_id = u.id
            LEFT JOIN categories c ON a.category_id = c.id
            LEFT JOIN article_tags at ON a.id = at.article_id
            WHERE a.deleted_at IS NULL
            GROUP BY a.id, u.username, c.name
            ORDER BY a.views DESC
            LIMIT $1
        `;

        const result = await pool.query(queryText, [limit]);
        return result.rows;
    }

    static async getRecentArticles(limit: number = 5): Promise<Article[]> {
        const queryText = `
            SELECT 
                a.*,
                u.username as author_name,
                c.name as category_name,
                ARRAY_AGG(at.tag) FILTER (WHERE at.tag IS NOT NULL) as tags
            FROM articles a
            LEFT JOIN users u ON a.author_id = u.id
            LEFT JOIN categories c ON a.category_id = c.id
            LEFT JOIN article_tags at ON a.id = at.article_id
            WHERE a.deleted_at IS NULL
            GROUP BY a.id, u.username, c.name
            ORDER BY a.published_date DESC
            LIMIT $1
        `;

        const result = await pool.query(queryText, [limit]);
        return result.rows;
    }
    
}