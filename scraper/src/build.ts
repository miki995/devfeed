import { mkdirSync } from 'fs';
import { join } from 'path';
import type { Article, SearchEntry } from '@shared/index';
import { SOURCES } from './sources';
import { fetchAllSources } from './fetch-feed';
import { aggregate } from './aggregate';
import { fetchFullText, mapWithPool } from './extract';
import { readingMinutes } from './normalize';
import { addAiSummaries } from './ai-summary';
import { redactSecrets } from './redact';
import { writeIfChanged, pruneStale } from './write';

const MIN_CONTENT_LENGTH = 280;
const MIN_ARTICLES = 50;

function redactArticle(article: Article): void {
  article.title = redactSecrets(article.title);
  article.summary = redactSecrets(article.summary);
  if (article.content) {
    article.content = redactSecrets(article.content);
  }
  if (article.aiSummary) {
    article.aiSummary = redactSecrets(article.aiSummary);
  }
}

async function run(): Promise<void> {
  const enabledSources = SOURCES.filter((source) => source.enabled);
  const perSourceResults = await fetchAllSources(enabledSources);
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

  for (const article of bundle.articles) {
    if (article.content) {
      article.readMinutes = readingMinutes(article.content);
    }
  }

  const summarized = await addAiSummaries(bundle.articles);

  for (const article of bundle.articles) {
    redactArticle(article);
  }

  // The data directory is the only source of feed content for the deploy, so an
  // empty-ish scrape must fail loudly rather than publish a blank feed.
  if (bundle.count < MIN_ARTICLES) {
    throw new Error(`only ${bundle.count} articles scraped, expected at least ${MIN_ARTICLES}`);
  }

  const dataDir = join(__dirname, '..', '..', 'app', 'public', 'data');
  const articlesDir = join(dataDir, 'articles');
  mkdirSync(articlesDir, { recursive: true });

  let withContent = 0;
  let changed = 0;
  const keep = new Set<string>();
  const searchIndex: SearchEntry[] = [];
  const indexArticles = bundle.articles.map((article) => {
    const { content, ...listing } = article;
    if (content) {
      withContent += 1;
      const filename = `${article.id}.json`;
      keep.add(filename);
      if (writeIfChanged(join(articlesDir, filename), JSON.stringify({ id: article.id, content }))) {
        changed += 1;
      }
    }
    const searchText = `${article.title} ${article.summary} ${content?.slice(0, 1500) ?? ''}`.toLowerCase();
    searchIndex.push({ id: article.id, text: searchText });
    return { ...listing, hasContent: !!content };
  });
  const removed = pruneStale(articlesDir, keep);

  const indexBundle = { ...bundle, articles: indexArticles };
  writeIfChanged(join(dataDir, 'news.json'), JSON.stringify(indexBundle));
  writeIfChanged(join(dataDir, 'sources.json'), JSON.stringify(SOURCES));
  writeIfChanged(join(dataDir, 'search.json'), JSON.stringify(searchIndex));

  console.log(
    `[devfeed] ${bundle.count} articles (${withContent} readable in-app, ${recovered} recovered, ${summarized} ai-summarized) from ${enabledSources.length} sources`,
  );
  console.log(`[devfeed] article files: ${changed} written, ${withContent - changed} unchanged, ${removed} removed`);
}

run()
  .then(
    () =>
      // The HTTP keep-alive sockets opened by rss-parser and article-extractor keep the
      // event loop alive after the data is written, which used to hang the job until the
      // 6h Actions timeout. The work is done here, so exit deterministically — but let
      // stdout drain first, since it is a pipe under CI.
      new Promise<void>((resolve) => process.stdout.write('', () => resolve())).then(() => process.exit(0)),
  )
  .catch((error) => {
    console.error('[devfeed] build failed', error);
    process.exit(1);
  });
