# DevFeed

One place to keep up with development. DevFeed pulls the latest news, releases and
best-practice reads across frontend, backend and AI — including coding agents like
Claude Code and Cursor — into a single, filterable feed.

It runs as a progressive web app, so it works in the browser and installs to your
phone or desktop. There is no server to pay for: a scheduled job fetches the feeds
and commits them as static JSON, and the app reads that.

## How it works

```
GitHub Actions (every 2h)
  -> scraper fetches RSS / Atom / APIs
  -> writes app/public/data/news.json
  -> commits it back

GitHub Pages
  -> serves the app + the JSON

Browser / installed PWA
  -> reads the JSON, filters happen on the client
```

## Project layout

```
shared/    TypeScript types shared by the scraper and the app
scraper/   Node + TypeScript, fetches and normalizes the feeds
app/       Angular PWA
.github/   scheduled scrape + Pages deploy
```

## Running locally

```bash
npm install

npm --workspace scraper run build:data   # fetch feeds into app/public/data
npm --workspace app start                # serve the app on http://localhost:4200
```

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
