import { CATEGORY_IDS } from '@shared/index';
import type { Category } from '@shared/index';

export type ChannelId = Category | 'all';

export const CHANNEL_ORDER: ChannelId[] = ['all', ...CATEGORY_IDS];

export function cycleChannel(current: ChannelId, direction: 1 | -1): ChannelId {
  const index = CHANNEL_ORDER.indexOf(current);
  const safeIndex = index === -1 ? 0 : index;
  const nextIndex = (safeIndex + direction + CHANNEL_ORDER.length) % CHANNEL_ORDER.length;
  return CHANNEL_ORDER[nextIndex];
}
