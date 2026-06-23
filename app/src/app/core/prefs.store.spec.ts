import { loadPrefs, savePrefs, DEFAULT_PREFS } from './prefs.store';

describe('prefs.store', () => {
  beforeEach(() => localStorage.clear());

  it('returns defaults when nothing stored', () => {
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
  });

  it('round-trips saved prefs', () => {
    savePrefs({ ...DEFAULT_PREFS, theme: 'terminal', disabledSourceIds: ['hn-frontpage'] });
    const loaded = loadPrefs();
    expect(loaded.theme).toBe('terminal');
    expect(loaded.disabledSourceIds).toEqual(['hn-frontpage']);
  });

  it('falls back to defaults on corrupt json', () => {
    localStorage.setItem('devfeed.prefs', '{not json');
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
  });
});
