# The Extension Ledger: Which Claude Code Add-Ons Earn Their Complexity

Every extension point in a coding agent is a line item: it has a running cost, a claimed benefit and a way of failing. This article audits the common ones as an accountant would, and the verdict is blunt: small, deterministic, local things pay off, and heavy prompt-level layers mostly produce receipts for work that never happened.

> I inherited a repo built by someone who "vibe engineered" it for three months: dozens of skills, a zoo of agent roles, and more documentation than code. I still can't tell which of it helps and which of it just produces the feeling that I'm doing a lot.

## Opening the books: a repo full of assets nobody can value

Picture a team that takes over a three-month-old project. The numbers are the kind that make a new owner sit down: roughly 280k lines of code, 190k lines of documentation, files over 5,000 lines, and more than a million lines of markdown logs written by agents about their own activity. There are about 200 agent "handles" configured, and on inspection around 20 were ever used. There are 40-plus secrets in the environment, and exactly 2 are needed.

Is that an asset or a liability?

The honest answer from experienced developers is "it depends". Someone will point out that the original builder probably had real product context, and that both the heavy and the light approach have a place. Fair. This article is not an argument that extending your tools is a mistake. It is an argument that every extension should be able to answer a bookkeeper's three questions:

1. What does it cost to run, every single session?
2. What evidence says it pays back?
3. How does it fail when nobody is looking?

The evidence behind the ledger below comes from roughly fifteen public discussions among engineers in the trenches. Most of it is comment-level: anecdotes under complaint threads, not controlled measurements. Where the evidence is thin, the ledger says so. A column called "confidence" matters more than any of the others.

## The ledger at a glance

| Mechanism | Typical use | Payoff evidence | Running cost | Failure mode | Confidence |
|---|---|---|---|---|---|
| Notification and status hooks | Know which session needs you | Strong for parallel sessions | Near zero | "Neat, not useful" | Medium |
| Destructive-command gates, deny lists | Stop `rm -rf`, volume wipes | Strong, after incidents | Near zero | Gaps in matching, no shared scripts | Medium |
| Settings flags (attribution) | Remove noise from commits | Small, clear | Zero | Stale key names | High |
| Minimalism skills | Make the agent write less code | Author benchmark only, 5 tasks | Tokens on every task | Hides edge cases | Low |
| Output styles for verbosity | Fix the model's prose | Split | A week of tuning | Does not reach code comments | Low |
| Auto memory, "dream" consolidation | Keep notes across sessions | Unmeasured | Background tokens | Silent usage burn | Low |
| Subagent fan-out, nesting, workflows | Parallel research and coding | Mixed | Largest reported | Error propagation, runaway spend | Medium |

Now the line items, cheapest first.

## Hooks that only watch: the best return on a small outlay

A hook is a script the agent runs at a defined moment: before a tool call, after it, at session end. The cheapest use is observation.

One developer wired a red, yellow and green light to the session state. Red means waiting for confirmation, yellow means running, green means idle. Reactions were mixed. "Neat, not useful" was the polite version. But the replies are the interesting part, because they list everything people already use for the same job: a notification hook, a chat message to a phone, a push notification from the remote-control feature, a programmable button per session that turns red when attention is needed, and the plain old statusline.

The real value of this category is data. One person wanted usage history per command to prove that limits drain faster after certain actions. That is only possible if events were logged in the first place.

Cost: almost nothing. Risk: almost nothing. Failure mode: you built a light that nobody looks at. Verdict: keep, and log everything.

## Hooks and settings as guardrails: the line item people buy after the fire

Nobody installs a deletion gate on day one. They install it after an agent asked to "create a backup" wrote it to the wrong directory and then removed the drive's contents, or after a "clean up unnecessary files" request took out personal documents, or after a suggested `docker compose down -v` erased weeks of local database state. The `-v` flag deletes named volumes, and as one engineer noted, a one-letter flag with that much power is dangerous in Docker itself.

The reported remedies are short:

- a hook on destructive commands that forces an approval step
- `rm -rf` in the deny list of the permissions config
- the automatic classifier mode
- a sandbox container with only the project directory mounted
- separate production and pilot servers, with backups the agent cannot reach

Some blame the setup ("why did it have access to your whole PC?", "backups, backups"); others say a tool that can do this needs a gate that is not made of prompt. Both are right, and that is why the cheap deterministic version wins. A deny list does not read context, does not get persuaded, and does not drift over a long session.

One caveat, since honesty is the whole point of a ledger. Nobody in these threads posted a working hook script. What follows is general background, not thread evidence: a `PreToolUse` hook receives the tool call as JSON on standard input, inspects the command string, and exits with a blocking status if it matches a pattern such as `rm -rf` outside the project root or `docker compose down -v`. That is maybe fifteen lines of shell. Its weakness is also obvious: pattern matching misses creative spellings. Treat it as a net with big holes, and put the real protection in the permission layer and in backups.

Verdict: keep. Highest payoff per line of config in the whole ledger.

## Settings flags: a config key beats a prompt sentence

Two threads, months apart, ask how to stop the agent adding itself as co-author. In March the key was `includeCoAuthoredBy: false`; by July it was an `attribution` block in `settings.json` with empty strings for commit and pull request. The disagreement is the useful part. Some developers want the line gone. Others want it kept for honesty. One reasoned that some companies track AI usage, so individual contributors want it visible in the pull request. Another summed up the mixed message neatly: you are supposed to use AI, but not admit it.

For the ledger, the lesson is smaller. A config key replaced a paragraph of "please never write Co-Authored-By" in an instruction file, and it works every time. Cost zero, evidence clear. The caveat is that the key names changed between the two threads, so copying advice from a six-month-old post is a gamble. Check the current docs.

Verdict: keep, and verify names.

## Skills: the minimalism case study

Skills are where the books get murky. Some developers claim the old commands folder is now simply treated as skills. That is second-hand; verify before relying on it.

The most discussed example is a skill that forces the agent to climb a ladder before writing code. Does this need to exist? Does the standard library do it? Is there a native platform feature? An existing dependency? Could it be one line? The author's own numbers: five tasks, about 16% fewer tokens, roughly 4x faster, 293 lines reduced to 47, and a 190-line countdown dashboard shrunk to 13. The same rules ship as plain rules files for other editors.

Impressive. Also n=5, self-reported.

The pushback was specific and good. Validating an email with `"@" in email` is not minimalism, it is a bug that lets bad data into the database. "Write less code" can quietly delete edge cases, error messages and debuggability. Critics wanted examples at system-architecture level, not a toy dashboard.

The problem the skill targets is real, though. As one engineer put it, "the complexity of any solution you allow the coding agent to propose grows with every turn". And that is the failure mode of every skill. It is a request, not a constraint. One user said that after a model regression it "doesn't stay to SKILLs anymore". Anecdote, single comment, but it describes the exact risk: you pay the token cost of loading the skill on every task, and compliance is a coin flip you cannot see.

Verdict: probe, do not trust. Run it on a task with real validation requirements and compare diffs before adopting.

## Output styles and rules files as a patch for model behavior

Threads complain about the model's mannered prose, and people tried banned-phrase lists, a concise mode and a custom BLUF (bottom line up front) style. The evidence splits. One engineer says output styles do not work and never have. Another says a BLUF and STE style "really improved it", though it took a week of tuning plus audits by several AIs. A third notes the verbosity leaks into docstrings and code comments, which a style cannot reach.

Run the numbers: a week of an engineer's time is the cost, and the reported fallback that actually worked was changing the model. That is a clean example of a prompt-level patch for a model-level problem. If the behavior comes from the weights, a paragraph of instructions is a bandage on a bone.

Verdict: skip, unless prose is your actual product. Switch model first.

## Auto memory and background consolidation: costs you did not approve

Automatic memory writes notes across sessions. After many sessions the notes get noisy and contradictory, so a consolidation pass was introduced: prune stale entries, replace "today" with real dates, merge duplicates. As reported, it triggers after 24 hours and 5 sessions since the last run, has read-only access to project code, write access to memory files, and a lock file for concurrency.

The reaction was skeptical in the way accountants are: "yet another way to burn tokens that runs quietly in the background". One user said usage jumped from 10% to 45% overnight while they were not working, and blamed a "bad dream". That is a joke wrapped around a real signal, and also a single comment, so it proves nothing. What it proves is that nobody measured. The feature was explained mostly through a video, not an announcement. One suggestion deserves a raised eyebrow: set up memory and stop hooks while off-peak limits are doubled. That is the "use it while it's free" mindset, and it is how every cloud bill in history started.

Verdict: hold until measured. Log usage before and after enabling it, and compare.

## Subagents and fan-out: where the expensive surprises live

If the ledger has a red column, it is this row.

Reported incidents:

- A version allowed subagents to spawn their own subagents up to five levels deep. One user ran two simple "look this up online" prompts and watched about a quarter of a five-hour window disappear.
- A session proposed two deep-research harnesses, and every subagent inherited the most expensive model. The allowance was gone in minutes.
- A "dynamic workflows" feature that spawns hundreds of parallel subagents may explain why one weekly limit ran out in two days, though the user also suspected lowered limits.

Plan reviews with several specialized subagents do catch things a single pass misses, so the surface has real uses. But the skeptics have the sharpest lines: "model intelligence just ain't there yet; multi-agent orchestration tends to propagate errors", and "at what point does coordinating all these agents get as time-consuming as coding it yourself?"

Verdict: use sparingly, and only with a depth cap, a pinned cheap model for workers and a spend limit.

## The deterministic alternative: spend where you can read the bill

Look at the ledger from far enough away and a pattern shows up. The rows that pay are deterministic: a deny list, a flag, a hook that either blocks or does not. The rows that leak are the ones where a model has to interpret an instruction, load a pile of text, or decide how many helpers to launch.

That is the argument for agentless, manually scoped work. When a developer picks the exact files that go into a request, the context is small by construction, with no skill library loading underneath it. When the answer arrives as search/replace blocks applied through a normal Git diff, review is a diff review, not archaeology. And when the call is made with your own API key, the cost of each request is a line in your own provider statement, not an overnight percentage that moved for reasons nobody can explain.

That does not make autonomous agents useless. For a greenfield prototype, where the whole thing is disposable, loose orchestration is fine. The ledger just notes that on a complex, long-lived codebase, a mechanism you cannot price is a mechanism you cannot keep.

## A practical audit checklist

1. **Measure before adding.** Log hook events and usage per session for a week. A baseline makes every later claim checkable.
2. **Give every extension a removal test.** Disable it for a day. If nobody notices, delete it.
3. **Cap subagent depth and pin the worker model.** Inheriting the most expensive model by default is how a morning disappears.
4. **Keep destructive-action gates outside prompts.** Deny lists and hooks, plus backups the agent cannot reach.
5. **Treat leaked or unreleased features as non-existent.** Do not build process on a changelog entry that vanished.
6. **Prefer a model change over an output style** when the complaint is model behavior.
7. **Rerun the audit on the inherited repo.** Of the 200 handles, how many survived contact with real work? Of the 190k lines of docs, how many has anyone read?

## FAQ

**Isn't this just a case against having any extensions?**
No. A few small hooks and settings keys clearly earn their place, and a good ledger tells you which. The case is against unpriced complexity, not against configuration.

**If the evidence is mostly anecdotes, why trust the verdicts?**
You should not trust them blindly, which is why the confidence column exists. The advice that holds up is the one that costs almost nothing to test yourself: add one logger, remove one extension, compare two weeks.

**Can't a manual, file-by-file workflow be slower than letting an agent roam?**
Yes, per task it often is, and for throwaway prototypes the roaming agent can win. On a large codebase the time lost to cleaning up after a confident wrong turn tends to exceed the time saved.

**Do deterministic gates really beat a good prompt?**
For irreversible actions, yes, because a gate cannot be talked out of its job. A prompt is still the right tool for style and taste, where an occasional miss is cheap.

## Key Takeaways

- Small, deterministic, local extensions (status hooks, deny lists, config flags) have the clearest payoff and the lowest running cost.
- Heavy prompt-level layers (skill piles, output styles, background memory, recursive subagents) mostly lack measurements, and the ones with numbers show spend, not savings.
- Whatever you add, make it measurable and removable, and keep irreversible-action protection outside the model.

*A tool you cannot price is a tool you do not own; it owns a slice of your attention and your budget until you audit it.*
