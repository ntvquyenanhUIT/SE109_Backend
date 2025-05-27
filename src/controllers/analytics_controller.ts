import { Request, Response } from 'express';
import { AnalyticsService } from '@/services/analytics_service';

export class AnalyticsController {
  static async getSummary(_req: Request, res: Response): Promise<void> {
    try {
      const summary = await AnalyticsService.getSummary();
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics summary',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getArticlesByCategory(_req: Request, res: Response): Promise<void> {
    try {
      const categoryCounts = await AnalyticsService.getArticlesByCategory();
      
      res.json({
        success: true,
        data: categoryCounts
      });
    } catch (error) {
      console.error('Error fetching articles by category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch articles by category',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getMostViewedArticles(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const articles = await AnalyticsService.getMostViewedArticles(limit);
      
      res.json({
        success: true,
        data: articles
      });
    } catch (error) {
      console.error('Error fetching most viewed articles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch most viewed articles',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getVisitorTrends(req: Request, res: Response): Promise<void> {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      
      const trends = await AnalyticsService.getVisitorTrendsByMonth(year, month);
      
      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      console.error('Error fetching visitor trends:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch visitor trends',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async recordVisit(req: Request, res: Response): Promise<void> {
    try {
      const { date = new Date().toISOString().split('T')[0] } = req.body;
      
      await AnalyticsService.recordDailyVisitors(date, 1);
      
      res.json({
        success: true,
        message: 'Visit recorded successfully'
      });
    } catch (error) {
      console.error('Error recording visit:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record visit',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}