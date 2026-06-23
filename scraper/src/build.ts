import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { SOURCES } from './sources';
import { fetchSource } from './fetch-feed';
import { aggregate } from './aggregate';
import { fetchFullText, mapWithPool } from './extract';

const MIN_CONTENT_LENGTH = 280;

async function run(): Promise<void> {
  const enabledSources = SOURCES.filter((source) => source.enabled);
  const perSourceResults = await Promise.all(enabledSources.map((source) => fetchSource(source)));
  const bundle = aggregate(perSourceResults, SOURCES);

  const needsContent = bundle.articles.filter((article) => !article.content);
  let recovered = 0;
  await mapWithPool(needsContent, 8, async (article) => {
    const fullText = await fetchFullText(article.url);
    if (fullText.length >= MIN_CONTENT_LENGTH) {
      article.content = fullText;
      recovered += 1;
    }
  });

  const dataDir = join(__dirname, '..', '..', 'app', 'public', 'data');
  const articlesDir = join(dataDir, 'articles');
  mkdirSync(dataDir, { recursive: true });
  rmSync(articlesDir, { recursive: true, force: true });
  mkdirSync(articlesDir, { recursive: true });

  let withContent = 0;
  const indexArticles = bundle.articles.map((article) => {
    const { content, ...listing } = article;
    if (content) {
      withContent += 1;
      writeFileSync(join(articlesDir, `${article.id}.json`), JSON.stringify({ id: article.id, content }));
    }
    return { ...listing, hasContent: !!content };
  });

  const indexBundle = { ...bundle, articles: indexArticles };
  writeFileSync(join(dataDir, 'news.json'), JSON.stringify(indexBundle));
  writeFileSync(join(dataDir, 'sources.json'), JSON.stringify(SOURCES));

  console.log(
    `[devfeed] wrote ${bundle.count} articles (${withContent} readable in-app, ${recovered} recovered by extraction) from ${enabledSources.length} sources`,
  );
}

run().catch((error) => {
  console.error('[devfeed] build failed', error);
  process.exit(1);
});
