import express from 'express';
import { CommentController } from '@/controllers/comment_controller';
import { authenticateToken } from '@/middleware/authentication_middleware';

const router = express.Router();


router.get('/article/:articleId', CommentController.getCommentsByArticleId);

router.post('/', authenticateToken, CommentController.createComment);

router.put('/:id', authenticateToken, CommentController.updateComment);

router.delete('/:id', authenticateToken, CommentController.deleteComment);

router.post('/:id/like', authenticateToken, CommentController.likeComment);

export default router;