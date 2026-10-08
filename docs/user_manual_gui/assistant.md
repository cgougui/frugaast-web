# Assistant view

Main chat with the model, scoped to active workspace.

## Input bar

- **Ask**: questions only, no edits.
- **Code**: SEARCH/REPLACE edits, applied + committed.
  In an [SSH workspace](remote_ssh.md), these edits and commits change the remote
  repository; model calls still run from your computer.
- **N files in context**: click → focus Explorer filter.
- **Preview Prompt**: see below.
- **Model selector** (`main / weak`): tabs *Main Model* / *Weak Model*; loads immediately; list from Models config.

Text area:
- `Enter` send, `Shift+Enter` newline.
- Light highlighting: `` `code` ``, fenced blocks, `#` headings.
- Word ≥ 3 chars → suggests workspace symbols (repo map cache) + files by name.
  - Word with `/` (e.g. `src/comp`) → file paths.
  - `↑/↓` choose; `Tab` inserts `` `symbol` `` / `` `relative/path` `` (first if none chosen); `Enter` inserts chosen, else sends; `Esc` hides for that word.
- `` ` `` + prefix → longer list, incl. symbols from selected files. `↑/↓`, `Tab`/`Enter` insert, `Esc` closes.
- `Ctrl/Cmd+Z`: back through input history.
- Disabled: disconnected, approval pending, repo map generating.
- Draft kept per workspace.

Footer:
- **Status**: progress / last result. Click → copy; `×` hides until next run.
- **Send** / **Stop** (cancels operation + queued work).

## Conversation

- Replies rendered as Markdown (GFM).
- After each reply: cost row (*Message Cost*, *Session Total*).
- Auto-scroll while streaming; scroll up pauses, shows ↓ button.
- **Clear Chat**: clears on-screen transcript only (no session reset, history log untouched).
- **Undo**: shown when last agent edit has a commit; reverts it, marks chat.
  Available for Code mode and pasted edits when the repository state allows it.
- To start a fresh conversation, use Prompt Builder → **Reset**. To resume a
  stored conversation, use **Chat History → Continue in Assistant** in the
  [right sidebar](right_sidebar.md#chat-history).

## File access approval

- Model may request extra files during a task.
- Modal lists files: **Allow Access** / **Deny** (`Esc`/backdrop = deny).
- Decision appended to chat.
- Approved files are added to the requesting workspace's prompt context, even
  if you have switched to a different workspace tab.

## Prompt preview

From *Preview Prompt* or Prompt Builder › *Preview*.

- Slide-in drawer: exact messages (system / user / assistant) for current draft, mode, context.
- Each message collapsible; *Fold all*; *Copy* (raw JSON).
- Close: `×` or backdrop.
- Includes enabled static references, repository map, workspace tree, and
  conversation history. Previewing does not call a model or apply edits.

## Operation rules

- The GUI tracks one operation per workspace (chat, repo map, tree, stats,
  preview, apply diff, undo, or SSH Git/history mutations); extra work is rejected
  or queued. Other workspace tabs can keep running their own work.
- Chat, apply-diff, and correlated Git/history mutations have no request timeout;
  chat and pasted edits may wait for approval. Most other requests time out after
  60 seconds, with background work cancelled before its operation slot is freed.
- A completed assistant reply can be followed by approvals, more replies, or
  file changes. Wait for the operation to finish before starting another edit.
- **Stop** cancels the current task and queued work; changes already applied may
  remain, so review Git History. For lost SSH connections, see
  [remote recovery](remote_ssh.md#troubleshooting-and-interrupted-work).
- Context/mode changes don't hit sidecar until next request; snapshot sent with each command.
- GUI slash-prefixed input is sent as literal prompt text; Textual's slash
  commands are not GUI controls.
