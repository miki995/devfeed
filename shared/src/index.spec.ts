import { CATEGORY_IDS, isCategory } from './index';

describe('category guards', () => {
  it('recognizes known category ids', () => {
    expect(isCategory('ai-agents')).toBe(true);
    expect(isCategory('angular')).toBe(true);
  });

  it('rejects unknown ids', () => {
    expect(isCategory('blockchain')).toBe(false);
  });

  it('exposes a stable ordered id list', () => {
    expect(CATEGORY_IDS[0]).toBe('ai-agents');
    expect(CATEGORY_IDS.length).toBeGreaterThanOrEqual(8);
  });
});
