import type { Article } from '@shared/index';

export interface DayGroup {
  label: string;
  articles: Article[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(time: number): number {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function groupByDay(articles: Article[], now: number): DayGroup[] {
  const today = startOfDay(now);
  const groups: DayGroup[] = [];
  const byLabel = new Map<string, Article[]>();
  const order: string[] = [];

  for (const article of articles) {
    const published = startOfDay(new Date(article.publishedAt).getTime());
    const daysAgo = Math.round((today - published) / DAY_MS);
    let label: string;
    if (daysAgo <= 0) {
      label = 'Today';
    } else if (daysAgo === 1) {
      label = 'Yesterday';
    } else if (daysAgo < 7) {
      label = 'This week';
    } else if (daysAgo < 30) {
      label = 'This month';
    } else {
      label = 'Earlier';
    }
    if (!byLabel.has(label)) {
      byLabel.set(label, []);
      order.push(label);
    }
    byLabel.get(label)?.push(article);
  }

  for (const label of order) {
    groups.push({ label, articles: byLabel.get(label) ?? [] });
  }
  return groups;
}
