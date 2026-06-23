import { pickTrending, articleScore } from './trending';
import type { Article } from '@shared/index';

const now = new Date('2026-06-23T12:00:00Z').getTime();
const article = (id: string, publishedAt: string, points?: number, comments?: number): Article => ({
  id,
  title: id,
  url: `https://a.com/${id}`,
  summary: '',
  sourceId: 's',
  sourceName: 'S',
  category: 'frontend',
  publishedAt,
  points,
  comments,
});

describe('trending', () => {
  it('scores points plus weighted comments', () => {
    expect(articleScore(article('x', '', 10, 5))).toBe(20);
  });

  it('ranks recent high-score articles and drops old or zero-score ones', () => {
    const result = pickTrending(
      [
        article('hot', '2026-06-23T06:00:00Z', 200, 50),
        article('warm', '2026-06-22T20:00:00Z', 80, 10),
        article('old', '2026-06-10T06:00:00Z', 500, 100),
        article('quiet', '2026-06-23T06:00:00Z', 0, 0),
      ],
      now,
      3,
    );
    expect(result.map((item) => item.id)).toEqual(['hot', 'warm']);
  });
});
