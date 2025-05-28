import pool from '@/config/db';
import { Subscription } from '@/models/subscription';
import nodemailer from 'nodemailer';
import { ArticleService } from './article_service';

export class SubscriptionService {
  static async subscribe(userId: string): Promise<Subscription> {
    // First check if user is already subscribed
    const existingQuery = `
      SELECT * FROM subscriptions
      WHERE user_id = $1
    `;

    const existingResult = await pool.query(existingQuery, [userId]);

    if (existingResult.rows.length > 0) {
      // If subscription exists but was deleted, reactivate it
      if (existingResult.rows[0].status !== 'active') {
        const updateQuery = `
          UPDATE subscriptions
          SET status = 'active', created_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
          RETURNING *
        `;

        const result = await pool.query(updateQuery, [userId]);
        return result.rows[0];
      }

      // Already subscribed
      return existingResult.rows[0];
    }

    // Create new subscription
    const insertQuery = `
      INSERT INTO subscriptions (user_id)
      VALUES ($1)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [userId]);
    return result.rows[0];
  }

  static async unsubscribe(userId: string): Promise<boolean> {
    const deleteQuery = `
      DELETE FROM subscriptions
      WHERE user_id = $1
      RETURNING id
    `;

    const result = await pool.query(deleteQuery, [userId]);
    return result.rowCount !== 0;
  }

  static async checkSubscriptionStatus(userId: string): Promise<boolean> {
    const query = `
      SELECT * FROM subscriptions
      WHERE user_id = $1 AND status = 'active'
    `;

    const result = await pool.query(query, [userId]);
    return result.rows.length > 0;
  }

  static async getAllActiveSubscribers(): Promise<{ userId: string; email: string }[]> {
    const query = `
      SELECT s.user_id as "userId", u.email
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.status = 'active'
    `;

    const result = await pool.query(query);
    return result.rows;
  }
  // Replace the existing sendNewsletterNotification method

  static async sendNewsletterNotification(timeFrame: number = 7, subject?: string): Promise<number> {
    // Get all active subscribers
    const subscribers = await this.getAllActiveSubscribers();

    if (subscribers.length === 0) {
      return 0;
    }

    // Get recent articles
    const recentArticles = await ArticleService.getRecentArticlesByTimeFrame(timeFrame);

    if (recentArticles.length === 0) {
      return 0;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    const emailSubject = subject || `Football News: ${recentArticles.length} New Articles This Week`;

    const batchSize = 50;
    let sentCount = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      const emailPromises = batch.map(subscriber => {
        const emailContent = this.createNewsletterContent(recentArticles);

        return transporter.sendMail({
          from: {
            name: "Football News",
            address: process.env.SMTP_USER || ''
          },
          to: subscriber.email,
          subject: emailSubject,
          html: emailContent
        });
      });

      const results = await Promise.allSettled(emailPromises);

      sentCount += results.filter(result => result.status === 'fulfilled').length;
    }

    return sentCount;
  }
  private static createNewsletterContent(articles: any[]): string {
    const articlesList = articles.map(article =>
      `<li style="margin-bottom: 10px;">
        <a href="${process.env.FRONTEND_URL}/articles/${article.id}" style="color: #1a65b7; font-weight: bold; text-decoration: none;">
          ${article.title}
        </a> - ${article.summary.substring(0, 120)}...
      </li>`
    ).join('');

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a65b7;">Latest Football News Articles</h2>
        <p>Hello football fan!</p>
        <p>We're excited to share our latest articles with you. Check out what's new in the football world:</p>
        
        <ul style="padding-left: 20px;">
          ${articlesList}
        </ul>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p>Stay up-to-date with the latest football news and stories.</p>
          <p>
            <a href="${process.env.FRONTEND_URL}" style="color: #1a65b7;">Visit our website</a> | 
            <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #666;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `;
  }
}