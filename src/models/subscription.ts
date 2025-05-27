export interface Subscription {
  id: string;
  user_id: string;
  created_at: Date;
  status: 'active' | 'inactive';
}

export interface SubscriptionRequest {
  user_id: string;
}

export interface NewsletterNotificationRequest {
  subject?: string;
  timeFrame?: number; // Number of days to look back for new articles
}