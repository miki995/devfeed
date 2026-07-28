# DevFeed

One place to keep up with development. DevFeed pulls the latest news, releases and
best-practice reads across frontend, backend and AI — including coding agents like
Claude Code and Cursor — into a single, filterable feed.

It runs as a progressive web app, so it works in the browser and installs to your
phone or desktop. There is no server to pay for: a scheduled job fetches the feeds,
writes them as static JSON, and ships that alongside the app.

## How it works

```
GitHub Actions (every 2h, and on every push to main)
  -> scraper fetches RSS / Atom / APIs
  -> writes app/public/data/*.json
  -> ng build bundles app + data into one artifact

GitHub Pages
  -> serves the app + the JSON

Browser / installed PWA
  -> reads the JSON, filters happen on the client
```

The scraped JSON is **not committed**. It is regenerated on every run and lives only
in the deployed artifact, which keeps the repo small and keeps scraped text (which
sometimes contains credential-shaped strings) out of git history. A scrape that
returns too little data fails the job, leaving the previous deployment live.

## Project layout

```
shared/    TypeScript types shared by the scraper and the app
scraper/   Node + TypeScript, fetches and normalizes the feeds
app/       Angular PWA
.github/   one workflow: scrape -> build -> Pages deploy
```

## Running locally

```bash
npm install

npm --workspace scraper run build:data   # fetch feeds into app/public/data
npm --workspace app start                # serve the app on http://localhost:4200
```

The scraper step is required before the first run — `app/public/data` is generated and
not checked in, so the feed is empty without it. Re-running it only rewrites the
articles that actually changed.

Run the tests:

```bash
npm --workspace shared test
npm --workspace scraper test
npm --workspace app test
```

## Adding or removing a source

Sources live in `scraper/src/sources.ts`. Each entry is one object:

```ts
{ id: 'angular-blog', name: 'Angular blog', category: 'angular', type: 'rss', url: 'https://blog.angular.dev/feed', enabled: true }
```

Set `enabled: false` to hide a source, or add a new entry. Supported types are
`rss`, `hackernews` and `devto`. Categories are defined in `shared/src/types.ts`.

## Android (Play Store)

The PWA can be wrapped as an Android app with a Trusted Web Activity. See
[docs/play-store.md](docs/play-store.md).

## License

MIT
