# When the Vendor Controls the Dials: Usage Burn, Silent Reasoning Cuts, and How Claude Code Users Route Around Them

Developers on a metered coding agent are measuring session logs, patching cache bugs and splitting work across models, because limits and reasoning depth changed under them without notice. This article treats the problem as a forensic case: what can be measured, what is only claimed, and what to do about each.

> My quota hit 97% while the agent was mid-refactor, and I had no idea whether the tool wasted tokens, the vendor trimmed reasoning, or my own habits were to blame. I realised I was filing a bug report against a system I could not see inside.

## The case file

Scroll through any busy forum for a metered coding agent and the top posts are jokes about limits. "As soon as I hit 90% of the limit." "When you're at 97% used but the agent isn't done." The agent watching you write code by hand after the daily limit.

Underneath the jokes, practice. One developer keeps the handoff prompt "in a text file so i dont have to think at 90 percent". Another switches permissions from auto to ask, so the agent halts at a boundary and resumes after the reset.

Three suspects keep coming up:

1. The **tool** wastes tokens (a harness bug).
2. The **vendor** delivers less reasoning per call (a silent change).
3. The **workflow** is the culprit (long sessions, bloated context, the wrong model).

Threads supply evidence for all three. Keep them separate, because each has a different fix, and lumping them together is how a vendor complaint turns into a venting session.

A warning on evidence quality: much of this sentiment is venting. The useful threads include numbers or reproducible steps, so those are the ones used here.

## Suspect one: the harness burns tokens

Prompt caching is what makes long agent sessions affordable. The provider stores the processed beginning of your prompt, and a later request that starts with the identical text reads it back at a fraction of the price. The word that matters is *identical*. Change one early byte and the whole cached prefix is rebuilt at full price.

A reported bug fits that mechanism exactly. A developer had another model analyse the minified source of a coding CLI, and found that a function filtering what gets saved with a session strips attachment-type messages, including records announcing which deferred tools were already loaded. On resume, the tool no longer knows what it already announced, so it announces again, the prefix changes, and caching is silently lost on resumed sessions.

Both sides of the dispute deserve air. A member of the product team replied that a fix would ship in the next release but was "a <1% win", so not the whole story. And another developer pointed out that the community patch repository also forces a one-hour cache lifetime by bypassing a subscription check, which the original post never mentioned. That is circumvention of billing controls. Do not run such patches blindly.

You can check the cache behaviour yourself, no patch required. This is a suggested method, not something the threads report:

1. Find the session log files under the tool's projects folder in your home directory (they are JSONL, one event per line).
2. Pick a fresh session and a resumed session of similar length.
3. Sum the cache-read input tokens and the cache-creation input tokens in each.
4. Compare the ratio. A healthy session reads far more than it creates after the first turns. A resumed session that keeps creating is paying full price for a prefix it already paid for.

Related debris: a leaked source map prompted talk of "two cache bugs", and a developer noting telemetry on swearing and on phrases like "keep going". That second claim came from asking a model about the leaked code, so it is unverified. One more counterpoint: a developer who found a smaller bug the same way said it was never acted upon.

## Suspect two: reasoning that is not delivered

This is the heavier accusation. It says the model got shallower without notice.

One widely discussed issue analysis covered nearly 7,000 sessions and claimed the agent read code about three times less before editing, rewrote whole files twice as often, and abandoned tasks at rates previously near zero. The author tied the drop to a staged change that redacted thinking content, and the thread's summary says the team involved switched providers. A separate 65-day analysis of over 43,000 invocations, relayed via a social post, claims 39% of calls to a top model got zero thinking tokens, the median call got 123, against 16,000 to 128,000 used in benchmarks, with an 18 to 50% drop between two months.

Read these as claims to verify. Open questions are basic ones. How was "zero thinking tokens" counted: redacted, or never generated? Do the figures hold for other models? Those were not answered.

What users report in daily work:

- Extended thinking that "never actually happens".
- Effort toggles in the web app "basically ignored" after a model launch.
- A model passing a reasoning test off-hours but failing it in business hours with extended thinking on, a single anecdote worth checking and not worth believing yet.
- Report formats guessed instead of reading the methodology doc.

The disagreement is real. Launch threads split between "context seems limited to ~50k before compacting", "back to the previous version", and "been an absolute beast for me". One reply asks: "are you setting it to high, extra or max constantly? I use medium". A sharp observation from the same threads: on one launch chart, a mid-tier model's two highest effort levels cost more than the top model, because they burn more tokens for the same accuracy. Effort is a price lever, not only a quality lever.

Here is the point nearly everyone agrees on. People are not asking for a different model. They are asking to pick "lighter use, lighter reasoning" explicitly, instead of getting silent throttling.

## Suspect three: the workflow

A long session costs more than it looks. Each turn resends the conversation, and every tool result piles onto it. Quality tends to fall as context fills, too. One developer says the agent "gets worse past 60%" and so they compact or start fresh. Another: "Keeping chats going on and on is self destructive to your tokens." A skeptic pushes the other way, saying it is better to wait for the reset than to branch into another conversation or another AI.

Short sessions, driven by files, are the workflow that gets reported most often:

1. Use the strongest model to architect and break the project into many session briefs, each saved to a file.
2. Run a fresh mid-tier instance per brief.
3. Abandon the thread afterwards.

One developer calls it planning with the top model and implementing with the mid-tier, and reports the implementer "takes forever debating itself, but I don't hit limits". For handoffs near the limit, the mechanics are simple: a saved prompt, an export command, a compaction followed by copy, or asking a different vendor's agent to resume from the transcript.

On large default context windows, the top question is performance drop-off versus compaction. A long-running-agent developer avoids the wall with manual compaction and smaller sessions. Nobody posts measurements, and that is a research gap.

Tooling can quietly add cost. One objection to a format-on-save hook: every file change injects a system reminder listing changed lines into the next prompt, a steady drip of context. And a popular workflow-skills bundle reportedly improves code quality at a cost of about twice the tokens. Quality is not free, but it should be priced.

## Routing: put the cheap model on the bulk work

The strongest concrete example comes from a developer who gave the main agent a cheap "coworker". Command-line scripts delegate bulk file reading and boilerplate generation to a low-cost open-weight model via the shell. The instruction file holds routing rules for what to delegate and what to think about. Reported: no limit hits in three weeks, $0.38 total on the cheap model, and a documentation-update step falling from about 5,000 tokens to about 200.

Shape of the idea:

```
# routing rules (instruction file)
- Bulk reads, summaries, boilerplate: call ./delegate.sh "<task>" <files>
- Design, debugging, anything touching auth: think here, do not delegate
```

The replies are instructive. Why not just use the vendor's small model? One developer wants a typed tool server instead of ad hoc scripts, for a warm process, one place for safety guards and structured output. Another worries that consistency across models touching one codebase is a bigger problem than cost. A third had an agent replicate the setup with other backends and claimed "conservatively, 23x cheaper", which is self-measured by a model and should be treated with caution.

Some routing is already native: developers say the smallest model handles much of the subagent work and search summaries even when a large one is selected (stated by users, not verified). Advice from the same threads: default to the mid-tier and reserve the top for architecture. "Mid-tier is faster than the top model and 80% as good... my limit complaints stopped."

Another move: have the strongest model write skills that tell the weaker one how to behave. Skepticism came fast: skills are guides, and they will not turn the weaker model into the stronger one. Nobody has proof the skills helped.

Cross-vendor planning and review is a further option. A developer says every plan made with one vendor's model and sent to another's turns up real issues. A benchmark on a production Rails codebase put one model at roughly 0.70 quality for under $1 a ticket against another at 0.61 for about $5 using three LLM judges, with pushback that benchmarks and daily experience disagree, and a note that the poster sells the benchmarking tool.

## Claimed versus verified

A table keeps the claims honest.

| Claim | Evidence in the threads | Verdict |
|---|---|---|
| Resumed sessions lose caching | Binary analysis plus a team reply | Plausible, partly confirmed, small effect |
| Reasoning budget silently cut | Issue analysis and a 43k-call audit | Unverified methodology |
| A knowledge-graph skill gives "71x fewer tokens" | The author's own claim | Disputed |
| Delegating to a cheap model saves 90%+ | One developer's $0.38 | Single anecdote |
| Terse "caveman" output saves 75% | A viral title and jokes | Unmeasured |

The graph-skill case teaches the best lesson. Developers asked "71x vs 71%?", noted staleness on repositories with twenty-plus commits, and one asked their agent how many tokens it had saved and got "none", because it never used the tool despite a mandate in the instruction file. Check the tool-call logs to confirm a token-saver is actually invoked.

Output-side tricks save reading time more than tokens. A local model rewriting display text costs local compute and does not change what the agent sees. One satire thread, about rewriting a codebase "on a single grain of rice", landed because much cost-optimisation talk is lossy compression with fidelity trade-offs.

At scale, one user spawned 451 mid-tier subagents using about 14M tokens in a single five-hour session. On an enterprise plan, as others stressed, "the limit" is the invoice. A reply on deterministic pipelines, with inference only where needed, is the right instinct.

## Cheap quality checks

Some controls cost almost nothing:

- End a session with "What are you least confident about?" The reported hit rate: about one time in four, one item is a big deal. Add "What's the biggest thing I'm missing?" and "if this breaks in 3 months, what is the most likely reason?"
- Review in a fresh context, or with another model. The point made in one review thread: "the model that wrote the code is the worst possible reviewer of its own output". The trade-off is more tokens.
- Simple instruction-file rules (ask, don't assume; simplest first; don't touch unrelated code; flag uncertainty) have known failure modes. "Simplest first" breeds lazy shortcuts. Treat such rule sets "like a menu rather than a template".

A short note on safety. Unattended runs have produced a deleted home directory, a subagent allegedly injecting instructions into the main session, and the rule "NEVER use rm, ONLY mv to archive/". Tangential to cost, but a runaway agent burns both tokens and files.

## The deterministic alternative

Step back from the forensics and notice what made it necessary: a hidden harness, a hidden thinking budget, a hidden model choice. Every suspect lives inside a system the user cannot inspect.

The agentless answer removes the suspects instead of chasing them. Choose the exact files that form each prompt, so context is whatever you decided, and there is nothing to resume or compact. Bring your own API key, so the provider's usage page shows tokens per request and nothing is rationed behind a plan. Pick the model per request, so routing is a click, not a guess. Receive search/replace blocks and review them as a normal Git diff.

That is slower than letting an agent roam, and for a greenfield prototype the agent may well be the better tool. In a codebase that has to stay understood, a short deterministic loop is easier to measure than a long autonomous one.

## A measure-then-route checklist

1. **Instrument first.** Log tokens per task and cache read/creation ratio for fresh versus resumed sessions. Count thinking tokens if the tool exposes them, and note time-of-day variance.
2. **Pin what you can.** Set model and effort explicitly, avoid resuming huge sessions, and watch release notes for cache fixes.
3. **Route.** Strongest model writes briefs to files, mid-tier implements one brief per fresh session, cheap models take bulk reads and boilerplate.
4. **Plan the exit.** Keep the handoff prompt in a file, know your export command, use a usage-aware halt, and fall back to permission-ask near 95%.
5. **Verify claims.** Run a small A/B on your own repository before trusting any "Nx cheaper" number, including the ones above.

## FAQ

**Isn't "silent nerfing" just users feeling things?**
Sometimes, and novelty wearing off explains a lot of it. But the disputes cannot be settled without logs, which is the reason to keep your own.

**Does routing to a cheap model risk worse code?**
Yes, and one developer argues bugs from cheaper models cost more than the savings. Delegating only low-risk bulk work, and reviewing the diff, keeps the risk contained.

**Why not just buy a higher plan?**
A higher tier buys headroom and not visibility, so the same opaque dials remain. It is a fair choice when the work is valuable and the budget exists.

**Are community cache patches worth installing?**
Rarely, since a patch that touches billing-related behaviour can cross a line, and the real fix is a vendor release. Measure the problem first; most gains reported were small.

## Key Takeaways

- Separate the three suspects (harness waste, delivered reasoning, workflow habits), because each needs different evidence and a different fix.
- Short, file-driven sessions with explicit model routing beat long, resumed ones on both cost and quality.
- What people want is visible controls and honest metering, so favour setups where you choose the context, the model and the key.

*You cannot tune a dial you are not allowed to read, so start by owning the gauge.*
