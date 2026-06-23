import { hashUrl, stripHtml, truncate, summarize, toReadableText, dedupeByUrl, sortByDateDesc, capPerSource } from './normalize';
import type { Article } from '@shared/index';

const makeArticle = (over: Partial<Article>): Article => ({
  id: 'x',
  title: 't',
  url: 'https://a.com/1',
  summary: '',
  sourceId: 's',
  sourceName: 'S',
  category: 'frontend',
  publishedAt: '2026-01-01T00:00:00Z',
  ...over,
});

describe('normalize', () => {
  it('hashUrl is stable and url-safe', () => {
    expect(hashUrl('https://a.com/1')).toBe(hashUrl('https://a.com/1'));
    expect(hashUrl('https://a.com/1')).toMatch(/^[a-z0-9]+$/);
  });

  it('stripHtml removes tags and decodes basic entities', () => {
    expect(stripHtml('<p>Hello &amp; <b>world</b></p>')).toBe('Hello & world');
  });

  it('stripHtml handles undefined', () => {
    expect(stripHtml(undefined)).toBe('');
  });

  it('truncate leaves short text untouched', () => {
    expect(truncate('short', 100)).toBe('short');
  });

  it('truncate clips long text at a word boundary with an ellipsis', () => {
    const result = truncate('one two three four five six seven', 12);
    expect(result.endsWith('…')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(13);
  });

  it('toReadableText keeps paragraph breaks and bullets', () => {
    const html = '<h2>Title</h2><p>First para.</p><ul><li>one</li><li>two</li></ul>';
    const result = toReadableText(html);
    expect(result).toContain('First para.');
    expect(result).toContain('• one');
    expect(result).toContain('\n');
    expect(result).not.toContain('<');
  });

  it('toReadableText returns empty for missing input', () => {
    expect(toReadableText(undefined)).toBe('');
  });

  it('summarize strips html and caps length', () => {
    const long = `<p>${'word '.repeat(100)}</p>`;
    const result = summarize(long);
    expect(result).not.toContain('<');
    expect(result.length).toBeLessThanOrEqual(241);
  });

  it('dedupeByUrl keeps first occurrence', () => {
    const result = dedupeByUrl([makeArticle({ id: '1' }), makeArticle({ id: '2' })]);
    expect(result.map((article) => article.id)).toEqual(['1']);
  });

  it('sortByDateDesc orders newest first', () => {
    const result = sortByDateDesc([
      makeArticle({ id: 'old', publishedAt: '2025-01-01T00:00:00Z' }),
      makeArticle({ id: 'new', publishedAt: '2026-06-01T00:00:00Z' }),
    ]);
    expect(result[0].id).toBe('new');
  });

  it('capPerSource limits items per source', () => {
    const many = Array.from({ length: 5 }, (_unused, index) =>
      makeArticle({ id: String(index), url: `https://a.com/${index}`, sourceId: 's' }),
    );
    expect(capPerSource(many, 2).length).toBe(2);
  });
});
