import { readFileSync, readdirSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Writes only when the content actually differs. Most articles are unchanged between
 * runs, so rewriting every file each time produced ~950 pointless writes per scrape.
 */
export function writeIfChanged(path: string, content: string): boolean {
  try {
    if (readFileSync(path, 'utf8') === content) {
      return false;
    }
  } catch {
    // Missing or unreadable — fall through and write it.
  }
  writeFileSync(path, content);
  return true;
}

/** Deletes files in `dir` whose name is not in `keep`. Returns how many were removed. */
export function pruneStale(dir: string, keep: Set<string>): number {
  let removed = 0;
  for (const name of readdirSync(dir)) {
    if (!keep.has(name)) {
      unlinkSync(join(dir, name));
      removed += 1;
    }
  }
  return removed;
}
