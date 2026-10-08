# Frugaast desktop GUI: user manual

Frugaast is a desktop coding assistant for local Git repositories and remote
repositories over SSH. The same interface lets you assemble context, ask
questions, apply and commit edits, browse files and Git history, and track model
usage. The assistant runs on your computer for both workspace types.

## Pages

| Page | Covers |
| --- | --- |
| [workspaces.md](workspaces.md) | Local and remote workspaces, title bar, tabs, persistence, free-version limits |
| [remote_ssh.md](remote_ssh.md) | SSH setup, remote folder picker, host management, supported features, storage, recovery |
| [left_sidebar.md](left_sidebar.md) | Explorer, Search, Extend, Prompt Builder, token/cost stats |
| [assistant.md](assistant.md) | Assistant view: chat, modes, models, approvals, undo, prompt preview |
| [views.md](views.md) | Web Chatbot and pasted edits, cost/performance analytics, Code Explore, file/diff viewer |
| [right_sidebar.md](right_sidebar.md) | Chat History and continuing sessions, Git changes/commit, Git history graph |
| [settings.md](settings.md) | Settings, Models, API Keys, theme, License, About |

## Layout

```
┌ Title bar: sidebar toggles · workspace menu · license badge · settings · window controls
├ Workspace tabs (one per open repo)
├──────────────┬──────────────────────────────┬──────────────┐
│ Left sidebar │ View tabs: Assistant | Web   │ Right        │
│  Explorer /  │ Chatbot | Costs | Code       │ sidebar:     │
│  Search /    │ Explore | Files              │ Chat History │
│  Extend      │                              │ Git History  │
│ ──────────── │                              │              │
│ Prompt       │                              │              │
│ Builder      │                              │              │
└──────────────┴──────────────────────────────┴──────────────┘
```

- Default widths 25% / 50% / 25%.
- Side panels: drag inner edge (200 px – 40% of window).
- Left sidebar: drag horizontal handle to split browser / Prompt Builder (10–90%).

## Core workflow

1. Configure provider keys in **API Keys** and the available models in **Models**
   (title-bar gear menu). See [settings.md](settings.md).
2. Open the workspace menu → **Open local workspace**, or **Connect to host…**
   for a [remote SSH workspace](remote_ssh.md#connect-and-open-a-workspace).
3. Add files to prompt context (left sidebar `+`). Use the lock icon for read-only
   references, and optional sources for static files, a repository map, or a tree.
4. Pick **Ask** or **Code**, select a model, type a request, and press `Enter`.
   **Preview Prompt** shows the assembled messages without calling the model.
5. Approve extra file-access requests as needed. Code edits are applied and
   committed in the selected repository; review them in **Git History**, and
   use **Undo** when available.

For an external web chatbot, use **Web Chatbot** to copy context and apply its
SEARCH/REPLACE response. To resume a stored conversation, use **Chat History** →
**Continue in Assistant**.

## Keyboard shortcuts

| Keys | Action |
| --- | --- |
| `Ctrl/Cmd+B` | Toggle left sidebar |
| `Ctrl/Cmd+J` | Toggle right sidebar |
| `Ctrl+Alt+A` | Focus "Find files by name" |
| `Enter` / `Shift+Enter` | Send / newline in chat input |
| `` ` `` | Symbol autocomplete in chat input |
| `Ctrl/Cmd+Z` | Undo chat-input edits (custom history) |
| `Ctrl/Cmd+W` | Close active file tab |
| Middle-click file tab | Close it |
| `Ctrl/Cmd+Enter` | Commit (in commit message box) |
| `Esc` | Close supported dialogs/menus, deny file approval, clear file filter |

## State model

| State | Scope | Persisted |
| --- | --- | --- |
| Open workspace tabs, order, active tab, recent workspaces (10), SSH host profiles | App | Desktop `localStorage` (`frugaast.desktopState.v1`); older sidecar state migrated once |
| Prompt context files, Ask/Code mode, chat draft | Per workspace | No (memory only) |
| Chat transcript in Assistant view | Per workspace | Memory; stored conversations can be continued from Chat History |
| Assistant history, usage, workspace settings | Per workspace | Local repo: `.frugaast/`; SSH repo: local Frugaast config directory, under `remote-workspaces/` |
| Global settings, models, API keys | App | Local Frugaast config files |
| Theme | App | `localStorage` (`frugaast.theme`) |
| Git commit message draft | Per workspace | No (survives tab switches) |
| License key | User | `<config dir>/frugaast/license.key` |

- Closing a workspace tab drops its prompt context, pasted-response draft, and
  assistant session; saved history and settings remain. The assistant draft
  currently remains in memory if the workspace is reopened in the same window.
- File-view tabs reset when switching workspaces; workspace tabs remain open.
- Closing a remote workspace tab leaves its host connected. Use the host dialog
  to disconnect it. Saved hosts reconnect when the desktop starts.
- File listing/search honours `.gitignore` + `.frugaastignore`; `.git/` + `.frugaast/` always hidden.
