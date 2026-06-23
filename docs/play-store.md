# Publishing to the Play Store

DevFeed is a PWA, so it ships to Android as a Trusted Web Activity (TWA) — a thin
native wrapper around the live web app. You build the wrapper with Bubblewrap.

## Prerequisites

- The app deployed and reachable over HTTPS (GitHub Pages works).
- Java 17+ and the Android SDK (Bubblewrap can install these for you).
- A Google Play developer account (one-time $25 fee).

## Build the wrapper

```bash
npm install -g @bubblewrap/cli

bubblewrap init --manifest https://<your-user>.github.io/devfeed/manifest.webmanifest
bubblewrap build
```

This produces a signed `app-release-bundle.aab` to upload to the Play Console, and
an APK you can sideload to test on a device.

## Verify the link (removes the browser address bar)

Bubblewrap prints an `assetlinks.json` fingerprint during the build. Publish it at:

```
https://<your-user>.github.io/.well-known/assetlinks.json
```

Once Google verifies it, the app opens full-screen without the browser chrome.

## Updating

The wrapper points at the live URL, so day-to-day content and UI updates ship by
deploying the web app — no new Play Store release needed. Rebuild and resubmit the
AAB only when you change the app name, icons or the wrapper configuration.
