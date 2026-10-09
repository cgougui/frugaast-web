Picture a small local model, working on some plain HTML and CSS, deciding to clear out the top-level folders of your documents directory. You're still reading its plan. By the time you reach the interrupt key, it's done. Nothing asked for permission, because nothing in the harness was designed to. The useful question stops being which harness is fastest and becomes what's the worst this process can do to you.

Most advice on this is a shopping list: install this guard, wrap it in that container, done. That skips the real question, which is what you're actually afraid of. "The model deleted my files", "a package read my SSH keys" and "my account got suspended" are three different problems with three different defenses. A thick wall around the wrong thing is just expensive. So for each layer below, I'll say what it stops and what it lets through.

## No prompts is a design choice

Some harnesses put a permission system in the way. Every shell command gets checked, sometimes by a second model call that reviews it before it runs. That costs time and tokens, and it causes approval fatigue: by the fortieth "allow?" prompt, people are holding down Enter.

A minimal harness goes the other way. It's "only the model": no wrapper, no review step, no prompt. That's why it feels faster and leaner, and the speed and the risk come from the same decision. You don't get one without the other.

That's not an argument against minimal harnesses. It just means being honest about who owns safety now. You do.

## How the damage happens

Four patterns keep showing up:

- **The hallucinated destructive command.** A small local model, working on plain HTML and CSS in a documents folder, decides to clear out directories. The reports cluster around small, local and free-tier models.
- **The panic rewind.** You tell the model "it's not working". It tries to roll back with version control. Sometimes there's no repository, or the rollback is `git reset --hard` over uncommitted work, or it wipes the directory to start clean. One person reported this happening twice, both times on a free-tier model.
- **Boring platform damage.** On Windows with a Unix-style shell, redirecting to `nul` can create a real file called `nul`. It's hard to delete, and some build tools won't run while it exists. An extension that rewrites bare `nul` redirects to `/dev/null` fixes it, though the upstream maintainers preferred a fix in the prompt. Annoying rather than catastrophic, but it shows damage comes in degrees.
- **Unprompted initiative.** Newcomers get told to keep backups and version control and to start in a sandbox or VM, because agents sometimes do things nobody asked for.

None of these needs an attacker. They're accidents by an honest, confused process with write access.

## Layer 1: command guards (the seatbelt)

The cheapest layer sits inside the harness. A rule file lists patterns, each with an action:

```toml
[[rule]]
pattern = "rm -rf"
action  = "block"

[[rule]]
pattern = ".env"
action  = "prompt"
```

Substring patterns for destructive operations, writes to sensitive files, and sensitive reads. The pitch is a middle ground between a tool that asks about everything and one that asks about nothing.

A second design swaps `rm` for a trash command inside the shell tool, moving deleted files into a project-local trash folder laid out like a desktop trash. That doesn't stop deletion; it makes deletion reversible.

The honest counterpoint came from someone who'd tried it. A shell alias does the same job, and the agent finds "creative workarounds": Python's `os.unlink()`, `sh -c rm`, even `git rm`. That person ended up with a bubblewrap jail and a read-only `.git`, with the extension only reacting to sandbox violations.

There are other options: permission systems that block commands outside the working directory, destructive-command guards paired with network-policy tools, general guardrail packages. They differ in details and share one property: a guard running in the same process as the agent can't be stronger than its pattern list.

Experienced engineers split on this. One camp says extensions that ask before dangerous actions are something they "wouldn't trust". Another uses them as one layer among several. Both are right once you're precise about the job. A command guard is a seatbelt, not a wall. It catches the obvious honest mistake. It won't stop a model that writes a script to do what the filter forbids.

## Layer 2: a filesystem jail on the host

If the pattern list is the weak point, move the boundary out of the process and into the operating system.

The most common answer is bubblewrap, wrapped in a one-word launcher. The setups look alike: a fake home directory, the whole filesystem read-only, and only two writable places, the project directory and the harness's own config folder. There are versions for Linux and for macOS (using the native sandbox profile format, with extra rules for the harness folder and read-only access to its source for people writing extensions), and some add an HTTP proxy to filter network traffic.

A minimal sketch (general background, not anyone's exact recipe):

```bash
bwrap \
  --ro-bind / / \
  --dev /dev --proc /proc \
  --tmpfs "$HOME" \
  --bind "$PWD" "$PWD" \
  --bind "$HOME/.pi" "$HOME/.pi" \
  --ro-bind "$PWD/.git" "$PWD/.git" \
  --unshare-pid \
  -- pi
```

Everything is mounted read-only. Your home directory becomes an empty temporary filesystem, so the agent can't see your keys, dotfiles or other projects. The project and the config folder are writable. `.git` is read-only, so the panic rewind fails. That one line alone defeats the second failure pattern above.

What this layer doesn't do is stop network traffic. One user of a wrapper like this said so plainly: it doesn't protect against exfiltration or unrestricted network access. If a package or a prompt injection can read the project directory, it can still send it somewhere. And the project directory often contains the `.env` file.

## Layer 3: containers, microVMs and separate machines

Stronger isolation exists, and people disagree about how much they need.

| Setup | Protects well against | Leaves open |
|---|---|---|
| Plain Docker container | Accidental deletion outside the mount | Open network, shared kernel |
| Rootless podman via a shell function | Same, with fewer privileges | Same network exposure |
| LXC or incus container, code moved via Git | Cleaner separation, snapshots | Setup effort |
| MicroVM (sub-second boot, own kernel) | Kernel-level isolation | More moving parts, tricky GPU access |
| A dedicated machine, one Git repo per project | Everything on your main machine | Cost, friction |

Some say VMs give kernel isolation and are "more secure than containers". Others are happy with a container. Both are rational. It depends which of three threats you face:

1. **Accidental deletion.** A container, or even a jail, is enough.
2. **Malicious code** in a dependency or extension. Prefer a microVM, since a shared kernel is a bigger target.
3. **Exfiltration.** None of the above helps unless you set an explicit network policy.

Most of the setups people reported leave the network open. That's usually a conscious, accepted risk (the stated goal is just to stop the agent deleting everything), but it means exfiltration is mostly unaddressed in practice.

A practical wrinkle for people running local models: if the agent lives in a microVM but the model needs the GPU, run inference on the host and let the sandboxed agent call it over a local port. You keep GPU speed and the agent stays boxed. Another setup builds a container image with an SSH server so an editor's remote-development feature can work inside the same environment. The harness's own containerization docs are a reasonable starting point.

## The model is part of the threat

Accidents aren't evenly distributed. The deletion reports come from small local models and free-tier models. People's advice in response was to switch to a larger or newer model and, importantly, to look at the prompt that led to the deletion.

A minimal prompt gives less implicit guidance, so behavior depends more on the model. Less scaffolding means less built-in safety. Cheap and local setups, popular precisely because they cut the bill, are the ones that should sandbox first. To be fair, nobody measured whether those models are actually riskier. It's a pattern in the reports, not data.

## The other attack surface: extensions, bridges and accounts

So far the threat has been the model. The second threat is what you install.

**Supply chain.** One engineer cloned a subagent package into their own monorepo "to be safe from supply chain attacks, or at least try to". Another wants "a better safer extension ecosystem" and doesn't think trusting thousands of bolted-together packages will end well. Others distrust a package with a huge download count after one week, since downloads aren't installs. And upstream namespace changes have broken extensions overnight, which is the reliability version of the same problem.

**Account risk.** Several people reported suspended accounts after using a provider's subscription through a third-party harness; one appealed successfully. Reports on using a chat subscription through bridges conflict: some used it for months, one says the default method stopped working, one says it violates the terms and risks suspension, another says a different provider tolerates it. It's all anecdote. Check the terms yourself before building a workflow on them.

There's a tension here. The pitch of a minimal harness is "just ask the agent to build the extension", yet the registry is full of packages. Writing your own reduces supply-chain risk but costs time and tokens. Read the source, pin versions, or vendor what you use.

## Subagents widen the blast radius

Orchestration multiplies the questions. If a subagent can write, where can it write? Reported designs include per-agent write domains with a scoped tool allowlist, isolated child sessions, worktree and sandbox options, and a process-level guard that refuses write and execute tools until a task list has been declared. A common problem is a subagent that keeps delegating because it doesn't know it's already a subagent.

These are mostly announcements, so there's little failure data. Nobody has posted measured escape attempts, or tested guard extensions against a matrix of workaround commands. That would be a worthwhile weekend project.

## In what order

The cheap layers come first, and the strong layers decide the outcome.

1. **Version control and backups.** Commit before every session. Everything else assumes this.
2. **A filesystem jail or microVM** with only the project directory and harness config writable, and `.git` read-only if you can.
3. **An explicit network policy.** Decide it. Don't inherit "open" by accident.
4. **A command guard** as a seatbelt, never as the wall.
5. **A trash shim,** so honest mistakes are recoverable.
6. **Pinned or vendored extensions** for anything you depend on.
7. **Separate accounts or keys** for anything in a terms-of-service gray area.
8. **Inference outside the sandbox,** if you run local models.

Mapping threats to layers:

| Threat | Layer that handles it |
|---|---|
| Accidental delete | Jail or container, read-only `.git`, trash shim |
| Hallucinated loop | Command guard, version control |
| Malicious package | Pinned or vendored code, microVM |
| Credential exfiltration | Fake home directory, network policy |
| Account suspension | Separate keys, read the terms |

## Or keep the model out of the shell

Every layer above exists because a loop is running commands on its own judgment. The sandbox is the price of autonomy.

There's another design: keep the model out of the shell entirely. You choose the exact files that go into the prompt. The model replies with search/replace blocks. Those get applied to the working tree as a plain Git diff that you read, accept or discard, then commit. Nothing runs unless you run it. With your own key, the only thing the model ever touches is the text you gave it.

That doesn't make sandboxes obsolete, since tests and builds still execute code. But it shrinks what the model can damage from "whatever the shell can reach" to "a diff you can read". Agents are a fine fit for throwaway prototypes in a disposable folder, where a mistake costs nothing. On a codebase with history and customers, I'd rather have a reviewable diff than a cleverer jail.

A guard that can be bypassed is still worth having, because most accidents are honest mistakes, and a seatbelt catches those cheaply. It just can't be the only layer. A microVM is often overkill for a hobby project: for accidental deletion, a jail plus a read-only `.git` covers most of the risk. And a stronger model makes fewer silly mistakes, but fewer isn't none. One deletion can cost you anything, while a sandbox costs an afternoon of setup.
