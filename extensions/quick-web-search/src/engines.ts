import { Icon, Image } from "@raycast/api";
import { getFavicon } from "@raycast/utils";

export interface Engine {
  id: string;
  title: string;
  homepage: string;
  icon: Image.ImageLike;
  searchUrl: (query: string) => string;
  suggestUrl: (query: string) => string;
}

function defineEngine(def: Omit<Engine, "icon"> & { icon?: string }): Engine {
  return {
    ...def,
    icon: def.icon
      ? { source: def.icon, fallback: Icon.MagnifyingGlass }
      : getFavicon(def.homepage, { fallback: Icon.MagnifyingGlass, mask: Image.Mask.Circle }),
  };
}

function googleSuggestUrl(query: string): string {
  return `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
}

// Keep ids and titles in sync with package.json: the `defaultEngine`
// preference `data` entries and the engine names mentioned in the extension
// and command descriptions. The manifest is static JSON, so it cannot import
// this registry.
//
// Perplexity and ChatGPT have no public suggestion endpoint, so they reuse
// Google's generic suggestions. All endpoints below are keyless and unauthenticated.
export const ENGINES: Engine[] = [
  defineEngine({
    id: "perplexity",
    title: "Perplexity",
    homepage: "https://www.perplexity.ai",
    icon: "perplexity.png",
    searchUrl: (query) => `https://www.perplexity.ai/search?q=${encodeURIComponent(query)}`,
    suggestUrl: googleSuggestUrl,
  }),
  defineEngine({
    id: "google",
    title: "Google",
    homepage: "https://www.google.com",
    icon: "google.png",
    searchUrl: (query) => `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    suggestUrl: googleSuggestUrl,
  }),
  defineEngine({
    id: "duckduckgo",
    title: "DuckDuckGo",
    homepage: "https://duckduckgo.com",
    icon: "duckduckgo.png",
    searchUrl: (query) => `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
    suggestUrl: (query) => `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`,
  }),
  defineEngine({
    id: "bing",
    title: "Bing",
    homepage: "https://www.bing.com",
    icon: "bing.png",
    searchUrl: (query) => `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
    suggestUrl: googleSuggestUrl,
  }),
  defineEngine({
    id: "youtube",
    title: "YouTube",
    homepage: "https://www.youtube.com",
    icon: "youtube.png",
    searchUrl: (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
    suggestUrl: (query) =>
      `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`,
  }),
];

export function getEngine(id: string | undefined): Engine {
  return ENGINES.find((engine) => engine.id === id) ?? ENGINES[0];
}

// Google and DuckDuckGo (`type=list`) both return the OpenSearch suggestion
// shape `["query", ["suggestion", ...]]`, but Google responds with
// `text/html; charset=ISO-8859-1`, so the body is decoded from the declared
// charset (bare or quoted token) instead of assuming JSON/UTF-8. Any failure
// degrades to an empty list — the plain "search for what you typed" row must
// keep working offline.
export async function parseSuggestions(response: Response): Promise<string[]> {
  if (!response.ok) {
    return [];
  }
  try {
    const charset = /charset="?([\w-]+)/i.exec(response.headers.get("content-type") ?? "")?.[1] ?? "utf-8";
    const buffer = await response.arrayBuffer();
    let text: string;
    try {
      text = new TextDecoder(charset).decode(buffer);
    } catch {
      text = new TextDecoder().decode(buffer);
    }
    const parsed: unknown = JSON.parse(text);
    if (Array.isArray(parsed) && Array.isArray(parsed[1])) {
      const suggestions = parsed[1].filter((item): item is string => typeof item === "string" && item.length > 0);
      return [...new Set(suggestions)];
    }
    return [];
  } catch {
    return [];
  }
}
