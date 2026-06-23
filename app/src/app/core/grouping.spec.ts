import { groupByDay } from './grouping';
import type { Article } from '@shared/index';

const now = new Date('2026-06-23T12:00:00Z').getTime();
const article = (id: string, publishedAt: string): Article => ({
  id,
  title: id,
  url: `https://a.com/${id}`,
  summary: '',
  sourceId: 's',
  sourceName: 'S',
  category: 'frontend',
  publishedAt,
});

describe('groupByDay', () => {
  it('buckets articles into relative day labels in order', () => {
    const groups = groupByDay(
      [
        article('today', '2026-06-23T08:00:00Z'),
        article('yesterday', '2026-06-22T20:00:00Z'),
        article('week', '2026-06-20T10:00:00Z'),
        article('old', '2026-03-01T10:00:00Z'),
      ],
      now,
    );
    expect(groups.map((group) => group.label)).toEqual(['Today', 'Yesterday', 'This week', 'Earlier']);
    expect(groups[0].articles.map((item) => item.id)).toEqual(['today']);
  });

  it('keeps multiple articles within the same bucket', () => {
    const groups = groupByDay(
      [article('a', '2026-06-23T08:00:00Z'), article('b', '2026-06-23T09:00:00Z')],
      now,
    );
    expect(groups.length).toBe(1);
    expect(groups[0].articles.length).toBe(2);
  });
});
