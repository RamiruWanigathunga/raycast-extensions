import {
  Action,
  ActionPanel,
  Icon,
  Keyboard,
  LaunchProps,
  List,
  PopToRootType,
  closeMainWindow,
  getPreferenceValues,
  open,
  openExtensionPreferences,
} from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { ReactNode, useEffect, useState } from "react";
import { ENGINES, Engine, getEngine, parseSuggestions } from "./engines";
import { useSearchHistory } from "./history";

// The search text must update state on every keystroke so an instant ⏎ acts on
// the full query (List's `throttle` debounces onSearchTextChange and made fast
// submits search a truncated query). Only the suggestion fetch is debounced.
function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);
  return debounced;
}

export default function Command(props: LaunchProps<{ arguments: Arguments.Search }>) {
  const { defaultEngine, rememberHistory } = getPreferenceValues<Preferences.Search>();
  const [searchText, setSearchText] = useState(props.arguments.query || props.fallbackText || "");
  // The dropdown's storeValue restores the last-used engine and reports it via
  // onChange right after mount. Until then the active engine is unknown, so
  // nothing actionable is rendered — otherwise an instant ⏎ on a prefilled
  // query would search the preference engine while the dropdown shows another.
  const [engineId, setEngineId] = useState<string | null>(null);
  const engine = engineId === null ? null : getEngine(engineId);
  const query = searchText.trim();
  const debouncedQuery = useDebounce(query, 250);
  const history = useSearchHistory(rememberHistory);

  const { data: suggestions, isLoading: isLoadingSuggestions } = useFetch(
    (engine ?? ENGINES[0]).suggestUrl(debouncedQuery),
    {
      execute: engine !== null && debouncedQuery.length > 0,
      keepPreviousData: true,
      parseResponse: parseSuggestions,
      initialData: [],
      // Suggestions must degrade silently (e.g. offline) — without a handler,
      // useFetch shows a failure toast on every throttled keystroke.
      onError: () => {},
    },
  );

  return (
    <List
      isLoading={engine === null || history.isLoading || (query.length > 0 && isLoadingSuggestions)}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      filtering={false}
      searchBarPlaceholder={engine ? `Search ${engine.title}…` : "Search…"}
      searchBarAccessory={
        <List.Dropdown tooltip="Search Engine" storeValue defaultValue={defaultEngine} onChange={setEngineId}>
          {ENGINES.map((item) => (
            <List.Dropdown.Item key={item.id} title={item.title} value={item.id} icon={item.icon} />
          ))}
        </List.Dropdown>
      }
    >
      {engine === null ? null : query.length > 0 ? (
        <>
          <List.Section title="Search">
            <List.Item
              title={query}
              subtitle={`Search ${engine.title}`}
              icon={engine.icon}
              actions={<SearchActions query={query} engine={engine} onSearch={history.add} />}
            />
          </List.Section>
          <List.Section title="Suggestions">
            {suggestions
              .filter((suggestion) => suggestion.toLowerCase() !== query.toLowerCase())
              .map((suggestion) => (
                <List.Item
                  key={suggestion}
                  title={suggestion}
                  icon={Icon.MagnifyingGlass}
                  actions={
                    <SearchActions
                      query={suggestion}
                      engine={engine}
                      onSearch={history.add}
                      onRefine={() => setSearchText(`${suggestion} `)}
                    />
                  }
                />
              ))}
          </List.Section>
        </>
      ) : history.entries.length > 0 ? (
        <List.Section title="Recent Searches">
          {history.entries.map((entry) => (
            <List.Item
              key={entry}
              title={entry}
              icon={Icon.Clock}
              actions={
                <SearchActions
                  query={entry}
                  engine={engine}
                  onSearch={history.add}
                  onRefine={() => setSearchText(entry)}
                  historyActions={
                    <>
                      <Action
                        title="Remove Entry"
                        icon={Icon.Trash}
                        style={Action.Style.Destructive}
                        shortcut={Keyboard.Shortcut.Common.Remove}
                        onAction={() => history.remove(entry)}
                      />
                      <Action
                        title="Clear History"
                        icon={Icon.Trash}
                        style={Action.Style.Destructive}
                        shortcut={Keyboard.Shortcut.Common.RemoveAll}
                        onAction={history.clear}
                      />
                    </>
                  }
                />
              }
            />
          ))}
        </List.Section>
      ) : (
        <List.EmptyView
          icon={Icon.MagnifyingGlass}
          title={`Search ${engine.title}`}
          description={
            rememberHistory
              ? "Type a query to get started. Recent searches will show up here."
              : "Type a query to get started."
          }
        />
      )}
    </List>
  );
}

// Replaces Action.OpenInBrowser so the history write is awaited before the
// browser opens — OpenInBrowser's onOpen is fire-and-forget and Raycast can
// unload the command before the LocalStorage write completes.
function OpenSearchAction(props: {
  title: string;
  engine: Engine;
  query: string;
  onSearch: (query: string) => Promise<void>;
  shortcut?: Keyboard.Shortcut;
}) {
  const { title, engine, query, onSearch, shortcut } = props;
  return (
    <Action
      title={title}
      icon={engine.icon}
      shortcut={shortcut}
      onAction={async () => {
        await onSearch(query);
        await open(engine.searchUrl(query));
        await closeMainWindow({ popToRootType: PopToRootType.Default });
      }}
    />
  );
}

function SearchActions(props: {
  query: string;
  engine: Engine;
  onSearch: (query: string) => Promise<void>;
  onRefine?: () => void;
  historyActions?: ReactNode;
}) {
  const { query, engine, onSearch, onRefine, historyActions } = props;
  const otherEngines = ENGINES.filter((item) => item.id !== engine.id);

  return (
    <ActionPanel>
      <ActionPanel.Section>
        <OpenSearchAction title={`Search ${engine.title}`} engine={engine} query={query} onSearch={onSearch} />
        {onRefine && <Action title="Put in Search Bar" icon={Icon.Pencil} onAction={onRefine} />}
      </ActionPanel.Section>
      <ActionPanel.Section>
        {otherEngines.map((other) => (
          // The shortcut number is the engine's fixed position in ENGINES, so
          // ⌘1–⌘4 always mean the same engine regardless of which is active.
          <OpenSearchAction
            key={other.id}
            title={`Search ${other.title} Instead`}
            engine={other}
            query={query}
            onSearch={onSearch}
            shortcut={{ modifiers: ["cmd"], key: String(ENGINES.indexOf(other) + 1) as Keyboard.KeyEquivalent }}
          />
        ))}
      </ActionPanel.Section>
      <ActionPanel.Section>
        <Action.CopyToClipboard
          title="Copy URL"
          content={engine.searchUrl(query)}
          shortcut={Keyboard.Shortcut.Common.Copy}
        />
        <Action.CopyToClipboard title="Copy Query" content={query} shortcut={Keyboard.Shortcut.Common.CopyName} />
      </ActionPanel.Section>
      {historyActions && <ActionPanel.Section>{historyActions}</ActionPanel.Section>}
      <ActionPanel.Section>
        <Action
          title="Open Extension Preferences"
          icon={Icon.Gear}
          shortcut={{
            macOS: { modifiers: ["cmd", "shift"], key: "," },
            Windows: { modifiers: ["ctrl", "shift"], key: "," },
          }}
          onAction={openExtensionPreferences}
        />
      </ActionPanel.Section>
    </ActionPanel>
  );
}
