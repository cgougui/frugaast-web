# Settings, models, keys, license

- All from title-bar gear menu.
- Modals close with `Esc` or backdrop, except while a save or file selection
  prevents closing. Models and API Keys have explicit save controls.
- All configuration is managed on your computer, including for SSH workspaces.

## Settings

Form generated from sidecar config schema (`sidecar/src/core/config.py`).

- Scope switch:
  - **Global Defaults**: all workspaces.
  - **Workspace Overrides**: active workspace only (disabled without workspace).
- Effective value: defaults → global → workspace override. Fields absent from
  workspace settings inherit the global/default value.
- Only edited fields saved (sparse patch). Switching scope discards pending edits.
- Blank text/dropdown edits are skipped on save; they do not remove an existing
  override. To remove an override, remove its field from the workspace settings
  file and restart Frugaast to reload it. An empty static-file list is saved and
  disables inherited references.
- Global save refreshes all open local and SSH workspaces. **Save Global** or
  **Save Overrides** persists edits for the selected scope; **Cancel** discards
  them.

| Section | Field | Notes |
| --- | --- | --- |
| AI | Primary AI Model | Main model ID. Dropdown has no options yet; use chat model selector |
| AI | Fast/Weak Model | Cheap model for minor tasks (e.g. commit messages) |
| AI | System Prompt | Prepended to every conversation |
| AI | Debug LLM Traffic | Logs raw requests/responses under the workspace's assistant storage, in `.frugaast/llm_history/`; SSH logs stay on your computer |
| Editor | Font Size | File viewer font size (6–36) |
| Editor | Ignored Dirs | Directory-name list; the GUI currently has no dedicated list editor, so edit the settings JSON for list changes |
| Prompt Builder | Static Reference Files | One path per line; workspace list replaces global, empty list disables it; see picker behavior below |
| Prompt Builder | Include Repository Map | Default on |
| Prompt Builder | Repository Map Token Budget | 512–32,768, default 4096 |
| Prompt Builder | Include Workspace Tree | Default off |

- Prompt Builder gear (left sidebar) → this dialog on *Prompt Builder*, *Workspace Overrides* selected.

Static-reference **Add files** opens your computer's picker for local workspaces
and Global Defaults. In an SSH workspace's Workspace Overrides it opens the
remote picker: check files inside the remote repository and click **Add selected
files**. Selected workspace files are stored as relative paths. Global references
outside the workspace use absolute local paths; relative global paths resolve
against each selected repository. Missing static files are skipped, and files
explicitly selected in prompt context take precedence.

Global files are in the local Frugaast config directory (`settings.json`,
`models.json`, `api_keys.json`). Local workspace overrides are in
`<workspace>/.frugaast/settings.json`; SSH overrides are in local
`remote-workspaces/` storage. See [remote_ssh.md](remote_ssh.md#static-references-and-saved-data).

## Models

Models offered in chat model selector.

- Left list: drag to reorder; `⋮` / right-click → Duplicate / Delete; *Add Model*.
- Fields: display name, model ID (LiteLLM format, e.g. `gemini/gemini-2.5-flash-lite`), API base, API key, context window (default 128000).
- Known gap: API key dropdown empty (schema has no `enum` / `ui_options`) → can't set from GUI.
- *Reload*: discard unsaved edits, re-read disk. *Save Configuration*: persist.
- Model definitions are global; saving refreshes open local and SSH workspaces.
  Use Assistant's Main/Weak selector to choose a configured model. An API base
  can point to a compatible model server running on your computer.

## API Keys

- Name/value pairs (e.g. `OPENAI_API_KEY`). Values masked; eye icon reveals.
- Empty-name rows dropped on save.
- Stored in global Frugaast config dir: never commit.
- Add the provider's expected variable name (for example `OPENAI_API_KEY`) and
  value, then click **Save Keys**. These keys serve local and SSH conversations
  and are not installed on the SSH host.

## Theme

- System / Light / Dark segmented control in gear menu (arrow keys work).
- *System* follows OS live. Stored locally per machine.

## License

- Paste license key (JWT). Auto-saved once decoded; verified in Rust against public key.
- Valid key: email, updates-until date, *Change*, *Remove*.
- Stored at `<config dir>/frugaast/license.key`:
  - Linux `~/.config`;
  - macOS `~/Library/Application Support`;
  - Windows `%APPDATA%`.
- *Get a License* → frugaast.dev/pricing. Free limits: [workspaces.md](workspaces.md#free-version-limits).

## About

- App version, license status.
- *Check for Updates*: compares with latest GitHub release; download link if newer.
