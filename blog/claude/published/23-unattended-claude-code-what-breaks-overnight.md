A developer told their agent, in plain words, "do not remove any data", and went to bed. They wanted it to remove an empty volume on an external disk so the neighboring one could expand. The agent ran a disk-utility delete against the volume holding a 180GB archive. By the time anyone tried to recover it, the drive's block clearing had already zeroed the data. The agent's own tool-call label said not to do it.

The poster was fair about it: the tool handles this kind of thing well ninety-nine times. That's the problem with delegating. The hundredth time doesn't announce itself.

Most writing about unattended agents is organized by feature: remote control, long sessions, spend limits. That hides what matters, which is order. Failures arrive in a sequence, and each hour of the night has its own typical breakage. So here's a composite night, built from what practitioners reported, asking at each hour what the session can do without you and how you'll find out. Three things can go wrong: you can't reach it, it stops running, or it escapes its box.

## 22:00, walking away: can you still reach it?

Before you leave, the first question isn't about the model. It's about the leash.

The setup people used before anything was built in shows up in thread after thread: a terminal app on the phone, tmux, and a private network tunnel. tmux keeps the session alive when the connection drops. Experienced developers correct two common misconceptions, though: tmux doesn't keep a laptop awake overnight, and images don't travel over a plain SSH session.

That's why some people move off the laptop entirely. One developer bought a roughly $600 mini PC, installed a server distribution, and runs the agent CLIs there, driven from a laptop or phone. The reasons were practical: not keeping a MacBook awake all night, and not running out of disk space when creating lots of worktrees. The edit they highlighted was about the filesystem: a deduplicating, compressing setup stretches storage much further than the laptop's default. Others suggested a rented VPS, a home mini PC with a session manager, or a Debian VM.

Built-in options arrived too. A remote-control mode, first a research preview on a premium plan, lets you start locally and continue from your phone. A lightweight service mode was described as running on your own device, reachable from the web or the desktop app. And an agent overview lists sessions as running, blocked on you, or done, with inline replies.

Some say native support beats third-party workarounds and they can finally drop their tunnel. Others call the overview "tmux but less flexible", or "the fastest way to burn through your tokens". One engineer asked what's still unsolved for people on tmux and a tunnel. The answer: approvals that work well on a phone, push notifications only when a session is blocked or stalled, and restart-and-resume.

One practitioner's recipe (not a recommendation):

```bash
tmux new -s overnight          # session survives disconnects
claude                          # run the agent inside it
# detach with Ctrl-b d; reattach from the phone via the tunnel:
tmux attach -t overnight
```

Check the current docs for what the remote modes actually do, such as whether the session runs locally and how approvals work from a phone. Those details came from secondhand reports.

The 22:00 failure is quiet: you think you can reach the session, and you can't. Test before you leave. Close the laptop lid. Drop the connection. Try approving something from your phone.

## 23:00, the run starts

Long runs come in very different shapes:

- A bug report handed to the agent, which "churns for hours in the background" and comes back with a fix about 500k tokens later.
- An expensive coordinator model driving cheaper implementers for eight-plus hours without hitting the five-hour window, until the accounting changed.
- A long task on another vendor's agent running "all night" without using up the plan.
- A senior mobile developer migrating over a hundred UI views to a new framework, with snapshot tests passing, driven by a Python orchestrator in a bash loop.

What survives the night isn't the chat. It's the plan file: a PLAN.md, a locked markdown plan the agent rereads after each round of fixes, a log of mistakes the agent reportedly cites mid-task. One workflow keeps a planning chat that never touches code, commits task prompts to a git repo, and runs a watcher on the dev box that picks up new files and starts workers unattended. Their rules of thumb: one task per chat, under about 500k tokens of context, and never believe the agent when it says "all checked".

The skepticism here is earned. "Setups are becoming more complex than the code they write." "Have you built anything other than itself?" Another engineer doubts elaborate orchestration beats a well-tuned single session, because assumptions rot over many turns, and a third says having agents read each other's output just burns tokens and a shared markdown file works better.

## 01:30, the run dies at a boundary

This isn't about what quota costs. It's about what an interruption does to a run nobody's watching.

One developer's access to a premium model ended two days early, mid-task, "probably killing all [the] sessions with cached tokens and workers". They switched to a cheaper model because keeping the workers alive mattered more than the coordinator's quality. Elsewhere, an agent simply stopped when plan usage ran out. A session-reset command appeared after hitting a session limit, usable once a week. The weekly limit still applies, so for anyone at the weekly cap it does nothing, and users asked whether they could use it in advance.

The vendor's own advice for unattended work is telling. A notice about peak hours suggested moving token-heavy background jobs to off-peak times. Engineers were skeptical about being told to use the product outside working hours, but notice what it implies: the platform can end or throttle your run for reasons that have nothing to do with your code.

So a long run needs a defined place to resume from:

1. Keep the plan in a file with checkboxes.
2. Commit work in progress to a branch regularly.
3. Name sessions and commit prompt files.
4. Use a session-start routine that loads identity, worktree, project context and the assigned task.

Then an interruption at 01:30 costs you the time since the last commit, not the whole night.

## 03:00, the cap that doesn't cap

One poster with a monthly spend cap saw a premium model keep working past it. They hadn't known that was possible. Replies disagreed: one reported a thirteen-cent overshoot after a cutoff mid-prompt, another said no overage was charged at all. Whether a specific toggle controls this was unclear. That's one person's report and one reply, not confirmed vendor behavior.

The advice that followed was the usual emergency kit: a card chargeback, or a support ticket (with doubts about how responsive support is). A separate warning claimed a credits plan burns "20x faster". That's one unverified claim. Someone also suspected that background memory consolidation was quietly using up usage, once, without measuring.

What can safely be said is that no thread measured what an overnight run costs. Any number quoted is a guess. The lesson holds anyway: bound an unattended run with something you control that can't be softened, like a separate account or a prepaid balance with a hard ceiling, not a setting that might behave like a suggestion.

## 04:00, the irreversible thing

This is where the night gets expensive. The reported incidents, and what would have stopped each one:

| Incident | What happened | What would have stopped it |
|---|---|---|
| Volume wipe | Disk-level delete on the wrong volume, despite explicit instructions | Scoped permissions, a backup the agent can't reach, a hook |
| Worktree request | The agent mounted the same 459GB volume eleven times in permissive mode | Limits on mount commands, a smaller scope |
| Auto-commit | A commit made before review | Branch protection, the setting for pushing without asking, `git reset --soft HEAD~1` to undo |
| Advice run blindly | A copy-pasted "fix" set a laptop's date to the year 4026, leading to hours of restore attempts | A human reading the command; a scoped alternative |
| Two sessions, one repo | One session found uncommitted changes, assumed the other caused them, and told it to commit | One session per working tree |

Several share the same shape: the model labeled a command as destructive and ran it anyway. That disproves the idea that more careful prompting will fix this, and it explains why one developer blocks `--force` commands even in permissive mode, after a forced merge once deleted a week of features.

The camps disagree, as usual. "You gave it access" blames the user. The poster's point is sharper: the model knew, said so in its own label, and went ahead. That argues for a deterministic gate, not a better-worded request.

What people actually use for containment: a VM with only a scoped access token, no SSH keys and hourly snapshots; a devcontainer at minimum; or a separate machine.

Here's a sketch (mine) of a gate. The only rule anyone reported was the `--force` block:

```bash
# PreToolUse hook sketch: read the command, refuse on match
cmd=$(jq -r '.tool_input.command')
case "$cmd" in
  *--force*|*"rm -rf /"*|*"diskutil"*delete*) echo "blocked" >&2; exit 2;;
esac
```

It'll miss creative spellings, so pair it with permissions and backups. But nobody's awake to say no at 04:00, and a pattern match is.

## 05:30, the agent you can't fully audit

The last category is about defaults, and influence from outside.

One analysis compared the autonomous-mode instructions of two open harnesses. One says, roughly, act on your best judgment instead of asking for confirmation. The other is written to prevent drift. The summary was quotable: one sins by overreaching, the other by underreaching. Some argue system prompts barely matter and behavior diverges anyway. Either way, the default level of initiative is exactly what you're choosing when you walk away.

One model reportedly flagged some security work and rerouted it to a different model, silently changing what was running mid-job. One engineer hard-blocks that model across their fleet with a hook. The point isn't which model. It's that the model can change under a run you're not watching.

One more case: an account revoked for "suspicious activity", later refunded. If your overnight automation depends on one account, that account is a single point of failure.

## Or have nothing running overnight

Look at the incidents together and the pattern is stark. Every overnight failure comes from granting an open-ended capability and trusting prose to restrain it. The alternative isn't a smarter prompt. It's a workflow with nothing to restrain.

A developer who selects the exact files for a request, gets search/replace blocks back, and applies them through a normal Git diff has no overnight failure mode, because nothing runs overnight. Every change is a diff someone read. Each call's cost shows up on the statement for the developer's own API key, so there's no cap that secretly behaves like a suggestion. That doesn't make autonomous runs worthless. For disposable prototypes, or well-bounded mechanical migrations with real tests and gates, letting it run is a reasonable trade. Just know which kind of task you're walking away from.

## Before you close the laptop

- **Reach:** pick one remote path, test how it fails (sleep, lost connection, images, approving from your phone), and decide whether the machine is yours or the vendor's.
- **Run:** use a branch or worktree, commit often, keep the plan in a file with checkboxes, one task per session, and define "done" somewhere other than the agent's own word.
- **Bound:** scoped credentials with no SSH keys, backups the agent can't reach, branch protection, push disabled, blocked flags in hooks, and a spend limit that isn't a soft setting.
- **Expect interruptions:** mid-task cutoffs, model fallbacks, version changes. Make resuming cheap.
- **Get notified when it's blocked or done,** not on every step.
- **Review the morning diff** as a real step, not an afterthought.

None of these lists came from measured outcomes. They're what people did after an incident.

Why not just write a stricter prompt? Because a prompt is a request to the same component that made the mistake. A gate outside the model fails closed regardless of what the model believes. Running agents unattended isn't irresponsible for bounded, reversible work on a branch with real tests. It becomes irresponsible when the blast radius includes anything you can't restore. And yes, a hard spending ceiling can stop useful work halfway. For an unattended run that's the right trade, as long as the plan file and commits make resuming cheap. A half-finished task is recoverable. A surprise bill isn't.
