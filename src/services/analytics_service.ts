import pool from '@/config/db';
import { AnalyticsSummary, CategoryCount, TopArticle, VisitorTrend } from '@/models/analytics';

export class AnalyticsService {
  static async getSummary(): Promise<AnalyticsSummary> {
    const articlesQuery = `
      SELECT COUNT(*) as count 
      FROM articles 
      WHERE deleted_at IS NULL
    `;
    const articlesResult = await pool.query(articlesQuery);
    const totalArticles = parseInt(articlesResult.rows[0].count);

    // Get total visitors
    const visitorsQuery = `
      SELECT SUM(total_visitors) as count 
      FROM analytics
    `;
    const visitorsResult = await pool.query(visitorsQuery);
    const totalVisitors = parseInt(visitorsResult.rows[0]?.count || '0');

    // Get total views
    const viewsQuery = `
      SELECT SUM(views) as count 
      FROM articles 
      WHERE deleted_at IS NULL
    `;
    const viewsResult = await pool.query(viewsQuery);
    const totalViews = parseInt(viewsResult.rows[0]?.count || '0');

    // Get subscribed users count
    const subscriptionsQuery = `
      SELECT COUNT(*) as count 
      FROM subscriptions 
      WHERE status = 'active'
    `;
    const subscriptionsResult = await pool.query(subscriptionsQuery);
    const subscribedUsers = parseInt(subscriptionsResult.rows[0].count);

    return {
      totalArticles,
      totalVisitors,
      totalViews,
      subscribedUsers
    };
  }

  static async getArticlesByCategory(): Promise<CategoryCount[]> {
    const query = `
      SELECT c.name as category_name, COUNT(a.id) as count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id AND a.deleted_at IS NULL
      GROUP BY c.name
      ORDER BY count DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async getMostViewedArticles(limit: number = 5): Promise<TopArticle[]> {
    const query = `
      SELECT id, title, views 
      FROM articles 
      WHERE deleted_at IS NULL 
      ORDER BY views DESC 
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  static async getVisitorTrendsByMonth(year: number, month: number): Promise<VisitorTrend[]> {
    const query = `
      SELECT 
        date_trunc('week', date)::date as week_start,
        SUM(total_visitors) as total_visitors
      FROM analytics
      WHERE 
        EXTRACT(YEAR FROM date) = $1 AND 
        EXTRACT(MONTH FROM date) = $2
      GROUP BY week_start
      ORDER BY week_start
    `;
    
    const result = await pool.query(query, [year, month]);
    return result.rows;
  }

  static async recordDailyVisitors(date: string, count: number): Promise<void> {
    const updateQuery = `
      UPDATE analytics 
      SET total_visitors = total_visitors + $1 
      WHERE date = $2
      RETURNING *
    `;
    
    const updateResult = await pool.query(updateQuery, [count, date]);
    
    // If no record exists, create a new one
    if (updateResult.rowCount === 0) {
      const insertQuery = `
        INSERT INTO analytics (date, total_visitors) 
        VALUES ($1, $2)
      `;
      
      await pool.query(insertQuery, [date, count]);
    }
  }
}