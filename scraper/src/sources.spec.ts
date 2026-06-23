import { SOURCES } from './sources';
import { isCategory } from '@shared/index';

describe('SOURCES catalog', () => {
  it('has a unique id for every source', () => {
    const ids = SOURCES.map((source) => source.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only uses known categories', () => {
    const invalid = SOURCES.filter((source) => !isCategory(source.category));
    expect(invalid).toEqual([]);
  });

  it('covers every focus area', () => {
    const categoriesPresent = new Set(SOURCES.map((source) => source.category));
    ['ai-agents', 'ai-integration', 'frontend', 'angular', 'spring-boot', 'nestjs', 'javascript', 'typescript', 'devops', 'medium'].forEach(
      (category) => expect(categoriesPresent.has(category as never)).toBe(true),
    );
  });

  it('uses only supported source types', () => {
    const badType = SOURCES.filter((source) => !['rss', 'hackernews', 'devto'].includes(source.type));
    expect(badType).toEqual([]);
  });
});
