# Quick Search

Query **Perplexity**, **Google**, **DuckDuckGo**, or **Bing** instantly from Raycast — with live autocomplete suggestions and recent searches. No account, sign-in, or API key required.

## Features

- **Quick Search** command: type a query and press `↵` to open it in your chosen engine in the default browser.
- **Engine switcher**: switch engines from the search bar dropdown. Your last choice is remembered.
- **Live suggestions** while you type, powered by keyless public suggestion endpoints. Suggestions degrade gracefully when offline — the plain search row always works.
- **Recent searches** appear when the search bar is empty. Remove a single entry with `⌃` `X` or clear everything with `⌃` `⇧` `X`.
- **Open With …**: run the same query against any other engine via `⌘` `1`–`⌘` `3` without changing the active engine.
- **Fallback command**: enable *Quick Search* as a fallback to search whatever you typed in root search — see below.

## Use as a Fallback Command

Add Quick Search to Raycast's fallback commands to search anything you type in root search in one step:

1. Open Raycast root search, press `⌘` `K`, and choose **Manage Fallback Commands** (or Raycast Settings → Advanced → Fallback Commands).
2. Enable **Quick Search**.

Now type any query in root search (e.g. "how tall is an average rabbit"), pick *Quick Search* from the fallback list, and the browser opens instantly with your last-used engine — no extra `↵`. Prefer to land in the extension UI with the query prefilled instead? Turn off *Search immediately when used as a fallback command* in the extension preferences.

Raycast doesn't let extensions enable fallback commands automatically — it's a one-time manual step.

## Preferences

| Preference | Default | Description |
| --- | --- | --- |
| Default Search Engine | Perplexity | Engine preselected on first use. Afterwards the search bar dropdown remembers your last selection. |
| Remember recent searches | On | Shows your recent searches when the search bar is empty. History is stored locally in Raycast's encrypted storage and never leaves your device. Turning the preference off hides history; *Clear History* deletes it. |
| Search immediately when used as a fallback command | On | Fallback launches open the browser instantly with the last-used engine. Turn off to prefill the query in the search bar instead. |

## Why does Perplexity open in the browser?

Perplexity has no free, unauthenticated API. Fetching answers inside Raycast would require scraping, which their Terms of Service forbid and Cloudflare blocks. This extension instead deep-links your query (`perplexity.ai/search?q=…`), so the answer starts generating the moment the page opens — no sign-in needed.

## Privacy

- No analytics, no tracking, no accounts.
- Search history stays on-device (Raycast encrypted LocalStorage).
- The only network calls are the suggestion endpoints for the text you type.
