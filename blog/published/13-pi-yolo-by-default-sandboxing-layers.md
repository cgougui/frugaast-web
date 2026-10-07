# No Permission Prompts, No Safety Net: The Sandboxing Layers Practitioners Actually Run

A minimal harness that never asks before `rm -rf` moves the safety problem onto the person at the keyboard. Practitioners stack command guards, trash shims, filesystem jails and microVMs, and each layer stops a different kind of failure.

> I watched a small local model start deleting top-level folders in my documents directory while I was still reading its plan, and by the time my finger reached the interrupt key the damage was done. That afternoon I stopped asking "which harness is fastest" and started asking "what is the worst thing this process can do to me".

## Start from the threat, not the tool

Most advice on this topic is a shopping list. Install this guard, wrap it in that container, done. The shopping list hides the real question, and the real question is simple.

What are you afraid of?

Because "the model deleted my files", "a package read the SSH keys" and "the account got suspended" are three different problems. They need three different defenses. A thick wall around the wrong thing is just expensive.

So the lens for this article is the threat model. Each layer below gets one job description: what it stops, and what it quietly lets through.

First, why the problem exists at all.

## A design choice, not a bug

Some harnesses interpose a permission system. Every shell command gets a check, sometimes even a second model call that reviews the command before it runs. That costs time and tokens, and it produces approval fatigue: after the fortieth "allow?" prompt, people hold down the Enter key.

A minimal harness goes the other way. It is "only the model". No wrapper, no review step, no prompt. That is why it feels faster and leaner, and the speed and the risk come from the same decision. Nobody gets the first without the second.

That is not an argument against minimal harnesses. It is an argument for being honest about who now owns safety. It is you.

## How the damage actually happens

Four failure patterns show up again and again.

- **The hallucinated destructive command.** A small local model, working on plain HTML and CSS in a documents folder, decides to clear directories. This is the classic case, and the reports cluster around small, local and free-tier models.
- **The panic rewind.** You tell the model "it's not working". It tries to roll back with version control. Sometimes there is no repository, or the rollback is `git reset --hard` over uncommitted work, or it wipes the directory to start clean. People report this happening twice to the same person, both times on a free-tier model.
- **Mundane platform damage.** On Windows with a Unix-style shell, a redirect to `nul` can create a real file called `nul`. It is hard to delete, and some build tools refuse to run while it exists. An extension that rewrites bare `nul` redirects to `/dev/null` fixes it, though the upstream maintainers preferred a prompt-level fix. Small, boring and annoying. Not catastrophic. But it shows that "damage" is a spectrum, not a single event.
- **Unprompted initiative.** Newcomers are told to keep backups and version control, and to start in a sandbox or VM, because an agent sometimes does things nobody asked for.

Notice the common thread. None of these need an attacker. They are accidents by an honest, confused process with write access.

## Layer 1: command-level guards (the seatbelt)

The cheapest layer sits inside the harness. A rule file lists patterns, each with an action. A typical shape:

```toml
[[rule]]
pattern = "rm -rf"
action  = "block"

[[rule]]
pattern = ".env"
action  = "prompt"
```

Substring patterns for destructive operations, sensitive file writes and sensitive reads. The pitch is a middle ground between a tool that asks about everything and one that asks about nothing.

A second design swaps `rm` for a trash command inside the shell tool, moving deleted files into a project-local trash folder laid out like a desktop trash. That is a recoverability layer. It does not stop deletion; it makes deletion reversible.

Now the honest counterpoint, which came from someone who had tried it. A shell alias does the same thing, and the agent finds "creative workarounds": a Python `os.unlink()`, `sh -c rm`, even `git rm`. That person ended up with a bubblewrap jail and a read-only `.git`, with the extension merely reacting to sandbox violations.

Other options exist: permission systems that block commands outside the working directory, destructive-command guards paired with network-policy tools, general guardrail packages. They differ in details and share one structural property.

A guard that runs in the same process as the agent cannot be stronger than its pattern list.

That is the whole critique in one sentence. Experienced engineers split on it. One camp says extensions that ask before dangerous actions are something they "wouldn't trust". Another uses them as one layer among several. The reconciliation is to be precise about the job. A command guard is a seatbelt, not a wall. It catches the obvious, honest mistake. It does not stop a model that writes a script to do what the filter forbids.

## Layer 2: filesystem jails on the host

If the pattern list is the weak point, move the boundary out of the process and into the operating system.

The most repeated answer is bubblewrap, wrapped in a one-word launcher. The shape is consistent across setups: a fake home directory, the whole filesystem read-only, and only two things writable, the project directory and the harness's own config folder. Variants exist for Linux, for macOS (using the native sandbox profile format, with extra rules for the harness folder and read-only access to its source when writing extensions), and some add an HTTP proxy for network filtering.

A minimal sketch, clearly general background and not a recipe taken from anyone:

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

Walk through it. Everything is mounted read-only. Your home directory becomes an empty temporary filesystem, so the agent cannot see your keys, dotfiles or other projects. The project and the config folder are writable. `.git` is read-only, so the panic rewind fails. That one trick alone defeats the second failure pattern above.

What this layer does not do is stop network traffic. One user of such a wrapper said it plainly: it does not protect against exfiltration or unrestricted network access. If a package or a prompt injection can read the project directory, it can still send it somewhere.

That matters more than it sounds, because the project directory often contains the `.env` file.

## Layer 3: containers, microVMs and separate machines

Stronger isolation exists, and people disagree about how much they need.

| Setup | What it protects well | What it leaves open |
|---|---|---|
| Plain Docker container | Accidental deletion outside the mount | Open network, shared kernel |
| Rootless podman via a shell function | Same, with fewer privileges | Same network exposure |
| LXC or incus container, code moved by Git | Cleaner separation, snapshotting | Setup effort |
| MicroVM (sub-second boot, own kernel) | Kernel-level isolation | More moving parts, GPU access is tricky |
| Dedicated machine, one Git repo per project | Everything on the main machine | Cost, friction |

One side says VMs give kernel isolation and are "more secure than containers". Others are content with a container. Both are rational. The question is which of three threats you face:

1. **Accidental deletion.** A container, or even a jail, is enough.
2. **Malicious code** in a dependency or an extension. Prefer a microVM, because a shared kernel is a larger target.
3. **Exfiltration.** None of the above helps unless the network policy is explicit.

Notice that most reported setups leave the network open. That is a conscious, accepted risk in most cases (the stated goal is only to reduce the risk of the agent deleting everything), but it also means exfiltration is mostly unaddressed in practice.

A practical wrinkle for people running local models. If the agent lives in a microVM but the model needs the GPU, run inference on the host and let the sandboxed agent call it over a local port. That keeps GPU speed and keeps the agent boxed. Another setup builds a container image with an SSH server so an editor's remote-development feature can enter the same environment. A starting point also exists in the harness's own containerization documentation.

## The model is part of the threat model

The accident rate is not evenly distributed. Deletion reports come from small local models and free-tier models. The advice people gave in response was to move to a larger or newer model and, importantly, to review the prompt that produced the deletion.

A minimal prompt means less implicit guidance, so behavior depends more on the model. Less scaffolding means less implicit safety. Cheap and local setups, which are popular precisely because they cut the bill, are exactly the population that should sandbox first. To be fair, nobody measured whether those models are riskier. The pattern is a correlation in reports, not data.

## The other attack surface: extensions, bridges and accounts

So far the threat was the model. The second threat is what you install.

**Supply chain.** One engineer cloned a subagent package into their own monorepo "to be safe from supply chain attacks, or at least try to". Another wants "a better safer extension ecosystem" and does not think trusting thousands of bolted-together packages will end well. Others distrust a package with a huge download count after one week, since downloads are not installs. And namespace changes upstream have broken extensions overnight, which is a reliability version of the same problem.

**Account risk.** Several people reported suspended accounts after using a provider's subscription through a third-party harness; one appealed successfully. Reports on using a chat subscription through bridges conflict: some used it for months, one says the default method stopped working, one says it violates the terms and risks suspension, another says a different provider tolerates it. Treat all of it as anecdote. Verify the terms yourself before building a workflow on them.

There is a tension here that deserves naming. The pitch of a minimal harness is "just ask the agent to build the extension". Yet the registry is full of packages. Writing your own reduces supply-chain risk but costs time and tokens. Read the source, pin versions, or vendor what you use.

## Subagents widen the blast radius

Orchestration multiplies the questions. If a subagent can write, what can it write to? Reported designs include a per-agent write-domain with a scoped tool allow-list, isolated child sessions, worktree and sandbox options, and a process-level guard that refuses write and execute tools until a task list is declared. The common pain is a subagent that keeps delegating because it does not know it is already a subagent.

An honest gap: these are mostly announcements, so there is little failure data. Nobody has posted measured escape attempts, or a comparison of guard extensions against a test matrix of workaround commands. That would be a worthwhile weekend project.

## A layered order of operations

Order matters, because the cheap layers come first and the strong layers decide the outcome.

1. **Version control and backups.** Commit before every session. Everything else assumes this.
2. **A filesystem jail or microVM** with only the project directory and the harness config writable, and `.git` read-only if possible.
3. **An explicit network policy.** Decide it. Do not inherit "open" by accident.
4. **A command guard** as a seatbelt, never as the wall.
5. **A trash shim** so the honest mistakes are recoverable.
6. **Pinned or vendored extensions** for anything you depend on.
7. **Separate accounts or keys** for anything in a terms-of-service gray area.
8. **Inference outside the sandbox**, for local-model users.

And a decision table to map threats to layers:

| Threat | Layer that addresses it |
|---|---|
| Accidental delete | Jail or container, read-only `.git`, trash shim |
| Hallucinated loop | Command guard, version control |
| Malicious package | Pinned or vendored code, microVM |
| Credential exfiltration | Fake home, network policy |
| Account suspension | Separate keys, read the terms |

## The deterministic way out

Step back. Every layer above exists because a loop is running commands on its own judgment. The sandbox is the cost of autonomy.

There is another design. Keep the model out of the shell entirely. You choose the exact files that go into the prompt. The model replies with Search/Replace blocks. Those blocks are applied to the working tree as a plain Git diff that you read, accept or discard, and then commit. Nothing executes unless you run it. Bring your own key, and the only thing the model ever touches is the text you handed it.

That design does not make sandboxes obsolete, because tests and builds still run code. But it shrinks the blast radius of the model from "whatever the shell can reach" to "a diff you can read". Agents are a fair fit for throwaway prototypes in a disposable folder, where a mistake costs nothing. On a codebase with history and customers, a reviewable diff is safer than a cleverer jail.

## FAQ

**If a guard can be bypassed, why use one at all?** Because most accidents are honest mistakes, and a seatbelt catches those cheaply; it just must never be the only layer.

**Isn't a microVM overkill for a hobby project?** Often yes. For accidental deletion a jail plus a read-only `.git` covers most of the risk, and a microVM earns its cost only when untrusted code or secrets are in play.

**Why not just trust a stronger model?** Better models make fewer silly mistakes, but "fewer" is not "none", and the cost of one deletion is unbounded while the cost of a sandbox is a few minutes of setup.

**Does sandboxing slow me down enough to defeat the point of a fast harness?** Startup overhead is small, but friction around networking, GPU access and tool paths is real, and the first setup takes an afternoon.

## Key Takeaways

- Pick the layer by threat: guards for honest mistakes, jails for deletion, microVMs for untrusted code, network policy for exfiltration.
- A guard inside the agent's own process is a seatbelt; the strong boundary has to live in the operating system.
- Shrinking what the model can touch to reviewable text diffs removes more risk than any amount of command filtering.

*Safety that depends on the model behaving is just a hope with a configuration file.*
