import { cycleChannel, CHANNEL_ORDER } from './navigation';

describe('cycleChannel', () => {
  it('moves forward from all to the first category', () => {
    expect(cycleChannel('all', 1)).toBe(CHANNEL_ORDER[1]);
  });

  it('wraps backward from all to the last channel', () => {
    expect(cycleChannel('all', -1)).toBe(CHANNEL_ORDER[CHANNEL_ORDER.length - 1]);
  });

  it('wraps forward from the last channel back to all', () => {
    const last = CHANNEL_ORDER[CHANNEL_ORDER.length - 1];
    expect(cycleChannel(last, 1)).toBe('all');
  });

  it('falls back to all for an unknown channel', () => {
    expect(cycleChannel('unknown' as never, 1)).toBe(CHANNEL_ORDER[1]);
  });
});
