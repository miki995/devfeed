import { mkdtempSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { writeIfChanged, pruneStale } from './write';

function createDir(): string {
  return mkdtempSync(join(tmpdir(), 'devfeed-write-'));
}

describe('writeIfChanged', () => {
  it('writes a file that does not exist yet', () => {
    const path = join(createDir(), 'a.json');
    expect(writeIfChanged(path, '{"id":"a"}')).toBe(true);
    expect(readFileSync(path, 'utf8')).toBe('{"id":"a"}');
  });

  it('leaves an identical file untouched', () => {
    const path = join(createDir(), 'a.json');
    writeIfChanged(path, '{"id":"a"}');
    const before = statSync(path).mtimeMs;
    expect(writeIfChanged(path, '{"id":"a"}')).toBe(false);
    expect(statSync(path).mtimeMs).toBe(before);
  });

  it('rewrites a file whose content changed', () => {
    const path = join(createDir(), 'a.json');
    writeIfChanged(path, '{"id":"a"}');
    expect(writeIfChanged(path, '{"id":"b"}')).toBe(true);
    expect(readFileSync(path, 'utf8')).toBe('{"id":"b"}');
  });
});

describe('pruneStale', () => {
  it('removes only the files that are no longer wanted', () => {
    const dir = createDir();
    for (const name of ['keep.json', 'drop.json', 'also-drop.json']) {
      writeFileSync(join(dir, name), '{}');
    }
    expect(pruneStale(dir, new Set(['keep.json']))).toBe(2);
    expect(readdirSync(dir)).toEqual(['keep.json']);
  });

  it('removes nothing when everything is wanted', () => {
    const dir = createDir();
    writeFileSync(join(dir, 'keep.json'), '{}');
    expect(pruneStale(dir, new Set(['keep.json']))).toBe(0);
    expect(readdirSync(dir)).toEqual(['keep.json']);
  });

  it('handles an empty directory', () => {
    const dir = join(createDir(), 'nested');
    mkdirSync(dir);
    expect(pruneStale(dir, new Set(['keep.json']))).toBe(0);
  });
});
