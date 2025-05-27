export interface AnalyticsSummary {
  totalArticles: number;
  totalVisitors: number;
  totalViews: number;
  subscribedUsers: number;
}

export interface CategoryCount {
  category_name: string;
  count: number;
}

export interface TopArticle {
  id: string;
  title: string;
  views: number;
}

export interface VisitorTrend {
  week_start: string;
  total_visitors: number;
}