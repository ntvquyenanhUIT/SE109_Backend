import { Request, Response } from 'express';
import { ArticleService } from '@/services/article_service';
import { CreateArticleRequest, UpdateArticleRequest, ArticleQuery } from '@/models/article';

interface AuthenticatedRequest extends Request {
    userId?: string;
    user?: any;
}

export class ArticleController {
    static async getAllArticles(req: Request, res: Response): Promise<void> {
        try {
            const query: ArticleQuery = {
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 10,
                search: req.query.search as string,
                category: req.query.category as string,
                author: req.query.author as string,
                sortBy: req.query.sortBy as any || 'published_date',
                sortOrder: req.query.sortOrder as any || 'DESC'
            };

            const result = await ArticleService.getAllArticles(query);

            res.json({
                success: true,
                data: result.articles,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error fetching articles:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch articles',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getArticleById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const article = await ArticleService.getArticleById(id);

            if (!article) {
                res.status(404).json({
                    success: false,
                    message: 'Article not found'
                });
                return;
            }

            // Increment views
            await ArticleService.incrementViews(id);

            res.json({
                success: true,
                data: article
            });
        } catch (error) {
            console.error('Error fetching article:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch article',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async createArticle(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const articleData: CreateArticleRequest = req.body;

            if (!req.userId) {
                res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
                return;
            }

            if (!req.file) {
                res.status(400).json({
                    success: false,
                    message: 'Cover image is required'
                });
                return;
            }

            const coverImageUrl = `/uploads/images/${req.file.filename}`;

            const article = await ArticleService.createArticle(articleData, req.userId, coverImageUrl);

            res.status(201).json({
                success: true,
                data: article,
                message: 'Article created successfully'
            });
        } catch (error) {
            console.error('Error creating article:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create article',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async updateArticle(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData: UpdateArticleRequest = req.body;
            if (typeof updateData.tags === 'string') {
                updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
            }


            let newCoverImageUrl: string | undefined;
            if (req.file?.filename) {
                newCoverImageUrl = `/uploads/images/${req?.file.filename}`;
            }

            const article = await ArticleService.updateArticle(id, updateData, newCoverImageUrl);

            if (!article) {
                res.status(404).json({ success: false, message: 'Article not found' });
                return;
            }

            res.json({ success: true, data: article, message: 'Article updated successfully' });
        } catch (error) {
            console.error('Error in updateArticle:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update article',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    static async deleteArticle(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await ArticleService.deleteArticle(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Article not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Article deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting article:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete article',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getPopularArticles(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 5;
            const articles = await ArticleService.getPopularArticles(limit);

            res.json({
                success: true,
                data: articles
            });
        } catch (error) {
            console.error('Error fetching popular articles:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch popular articles',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getRecentArticles(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 5;
            const articles = await ArticleService.getRecentArticles(limit);

            res.json({
                success: true,
                data: articles
            });
        } catch (error) {
            console.error('Error fetching recent articles:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch recent articles',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}