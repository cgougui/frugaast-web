How many tokens did that task cost? How much did the model actually think? Which model answered? If you use Claude Code on a subscription, you can't answer any of these from the interface, and that's why a quota hitting 97% halfway through a refactor feels like a bug report against a system nobody can see inside.

The busiest forums for metered coding agents are full of jokes about this. "As soon as I hit 90% of the limit." "When you're at 97% used but the agent isn't done." Under the jokes, people have built habits. One developer keeps the handoff prompt "in a text file so i dont have to think at 90 percent". Another switches permissions from auto to ask, so the agent stops at a boundary and picks up again after the reset.

When usage suddenly feels worse, there are three possible culprits:

1. The **tool** is wasting tokens (a harness bug).
2. The **vendor** is delivering less reasoning per call (a silent change).
3. The **workflow** is the problem (long sessions, bloated context, the wrong model).

Each one has a different fix, so it's worth keeping them apart. A lot of what gets posted is venting. The threads worth reading include numbers or steps you can reproduce, and those are the ones I used here.

## Number one: what the harness spends per task

Prompt caching is what makes long agent sessions affordable. The provider stores the processed start of your prompt, and a later request that begins with identical text reads it back at a fraction of the price. Identical means byte for byte. Change one early byte and the whole prefix gets rebuilt at full price.

A reported bug fits that mechanism exactly. A developer had another model analyze the minified source of a coding CLI and found that the function deciding what gets saved with a session strips attachment-type messages. That includes the records announcing which deferred tools were already loaded. On resume, the tool doesn't know what it already announced, so it announces it again, the prefix changes, and resumed sessions silently lose their cache.

Both sides of the dispute are worth hearing. A member of the product team replied that a fix would ship in the next release but was "a <1% win", so it's not the whole story. Another developer pointed out that the community patch repository also forces a one-hour cache lifetime by bypassing a subscription check, which the original post never mentioned. That's circumventing billing controls, and I wouldn't run patches like that blindly.

You can check cache behavior yourself without any patch. This is my suggested method, not something from the threads:

1. Find the session logs under the tool's projects folder in your home directory (JSONL, one event per line).
2. Pick a fresh session and a resumed session of similar length.
3. Sum the cache-read input tokens and the cache-creation input tokens in each.
4. Compare the ratios. After the first few turns, a healthy session reads far more than it creates. A resumed session that keeps creating is paying full price for a prefix it already paid for.

Related: a leaked source map led to talk of "two cache bugs", and one developer claimed there was telemetry on swearing and on phrases like "keep going". That second claim came from asking a model about the leaked code, so it's unverified. And another developer who found a smaller bug the same way said nobody ever acted on it.

## Number two: how much thinking you got

This is the heavier accusation: the model got shallower and nobody said so.

One widely discussed issue analysis covered nearly 7,000 sessions. It claimed the agent read about three times less code before editing, rewrote whole files twice as often, and abandoned tasks at rates that used to be near zero. The author tied the drop to a staged change that redacted thinking content, and according to the thread, the team involved switched providers. A separate 65-day analysis of over 43,000 calls, relayed through a social post, claims that 39% of calls to a top model got zero thinking tokens and the median call got 123, compared with the 16,000 to 128,000 used in benchmarks. It also reports an 18 to 50% drop between two months.

These are claims to verify, and the open questions are basic. How was "zero thinking tokens" counted: redacted, or never generated? Do the numbers hold for other models? Nobody answered.

What users report from daily work:

- Extended thinking that "never actually happens".
- Effort toggles in the web app "basically ignored" after a model launch.
- A model that passed a reasoning test off-hours but failed it during business hours with extended thinking on. One anecdote, worth checking, not worth believing yet.
- Report formats guessed instead of read from the methodology doc.

People genuinely disagree. Launch threads split between "context seems limited to ~50k before compacting", "back to the previous version", and "been an absolute beast for me". One reply asks: "are you setting it to high, extra or max constantly? I use medium". And someone noticed that on one launch chart, a mid-tier model's two highest effort levels cost more than the top model, because they burn more tokens for the same accuracy. Effort is a price setting as much as a quality setting.

Almost everyone agrees on one thing. People aren't asking for a different model. They want to choose "lighter use, lighter reasoning" explicitly instead of getting throttled without being told.

## Number three: which model actually answered

Some routing already happens without you choosing it. Developers say the smallest model handles a lot of subagent work and search summaries even when a large one is selected. That's what users say; I couldn't verify it. Combined with the thinking question above, you often don't know which model did the work or how hard it tried.

The response from experienced users is to take routing into their own hands.

The best concrete example comes from a developer who gave the main agent a cheap "coworker". Command-line scripts hand bulk file reading and boilerplate to a low-cost open-weight model through the shell, and the instruction file says what to delegate and what to think about. Reported results: no limit hits in three weeks, $0.38 total on the cheap model, and a documentation-update step that dropped from about 5,000 tokens to about 200.

The idea looks like this:

```
# routing rules (instruction file)
- Bulk reads, summaries, boilerplate: call ./delegate.sh "<task>" <files>
- Design, debugging, anything touching auth: think here, do not delegate
```

The replies were useful. Why not just use the vendor's small model? One developer wanted a typed tool server instead of ad hoc scripts: a warm process, one place for safety checks, structured output. Another worried that keeping several models consistent in one codebase is a bigger problem than cost. A third had an agent copy the setup with other backends and claimed it was "conservatively, 23x cheaper". That number was measured by a model about itself, so I'd be careful with it.

The common advice is to default to the mid-tier model and save the top one for architecture: "Mid-tier is faster than the top model and 80% as good... my limit complaints stopped."

Some people have the strongest model write skills that tell the weaker one how to behave. Skeptics replied quickly that skills are guides and won't turn the weaker model into the stronger one. Nobody showed the skills helped.

Planning with one vendor and reviewing with another is another option. One developer says every plan made with one vendor's model and sent to another's turns up real issues. A benchmark on a production Rails codebase put one model at roughly 0.70 quality for under $1 a ticket and another at 0.61 for about $5, using three LLM judges. People pushed back that benchmarks and daily experience disagree, and the poster sells the benchmarking tool.

## Sometimes the workflow is the problem

A long session costs more than it looks. Every turn resends the conversation, and every tool result piles on. Quality also tends to drop as context fills. One developer says the agent "gets worse past 60%", so they compact or start fresh. Another: "Keeping chats going on and on is self destructive to your tokens." A skeptic argues the opposite: better to wait for the reset than to branch into another conversation or another AI.

The workflow people report most often is short sessions driven by files:

1. Use the strongest model to design the project and split it into many session briefs, each saved to a file.
2. Run a fresh mid-tier instance per brief.
3. Throw the thread away afterwards.

One developer calls it planning with the top model and implementing with the mid-tier one, and says the implementer "takes forever debating itself, but I don't hit limits". Handoffs near the limit are simple: a saved prompt, an export command, compaction followed by a copy, or asking another vendor's agent to resume from the transcript.

On big default context windows, the main question is whether performance drops off before compaction kicks in. One developer who runs long agents avoids the wall with manual compaction and smaller sessions. Nobody has posted measurements.

Tooling can quietly add cost. One objection to a format-on-save hook: every file change injects a system reminder listing the changed lines into the next prompt, a steady drip of context. A popular bundle of workflow skills reportedly improves code quality at roughly twice the tokens. Better quality isn't free, but you should know what it costs.

## Claimed versus verified

| Claim | Evidence | Verdict |
|---|---|---|
| Resumed sessions lose caching | Binary analysis plus a team reply | Plausible, partly confirmed, small effect |
| Reasoning budget silently cut | Issue analysis and a 43k-call audit | Methodology unverified |
| A knowledge-graph skill gives "71x fewer tokens" | The author's own claim | Disputed |
| Delegating to a cheap model saves 90%+ | One developer's $0.38 | Single anecdote |
| Terse "caveman" output saves 75% | A viral title and jokes | Unmeasured |

The knowledge-graph case is the most instructive. Developers asked whether it was "71x vs 71%?" and noted it went stale on repos with twenty-plus commits. One asked their agent how many tokens the tool had saved and got "none": the agent had never used it, despite a line in the instruction file telling it to. Check the tool-call logs before you believe a token saver is doing anything.

Tricks on the output side save reading time more than tokens. A local model rewriting display text costs local compute and doesn't change what the agent sees. A satire thread about rewriting a codebase "on a single grain of rice" landed because a lot of cost-optimization talk is lossy compression with a fidelity cost.

At the far end, one user spawned 451 mid-tier subagents and used about 14M tokens in a single five-hour session. On an enterprise plan, as others pointed out, "the limit" is just the invoice. The reply suggesting deterministic pipelines, with inference only where it's needed, had the right instinct.

## Cheap quality checks

Some checks cost almost nothing:

- End a session with "What are you least confident about?" People report that about one time in four, one of the answers is a big deal. Add "What's the biggest thing I'm missing?" and "If this breaks in 3 months, what is the most likely reason?"
- Review in a fresh context, or with another model. As one review thread put it, "the model that wrote the code is the worst possible reviewer of its own output". It costs more tokens.
- Simple instruction-file rules (ask, don't assume; simplest first; don't touch unrelated code; flag uncertainty) have known failure modes. "Simplest first" breeds lazy shortcuts. Treat rule sets like these "like a menu rather than a template".

Unattended runs have also produced a deleted home directory, a subagent allegedly injecting instructions into the main session, and the rule "NEVER use rm, ONLY mv to archive/". That's off topic for cost, but a runaway agent burns files as well as tokens.

## Or make all three numbers visible

All of this detective work was needed because the harness, the thinking budget and the model choice were hidden. Every suspect lives inside a system the user can't inspect.

The agentless approach removes the suspects instead of chasing them. Choose the exact files that go into each prompt, so context is whatever you decided and there's nothing to resume or compact. Use your own API key, so the provider's usage page shows tokens per request and nothing is rationed behind a plan. Pick the model per request, so routing is a click and not a guess. Get search/replace blocks back and review them as a normal Git diff.

It's slower than letting an agent roam, and for a greenfield prototype the agent may well be the better tool. But in a codebase people need to keep understanding, a short deterministic loop is much easier to measure than a long autonomous one.

## Measure, then route

1. **Instrument first.** Log tokens per task and the cache read/creation ratio for fresh versus resumed sessions. Count thinking tokens if the tool exposes them, and note variation by time of day.
2. **Pin what you can.** Set model and effort explicitly, avoid resuming huge sessions, and watch release notes for cache fixes.
3. **Route.** The strongest model writes briefs to files, a mid-tier model implements one brief per fresh session, cheap models take bulk reads and boilerplate.
4. **Plan the exit.** Keep the handoff prompt in a file, know your export command, use a halt that knows about usage, and switch to ask-for-permission near 95%.
5. **Check claims.** Run a small A/B test on your own repo before trusting any "Nx cheaper" number, including the ones above.

"Silent nerfing" is sometimes just novelty wearing off. But you can't settle the argument either way without logs, which is the best reason to keep your own. Buying a higher plan gets you headroom, not visibility. And community cache patches are rarely worth it: most of the reported gains were small, and the real fix is a vendor release.
