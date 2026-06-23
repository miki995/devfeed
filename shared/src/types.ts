export type Category =
  | 'ai-agents'
  | 'ai-integration'
  | 'frontend'
  | 'angular'
  | 'react'
  | 'vue-svelte'
  | 'backend'
  | 'spring-boot'
  | 'nestjs'
  | 'node'
  | 'javascript'
  | 'typescript'
  | 'devops'
  | 'medium';

export interface Source {
  id: string;
  name: string;
  category: Category;
  type: 'rss' | 'hackernews' | 'devto';
  url: string;
  enabled: boolean;
  homepage?: string;
}

export interface Article {
  id: string;
  title: string;
  url: string;
  summary: string;
  sourceId: string;
  sourceName: string;
  category: Category;
  publishedAt: string;
  points?: number;
  comments?: number;
}

export interface FeedBundle {
  generatedAt: string;
  count: number;
  articles: Article[];
  sources: Source[];
}
