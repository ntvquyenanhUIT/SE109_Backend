import { Request, Response } from 'express';
import { CommentService } from '@/services/comment_service';
import { CreateCommentRequest, UpdateCommentRequest } from '@/models/comment';

interface AuthenticatedRequest extends Request {
    userId?: string;
    userRole?: string;
}

export class CommentController {
    static async getCommentsByArticleId(req: Request, res: Response): Promise<void> {
        try {
            const { articleId } = req.params;
            const comments = await CommentService.getCommentsByArticleId(articleId);
            
            res.json({
                success: true,
                data: comments
            });
        } catch (error) {
            console.error('Error fetching comments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch comments',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async createComment(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.userId) {
                res.status(401).json({
                    success: false,
                    message: 'You must be logged in to comment'
                });
                return;
            }
            
            const commentData: CreateCommentRequest = req.body;
            
            if (!commentData.content || !commentData.article_id) {
                res.status(400).json({
                    success: false,
                    message: 'Comment content and article ID are required'
                });
                return;
            }
            
            const comment = await CommentService.createComment(commentData, req.userId);
            
            res.status(201).json({
                success: true,
                data: comment,
                message: 'Comment created successfully'
            });
        } catch (error) {
            console.error('Error creating comment:', error);
            
            if (error instanceof Error && 
                error.message.includes('inappropriate content')) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: 'Failed to create comment',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async updateComment(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.userId) {
                res.status(401).json({
                    success: false,
                    message: 'You must be logged in to update a comment'
                });
                return;
            }
            
            const { id } = req.params;
            const updateData: UpdateCommentRequest = req.body;
            
            if (!updateData.content) {
                res.status(400).json({
                    success: false,
                    message: 'Comment content is required'
                });
                return;
            }
            
            const isAdmin = req.userRole === 'admin';
            const comment = await CommentService.updateComment(id, req.userId, isAdmin, updateData);
            
            if (!comment) {
                res.status(404).json({
                    success: false,
                    message: 'Comment not found or you do not have permission to update it'
                });
                return;
            }
            
            res.json({
                success: true,
                data: comment,
                message: 'Comment updated successfully'
            });
        } catch (error) {
            console.error('Error updating comment:', error);
            
            if (error instanceof Error && 
                error.message.includes('inappropriate content')) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: 'Failed to update comment',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async deleteComment(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.userId) {
                res.status(401).json({
                    success: false,
                    message: 'You must be logged in to delete a comment'
                });
                return;
            }
            
            const { id } = req.params;
            const isAdmin = req.userRole === 'admin';
            const success = await CommentService.deleteComment(id, req.userId, isAdmin);
            
            if (!success) {
                res.status(404).json({
                    success: false,
                    message: 'Comment not found or you do not have permission to delete it'
                });
                return;
            }
            
            res.json({
                success: true,
                message: 'Comment deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting comment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete comment',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async likeComment(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.userId) {
                res.status(401).json({
                    success: false,
                    message: 'You must be logged in to like a comment'
                });
                return;
            }
            
            const { id } = req.params;
            const comment = await CommentService.likeComment(id);
            
            if (!comment) {
                res.status(404).json({
                    success: false,
                    message: 'Comment not found'
                });
                return;
            }
            
            res.json({
                success: true,
                data: comment,
                message: 'Comment liked successfully'
            });
        } catch (error) {
            console.error('Error liking comment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to like comment',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}