# Quick Search

Query **Perplexity**, **Google**, **DuckDuckGo**, or **Bing** instantly from Raycast — with live autocomplete suggestions and recent searches. No account, sign-in, or API key required.

## Features

- **Quick Search** command: type a query and press `↵` to open it in your chosen engine in the default browser.
- **Engine switcher**: switch engines from the search bar dropdown. Your last choice is remembered.
- **Live suggestions** while you type, powered by keyless public suggestion endpoints. Suggestions degrade gracefully when offline — the plain search row always works.
- **Recent searches** appear when the search bar is empty. Remove a single entry with `⌃` `X` or clear everything with `⌃` `⇧` `X`.
- **Open With …**: run the same query against any other engine via `⌘` `1`–`⌘` `3` without changing the active engine.
- **Fallback command**: enable *Quick Search* as a fallback in Raycast → Settings → Fallback Commands to search whatever you typed in root search.
- Works with the optional `query` argument for one-shot launches from root search.

## Preferences

| Preference | Default | Description |
| --- | --- | --- |
| Default Search Engine | Perplexity | Engine preselected on first use. Afterwards the search bar dropdown remembers your last selection. |
| Remember recent searches | On | Shows your recent searches when the search bar is empty. History is stored locally in Raycast's encrypted storage and never leaves your device. Turning the preference off hides history; *Clear History* deletes it. |

## Why does Perplexity open in the browser?

Perplexity has no free, unauthenticated API. Fetching answers inside Raycast would require scraping, which their Terms of Service forbid and Cloudflare blocks. This extension instead deep-links your query (`perplexity.ai/search?q=…`), so the answer starts generating the moment the page opens — no sign-in needed.

## Privacy

- No analytics, no tracking, no accounts.
- Search history stays on-device (Raycast encrypted LocalStorage).
- The only network calls are the suggestion endpoints for the text you type.
