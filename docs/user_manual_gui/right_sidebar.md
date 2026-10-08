# Right sidebar

Toggle: `Ctrl/Cmd+J`. Tabs: **Chat History**, **Git History**.

## Chat History

- History is read by the local assistant. Local repositories store it in
  `<workspace>/.frugaast/chat.jsonl`; SSH workspace history is stored under your
  computer's Frugaast config directory and remains readable without the host.
- Refresh: after each completed command, or refresh button.
- Sessions grouped by day (Today / Yesterday / date); only *Today* expanded. Day header: total cost.
- Session row: start time, message count, cost. Newest auto-expanded.
- **Continue in Assistant**: click the reply icon on a session row, or right-click
  the row and choose it. Restores the saved conversation and session cost, opens
  Assistant, and appends future messages to that stored session. Keeps your
  currently selected files, mode, and input draft; clears Undo eligibility.
  Wait for the current operation to finish before restoring.
- Right-click session → **Delete Session** (confirm, irreversible). Deletion is
  rejected during an active operation in that workspace.
- **File Context (N)**: files from the session's last recorded context snapshot.
  - Expand → tree/list toggle, `✓` *Add all to current context*, per-file `+`/`✓`.
  - Continuing a session does not automatically select these files; add them
    here before your next prompt if you need the previous context.
- Messages: role, model, response time, cost, timestamp, type.
  - Click → expand; click expanded user/assistant body → copy.

## Git History

Two parts: working-tree **Changes** (only if any) + **commit graph**.

Both panels operate on the selected repository, including the actual remote
repository for an SSH workspace. Remote Git reads require a host connection;
remote Git mutations also require the local assistant. Fetch, pull, push, and
branch switching are performed outside this GUI.

### Changes

- Header: change count, current branch.
- Groups: **Merge Changes** (conflicts), **Staged Changes**, **Changes** (unstaged + untracked).
- Status letters: M, A, D, R, C, T, U (untracked), ! (conflict).
- Row click → diff tab (conflicts → working file).
- Row actions: open file, stage `+` / unstage `−`, prompt-context toggle.
- Group actions: stage all / unstage all.
- **Commit**: message box (`Ctrl/Cmd+Enter`). Draft kept per workspace.
  - Nothing staged → offers stage all + commit.
  - Blocked while conflicts exist.
- All actions disabled during active sidecar operation.
- Commit uses the staged index. Local commits run repository hooks; SSH commits
  disable hooks and automatic signing so the helper can stay offline.

### Commit graph

- All branches, topological, colored lanes; HEAD, branch, remote, tag labels.
- 100 commits; *Load older commits* +100 (max 2,000).
- Click commit → changed files; click file → commit diff. File actions: open, context toggle.
- Right-click commit:
  - Copy commit ID / Copy commit message.
  - **Soft reset to that commit**: confirm; moves branch, changes stay staged, worktree untouched. Disabled on HEAD / during operation.
- Auto-refresh: every 30 s, on window focus, after each sidecar operation (edits, commits, undo).
- Refreshes when Git History becomes visible; the refresh button reloads changes
  and graph together. Hidden Git History panels stop automatic refreshes.
