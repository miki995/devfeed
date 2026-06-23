import { CATEGORY_IDS } from '@shared/index';
import type { Category } from '@shared/index';

export interface Prefs {
  enabledCategories: Category[];
  disabledSourceIds: string[];
  savedArticleIds: string[];
  readArticleIds: string[];
  theme: string;
  lastVisitAt: string;
  lastCategory: string;
  lastView: string;
  hideRead: boolean;
}

export const DEFAULT_PREFS: Prefs = {
  enabledCategories: [...CATEGORY_IDS],
  disabledSourceIds: [],
  savedArticleIds: [],
  readArticleIds: [],
  theme: 'midnight',
  lastVisitAt: '',
  lastCategory: 'all',
  lastView: 'all',
  hideRead: false,
};

const STORAGE_KEY = 'devfeed.prefs';

export function loadPrefs(): Prefs {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_PREFS;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: Prefs): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
