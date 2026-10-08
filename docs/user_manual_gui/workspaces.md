# Workspaces and title bar

## Title bar

Left to right:

- **Left sidebar toggle** (`Ctrl/Cmd+B`).
- **Workspace menu** (`Frugaast › <folder>`):
  - **Open local workspace**: native folder picker; disabled until the local
    assistant is connected.
  - **Connect to host…**: SSH setup, saved-host management, and remote folder
    picker. See [remote_ssh.md](remote_ssh.md).
  - **Recent Workspaces**: last 10 local/remote workspaces, newest first. Reconnect
    a disconnected host before reopening its repository from this list.
- **License badge**: `Pro` / `Unregistered`; click → License dialog.
- **Settings menu** (gear): API Keys, Models, Settings, Theme (System/Light/Dark), License, About. See [settings.md](settings.md).
- **Right sidebar toggle** (`Ctrl/Cmd+J`).
- Minimize / maximize / close. Close drains the local assistant, stops owned
  processes, and closes SSH connections.

## Workspaces

- A local workspace identifies a Git folder on your computer; an SSH workspace
  identifies a host profile and remote folder. Identical paths on different
  hosts are separate workspaces.
- Select a Git repository folder. Folders inside a Git repository are accepted;
  unrelated non-Git folders are rejected with an error.
- Per workspace: own assistant session, chat, operation, approvals, prompt
  context, mode, and chat/pasted-response drafts. File-view tabs reset on a
  workspace switch.
- One active operation per workspace; others keep running in background.
- Remote setup and feature behavior: [remote_ssh.md](remote_ssh.md).

## Workspace tab bar

- One tab per open workspace; tooltip = full path. Remote labels include
  `@ <host>`.
- Click switch; `×` close; drag reorder; `+` → workspace menu.
- Open tabs, order, active tab, recent workspaces, and SSH profiles are saved
  locally and restored on next launch; saved hosts attempt to reconnect.
- Prompt context and mode are not restored after restarting. Use Chat History
  to [continue a saved conversation](right_sidebar.md#chat-history) and add its
  files back into context.
- Closing a tab cancels its work and closes the assistant session; history and
  settings remain. Closing a remote tab leaves the host connection available
  for its other repositories.
- Closing active tab → first remaining tab activated.

## Free version limits

- Max **3 open workspaces** without license, counting local and SSH repositories
  together (`+`, menu, recent list, and remote picker enforce it).
- "Unregistered Version" nag dialog:
  - ~1% chance on chat send;
  - on tab switch if workspace has > 50 history sessions (10–15%, rising with count).
- Copied Web Chatbot context: "free version" watermark footer.
