import express from 'express';
import { ArticleController } from '@/controllers/article_controller';
import { uploadImage } from '@/middleware/upload_middleware';
import { authenticateToken, requireAdmin } from '@/middleware/authentication_middleware';

const router = express.Router();

router.get('/', ArticleController.getAllArticles);
router.get('/popular', ArticleController.getPopularArticles);
router.get('/recent', ArticleController.getRecentArticles);
router.get('/:id', ArticleController.getArticleById);

router.post('/', authenticateToken, requireAdmin, uploadImage.single('coverImage'), ArticleController.createArticle);
router.put('/:id', authenticateToken, requireAdmin, uploadImage.single('coverImage'), ArticleController.updateArticle);
router.delete('/:id', authenticateToken, requireAdmin, ArticleController.deleteArticle);

export default router;