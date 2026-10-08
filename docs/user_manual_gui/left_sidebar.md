# Left sidebar

Two stacked sections: **Workspace browser** (top), **Prompt Builder** (bottom).

## Workspace browser

- Tabs: **Explorer**, **Search**, **Extend**, **Sessions**.
- Arrow keys / Home / End switch tabs. Labels → icons below ~300 px.
- Sessions tab: empty placeholder for now.
  Saved conversations are in the [right sidebar](right_sidebar.md#chat-history).

Shared conventions:

- Click file name → open in Files view.
- `+` → add to prompt context; `✓` → in context, click to remove.
- Folder `+` → add every (matching) file under it.
- Toolbar: item count, refresh, expand/collapse all, tree/list toggle (shared across tabs).
- Right-click file/folder: copy filename, relative path, absolute path; folders also *Copy Tree* (ASCII).
- In an [SSH workspace](remote_ssh.md), browsing and searches use the remote
  repository; copied absolute paths refer to the host.

### Explorer

- Fuzzy find by name (`Ctrl+Alt+A` focuses; 200 ms debounce).
- Options: match case, whole word, regex, **only folders**.
- Extension filter, comma-separated (`ts, tsx`); hidden with "only folders".
- While filtering: `↑/↓` select, `Enter` adds file, `Esc` clears.
- Search auto-expands folders; clicking folder result → tree view at that folder.
- Auto-refresh every 5 s. Refresh button also rebuilds repo map/symbols.

### Search (file contents)

- Full-text search across workspace (local or SSH repository, 250 ms debounce).
- Options: match case, whole word, regex. Invalid regex → error.
- Results grouped by file + match count; click line → file opens scrolled there, matches highlighted.
- Limits: 1000 matching lines ("Result limit reached"); files > 5 MiB, binaries,
  and unreadable files skipped (count shown). Symlinks are not followed.

### Extend (symbol-driven context)

- Pick symbols from repo map (autocomplete, first 100 matches). `Backspace` on empty input removes last chip.
- **Extend context** → repo map ranked by selected files + symbols.
- Results: ranked files + symbol outlines, tree or list (list = rank order). Add files with `+`.
- *Full repository map* expander: raw map text.
- Changing symbols invalidates preview → click Extend again.
- Requires at least one selected symbol, but no selected context files. Building
  suggestions does not add files until you click `+`, and makes no model call.
- Opening Extend rebuilds the map/symbol cache; the refresh control can rebuild
  it again after outside changes. Assistant edits and Undo also refresh symbols.

## Prompt Builder

Header: file count, expand (or double-click header), **optional sources** toggle (layers icon), settings, clear all, tree/list toggle.

### Context files

- Read-only files listed first.
- Lock icon: **read-only** (read, no edit) ↔ **editable**.
- Drag handle reorders (list view).
- Click file → opens it + reveals in Explorer.
- `×` removes; folder `×` (tree view) removes all under it.

### Optional sources (layers icon)

Saved as **workspace overrides**:

- **Static files**: persistent read-only refs (e.g. `AGENTS.md`). Set in Settings › Prompt Builder. Missing files skipped; selected context files win.
- **Repository map**: on/off + token budget 512–32,768 (step 512).
- **Workspace tree**: on/off; dir/file names, ignore rules respected.

Expand a source heading to see its references or controls. Repository-map size
can be set with the number input or slider; changes save automatically and
affect Assistant prompts, prompt previews, and the Web Chatbot map. Static
references are configured in Settings and survive session resets; a workspace
static-file list replaces the global list. See [settings.md](settings.md#settings)
for local versus remote file pickers.

### Actions and stats

- **Reset**: starts a fresh assistant session; clears selected context, chat,
  draft, and file filter. Keeps mode, settings, static references, and stored
  history. Disabled while an operation is running.
- **Preview**: assembled prompt (see [assistant.md](assistant.md#prompt-preview)).
- Stats card:
  - **Tokens** / **Context**: estimated prompt size + cost for current context + draft. `—` when stale; refreshed on file set change.
  - **Session**: cumulative cost of this sidecar session.
