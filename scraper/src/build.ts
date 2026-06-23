import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { SOURCES } from './sources';
import { fetchSource } from './fetch-feed';
import { aggregate } from './aggregate';

async function run(): Promise<void> {
  const enabledSources = SOURCES.filter((source) => source.enabled);
  const perSourceResults = await Promise.all(enabledSources.map((source) => fetchSource(source)));
  const bundle = aggregate(perSourceResults, SOURCES);

  const outputDir = join(__dirname, '..', '..', 'app', 'public', 'data');
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, 'news.json'), JSON.stringify(bundle));
  writeFileSync(join(outputDir, 'sources.json'), JSON.stringify(SOURCES));

  console.log(`[devfeed] wrote ${bundle.count} articles from ${enabledSources.length} sources`);
}

run().catch((error) => {
  console.error('[devfeed] build failed', error);
  process.exit(1);
});
