import express from 'express';
import { AnalyticsController } from '@/controllers/analytics_controller';
import { authenticateToken, requireAdmin } from '@/middleware/authentication_middleware';

const router = express.Router();

router.get('/summary', authenticateToken, requireAdmin, AnalyticsController.getSummary);
router.get('/articles-by-category', authenticateToken, requireAdmin, AnalyticsController.getArticlesByCategory);
router.get('/most-viewed-articles', authenticateToken, requireAdmin, AnalyticsController.getMostViewedArticles);
router.get('/visitor-trends', authenticateToken, requireAdmin, AnalyticsController.getVisitorTrends);

router.post('/record-visit', AnalyticsController.recordVisit);

export default router;