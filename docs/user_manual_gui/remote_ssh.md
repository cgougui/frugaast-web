# Remote workspaces over SSH

Open a Git repository on another machine and use the same Assistant, Prompt
Builder, file viewer, search, and Git panels as for a local workspace. Local and
remote workspace tabs can be open together.

Frugaast runs the assistant on your computer. It installs an offline repository
helper on the SSH host and reaches it through an OpenSSH tunnel. The helper reads
source files and performs file/Git changes in the actual remote repository.
Model calls use your desktop's configuration and connection to the provider;
the remote host needs no model credentials or internet access.

## Prerequisites

On your computer:

- The system OpenSSH client (`ssh`) must be on `PATH`.
- Authentication and host trust must already work without a prompt. Frugaast uses
  batch mode and has no password, key-passphrase, or host-trust dialog. Load an
  encrypted key into your SSH agent first.
- Configure user, port, identity file, and jump hosts in your SSH configuration.
  Frugaast uses that configuration when connecting.

For example, establish host trust in a terminal with `ssh my-build-host`, then
check that authentication works in batch mode:

```sh
ssh -o BatchMode=yes my-build-host true
```

On the remote host:

- x64 Linux with glibc 2.31 or newer. ARM64, macOS, Windows, and musl-based Linux
  are currently unsupported.
- Git, `tar`, `gzip`, `sha256sum`, and `getconf` on `PATH`.
- A writable home directory and SSH TCP forwarding allowed by the server.
- Permission to read the repository, and write permission for edits and commits.

The automatic installation includes its Python runtime; remote Python, pip, and
`sudo` are not required.

## Connect and open a workspace

1. Open the title-bar workspace menu (or the workspace-tab `+`) and choose
   **Connect to host…**.
2. Under **New connection**, choose an SSH alias. The list reads named `Host`
   entries from `~/.ssh/config`, including included configuration files. Choose
   **Other host…** or **Enter host manually** to enter an alias or `user@host`.
   Put custom SSH ports and options in the SSH config rather than in this field.
3. Click **Connect**. The **Hosts** list displays connection/setup progress.
   Frugaast checks the remote platform and installs or updates the matching
   bundled helper when needed. The first transfer may take a few minutes;
   matching installations are reused on later connections.
4. After connection, the remote folder picker opens at your home directory.
   Click folders to enter them, use the up arrow for the parent directory, or
   enter a remote directory and click **Go** (or press `Enter`). The refresh icon
   reloads the current directory.
5. Browse to your Git repository and click **Open this workspace**. A non-Git
   folder is rejected with an error in the picker. **Cancel** returns to the host
   dialog and leaves the host connected.

The workspace tab is labelled `<folder> @ <host>`; its tooltip shows the remote
path. Always select the intended workspace tab before sending a prompt or
applying a pasted response.

## Manage saved hosts

Reopen **Connect to host…** to see saved hosts and their state: **Connected**,
**Connecting**, **Disconnected**, or **Error**, with setup details when available.

- **Open**: browse for another repository on a connected host. Multiple
  repositories can share one connection.
- **Reconnect host** (circular arrow): reconnect a disconnected or failed host.
  After reconnecting, select an existing workspace tab or click **Open**.
- **Disconnect host** (plug icon): stop this host's connection. All its workspace
  tabs remain open, but new source reads and repository changes require a
  connection. In-progress operations for that host are cancelled.
- **Cancel connection**: the plug icon also cancels setup while connecting.

Saved profiles and workspace tabs persist across desktop restarts. Frugaast
attempts to connect saved hosts at startup and reconnect after a detected
connection loss. An explicit disconnect stops retries for the current desktop
session. Closing a workspace tab does not disconnect the host.

The free version's limit is three open workspaces in total, counting both local
and remote tabs. Connecting a host does not itself use a workspace slot. Only
one connection to the same remote machine/user can be active, even through
different SSH aliases; use the already connected profile.

## Features in a remote workspace

| Feature | Remote behavior |
| --- | --- |
| Explorer and Search | Browse/filter filenames and search contents on the host; open results and add them to prompt context |
| Files and diffs | View remote source and Git diffs; visible source files and working-tree diffs poll for changes every 2 seconds |
| Prompt Builder | Select/reorder files, mark references read-only, configure static references, repository map and workspace tree |
| Extend, autocomplete, Code Explore | Build symbol/map caches on the desktop from remote source; navigate back to remote files |
| Ask and Preview Prompt | Read remote context and build messages locally; model requests originate on your computer |
| Code and Web Chatbot → Apply Edits | Apply changes and create commits in the remote Git repository, with file-access approvals when needed |
| Git History and Changes | Inspect branches/commits/diffs, stage/unstage, commit, and soft reset in the remote repository |
| Undo | Undo an eligible assistant edit in the remote repository; eligibility depends on its current Git/file state |
| Chat History and Costs | Read history and usage stored on the desktop, including while the host is disconnected |
| Settings, Models, API Keys | Use local configuration; global changes affect open local and remote workspaces |

See [left_sidebar.md](left_sidebar.md), [assistant.md](assistant.md),
[views.md](views.md), and [right_sidebar.md](right_sidebar.md) for the controls.
The GUI has no terminal, Git fetch/pull/push, or arbitrary remote-command panel;
use your normal SSH terminal for those tasks.

## Static references and saved data

- **Settings → Workspace Overrides → Prompt Builder → Add files** uses the
  remote picker for an SSH workspace. Select files with the checkboxes and click
  **Add selected files**, then save settings. Paths are saved relative to the
  remote workspace; select references inside that repository.
- **Global Defaults → Add files** uses your computer's file picker. Absolute
  static reference paths refer to local files, even for an SSH workspace.
  Relative static references are read from the selected workspace's repository.
- Settings, API keys, models, chat history, costs, and repository-map caches stay
  on your computer. Remote workspace data is stored under the local Frugaast
  config directory's `remote-workspaces/` tree, identified by host and root.
- Installed helpers remain under `~/.frugaast/server/<build-id>/<target>/` on the
  host. Remote mutation/undo recovery records also remain in its home-directory
  state. Reading a repository does not create assistant settings/history there.
- Disconnecting or quitting stops a helper started by the desktop and closes its
  tunnel. Installed files and recovery records are retained for later use.

## Troubleshooting and interrupted work

| Symptom | What to check |
| --- | --- |
| Authentication or host-key failure | Make the batch-mode SSH command above succeed; load keys into your agent and trust the host in a terminal |
| Unsupported platform or missing tool | Check the remote prerequisites and the error shown in the host dialog |
| Tunnel/connection failure | Check SSH TCP forwarding and your SSH configuration; use **Reconnect host** after fixing it |
| Server already connected | Open repositories through the existing host profile; disconnect it before using another alias for the same machine/user |
| Helper build/role mismatch | Use a new automatic connection to install this desktop's matching repository helper |
| File changed since a prompt was built | Refresh/review the current remote file and retry with current context; edits check content revisions before writing |
| Unreadable, binary, oversized, missing, or symlink context file | Remove it from selected context or choose an accessible text file inside the repository; remote text reads are limited to 5 MiB per file |

Do not assume a failed connection means an edit was rolled back. Frugaast checks
stored operation receipts after reconnecting, before further work, without
blindly replaying a write or creating a duplicate commit. If the outcome cannot
be established, inspect the reported remote Git/worktree state before retrying.
Stopping a task may leave changes that already completed; review Git History.

Remote commits disable hooks and automatic signing so the helper can remain
offline. Undo checks cached tracking refs without fetching and cannot discover a
push absent from those refs.

Older saved profiles may use an existing helper on a fixed port. That helper
must implement the repository-helper protocol; older full assistant servers are
rejected. Existing-server mode closes only the tunnel on disconnect and leaves
the manually started helper running. New connections from the GUI use automatic
setup.

For custom/development bundle builds, see [../remote-hosts.md](../remote-hosts.md#building-bundles).
