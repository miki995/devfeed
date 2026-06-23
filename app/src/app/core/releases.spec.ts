import { isReleaseSourceId, pickReleases } from './releases';
import type { Article } from '@shared/index';

const article = (id: string, sourceId: string): Article => ({
  id,
  title: id,
  url: `https://a.com/${id}`,
  summary: '',
  sourceId,
  sourceName: sourceId,
  category: 'angular',
  publishedAt: '2026-01-01T00:00:00Z',
});

describe('releases', () => {
  it('detects release and changelog source ids', () => {
    expect(isReleaseSourceId('angular-releases')).toBe(true);
    expect(isReleaseSourceId('cursor-changelog')).toBe(true);
    expect(isReleaseSourceId('angular-blog')).toBe(false);
  });

  it('picks release articles up to the limit', () => {
    const articles = [
      article('1', 'angular-releases'),
      article('2', 'angular-blog'),
      article('3', 'cursor-changelog'),
      article('4', 'node-releases'),
    ];
    const result = pickReleases(articles, 2);
    expect(result.map((item) => item.id)).toEqual(['1', '3']);
  });
});
