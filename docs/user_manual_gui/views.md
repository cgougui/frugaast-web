# Other main views

- Switch via tab strip above main area.
- **Files** shown only with ≥ 1 open file tab.

## Web Chatbot

Use an external chatbot (ChatGPT, Claude.ai, …), then apply its edits to the
selected local or [SSH repository](remote_ssh.md).

1. **Copy workspace context**: preview pane, three sources:
   - *Files*: static + context files. Options: file name format (relative path / name only / none), delimiter (```` ``` ````, `---`, `===`, none).
   - *Tree View*: workspace folder tree.
   - *Repo Map*: optional *Focus Prompt* biases ranking. Budget/inclusion set in left sidebar.
   - *Copy context*: copies shown text (watermarked in free version).
2. **Ask for changes**: *Copy SEARCH/REPLACE prompt* → format instructions to paste with request.
3. **Paste the response & apply edits**: paste reply → **Apply Edits**.
   - Same edit + Git commit pipeline as Code mode (may ask approval).
   - Draft kept per workspace; disabled during another operation.
   - Paste SEARCH/REPLACE blocks rather than a unified Git patch. The copied
     instructions explain exact matching, new files, and code deletion; expand
     *View SEARCH/REPLACE prompt* to read or copy them manually.
   - The response remains in the text area after applying. Review the result in
     Git History; Assistant's **Undo** is available for eligible edit commits.

Previews refresh while the Web Chatbot view is visible. Changing the repository
map's **Focus Prompt** adjusts ranking; map inclusion and token budget come from
the Prompt Builder's optional sources. Copying context does not call a model;
applying edits may use the configured weak model for a commit message.

## Costs

Per-workspace usage from the local assistant's stored history. SSH history and
costs remain on your computer and can be read while the host is disconnected.

- Time range: **24h**, **7d**, **30d** (default), **90d**, or **All**.
- Summary cards: spent, sessions, average per session/response, projected
  **30-day pace**, and share of free responses. Limited ranges compare spend and
  session count with the preceding period when data is available.
- **Spending over time**: stacked by model, with hourly/daily/weekly/monthly
  buckets appropriate to the range. Hover or keyboard-focus a column for its
  total, model breakdown, and response count.
- **Cost by model**: amount/share, cost per session/response, and session/response
  counts. Zero-priced responses are included and marked **FREE**.
- **Most expensive sessions**: dates, models, response counts, and costs.
- **Response time**: median response duration, average first-token delay, output
  speed, and average input/output tokens per model. Older responses may lack
  these measurements and show **Not recorded** or `—`.
- **Model prices**: configured/used models' published LiteLLM input, output, and
  cached-input prices per million tokens, plus context capacity. **Your avg
  response** estimates cost using this period's average recorded token counts;
  unavailable prices are marked. This comparison is an estimate, not a quote
  from your provider.
- Usage reloads when the view becomes visible or the workspace changes. Use
  **Reload history** (refresh icon) to update it while staying in this view.

## Code Explore

Table of cached repo-map symbols.

- Stats: files, definitions, references.
- Filter: text (symbol or path), kind (all / definitions / references).
- Sort any column; 100 rows/page.
- Click source location → file opens at line.
- "No symbol cache yet" → build repo map (left sidebar refresh), then *Refresh*.
- Search, sorting, and pagination use the loaded snapshot without model calls.
  **Refresh** rereads the cache; it does not rebuild it. Map rebuilds invalidate
  the snapshot so it reloads when visible.

## Files

Read-only, syntax-highlighted viewer (Shiki).

- File tabs reset on workspace switch.
- Tab `+`/`−`: prompt context toggle. Right-click: Close Tab / Close All Tabs. `Ctrl/Cmd+W` or middle-click closes.
- Live reload on local disk change (directory watch) + window focus. Visible
  remote files poll every 2 seconds and refresh on focus.
- Zoom changes `editor.file_view_font_size` in **global** settings (min 8).
- From search results: scrolls to + highlights matches.
- **Diff tabs** (from Git panels), label `name (hash|staged|unstaged)`:
  - added/removed lines highlighted, hunks separated by `⋯`;
  - overview ruler on scrollbar;
  - staged/unstaged reload on focus (remote diffs also poll every 2 seconds);
    commit diffs static;
  - binary / rename-only → notice.
