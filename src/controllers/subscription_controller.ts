import { Request, Response } from 'express';
import { SubscriptionService } from '@/services/subscription_service';

interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

export class SubscriptionController {
  static async subscribe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          message: 'You must be logged in to subscribe'
        });
        return;
      }
      
      const subscription = await SubscriptionService.subscribe(req.userId);
      
      res.status(201).json({
        success: true,
        data: subscription,
        message: 'Successfully subscribed to newsletter'
      });
    } catch (error) {
      console.error('Subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to subscribe',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  static async unsubscribe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          message: 'You must be logged in to unsubscribe'
        });
        return;
      }
      
      const success = await SubscriptionService.unsubscribe(req.userId);
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
        return;
      }
      
      res.json({
        success: true,
        message: 'Successfully unsubscribed from newsletter'
      });
    } catch (error) {
      console.error('Unsubscribe error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unsubscribe',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  static async checkSubscriptionStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          message: 'You must be logged in to check subscription status'
        });
        return;
      }
      
      const isSubscribed = await SubscriptionService.checkSubscriptionStatus(req.userId);
      
      res.json({
        success: true,
        isSubscribed
      });
    } catch (error) {
      console.error('Check subscription status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check subscription status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
    static async sendNewsletterNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId || req.userRole !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Only administrators can send newsletter notifications'
        });
        return;
      }
      
      // Hardcoded values - no need for request body parameters
      const timeFrame = 7; // Last 7 days of articles
      const subject = 'Check Out Our Latest Football News!';
      
      res.json({
        success: true,
        message: 'Newsletter notification process has been started'
      });
      
      SubscriptionService.sendNewsletterNotification(timeFrame, subject)
        .then(sentCount => {
          console.log(`Successfully sent ${sentCount} newsletter notifications`);
        })
        .catch(error => {
          console.error('Error sending newsletter notifications:', error);
        });
      
    } catch (error) {
      console.error('Send newsletter notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send newsletter notifications',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}