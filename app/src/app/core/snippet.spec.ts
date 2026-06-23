import { makeSnippet } from './snippet';

describe('makeSnippet', () => {
  const text = 'Angular signals replace the older reactive forms boilerplate with a composable api';

  it('centers the snippet on the match with ellipses', () => {
    const result = makeSnippet(text, 'reactive', 10);
    expect(result).toContain('reactive');
    expect(result.startsWith('…')).toBe(true);
    expect(result.endsWith('…')).toBe(true);
  });

  it('returns the head of the text when there is no query', () => {
    expect(makeSnippet(text, '', 10)).toBe(text.slice(0, 20).trim());
  });

  it('returns the head of the text when the query is absent', () => {
    const result = makeSnippet(text, 'svelte', 10);
    expect(result.startsWith('Angular')).toBe(true);
  });
});
