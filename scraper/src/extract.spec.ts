import { mapWithPool } from './extract';

describe('mapWithPool', () => {
  it('processes every item and preserves order', async () => {
    const items = [1, 2, 3, 4, 5];
    const results = await mapWithPool(items, 2, async (value) => value * 2);
    expect(results).toEqual([2, 4, 6, 8, 10]);
  });

  it('never runs more than the pool size at once', async () => {
    let active = 0;
    let peak = 0;
    await mapWithPool([1, 2, 3, 4, 5, 6], 2, async () => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
      return null;
    });
    expect(peak).toBeLessThanOrEqual(2);
  });
});
