import { TimeAgoPipe } from './time-ago.pipe';

describe('TimeAgoPipe', () => {
  const pipe = new TimeAgoPipe();
  const now = new Date('2026-06-23T12:00:00Z').getTime();

  it('returns just now under a minute', () => {
    expect(pipe.transform('2026-06-23T11:59:30Z', now)).toBe('just now');
  });

  it('formats minutes', () => {
    expect(pipe.transform('2026-06-23T11:30:00Z', now)).toBe('30m');
  });

  it('formats hours', () => {
    expect(pipe.transform('2026-06-23T09:00:00Z', now)).toBe('3h');
  });

  it('formats days', () => {
    expect(pipe.transform('2026-06-21T12:00:00Z', now)).toBe('2d');
  });

  it('returns empty for invalid dates', () => {
    expect(pipe.transform('not-a-date', now)).toBe('');
  });
});
