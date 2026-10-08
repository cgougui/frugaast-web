# "Is It Nerfed?" Treat the Agent Like a Drifting Dependency

Most "the model got dumber" threads are unfalsifiable. The few that turn into real diagnoses all share one habit: they logged something, diffed something, and changed one variable at a time.

> I once spent a whole evening convinced my coding agent had been quietly swapped for a cheaper model. Then I diffed my own config and found I had raised the effort setting three days earlier and forgotten about it.

## The Scientific Lens: What Would Prove You Wrong?

Scroll through any developer forum on a bad week and two kinds of posts show up side by side.

The first kind says "99% sure they started running a 2-bit quant" and gets a pile of jokes in return. The second kind arrives with a log excerpt, a token table, or a binary analysis. Same anger, completely different value.

The difference is not tone. It is falsifiability. "It feels lobotomized" cannot be wrong, so it cannot be useful. "A hardcoded line in version X stops subagents from spawning" can be wrong in five minutes, by anyone with a terminal. That is the bar.

And the evidence from the trenches is humbling. In one famous style of thread, ten people say the model is smarter today and ten say it is dumber. On opaque providers, as one engineer put it, these are "guess games". Another said the likeliest culprit is a harness update or system-prompt tuning, not the weights.

So the question this article answers is narrow. What evidence lets you tell apart four different things?

1. A model change (the weights or the serving stack moved).
2. A harness change (the wrapper prompt, tools or defaults moved).
3. A quota-accounting change (the meter moved).
4. Your own workflow change (you moved).

Quantization claims, silent routing and per-account A/B tests sit outside this list on purpose. They are unprovable from the user side. What can be proven is smaller and, usefully, more actionable.

## The Diagnostic Ladder

Think of it as debugging. You start with the cheapest, most likely cause and climb only when the lower rung is ruled out.

| Rung | Suspect | Cheapest test |
|------|---------|---------------|
| 1 | Your own change | Diff your config, instruction files, effort and model settings |
| 2 | Harness text | Diff the system prompt and config sections after each update |
| 3 | Documented model behavior | Read the vendor's release notes for rewrite, verbosity and effort changes |
| 4 | Cache and session mechanics | Check idle gaps, resumes, model switches |
| 5 | Quota accounting | Compare tokens and API-equivalent dollars per 1% of allowance |
| 6 | The weights themselves | Run a fixed task set on pinned commits, over time |

Most people jump from "bad day" straight to rung 6. Almost every documented case lived on rungs 2 to 5.

## Case A: The Harness Line That Disabled Your Subagents

A report that circulated among heavy users of an agent CLI described a two-line instruction. It reportedly targeted only one model family and said, roughly: do not call the agent-spawning tool unless the user requested it, and do not use workflows or deep-research unless the user requested it. It was said to be injected remotely at first, then compiled into the binary across two consecutive releases. The poster found a section in the local JSON config file where the setting lived, and a public issue contained the binary analysis.

Here is why this one deserves attention.

The run still looks normal. The model does not crash. It either inlines the delegated work or quietly skips it. In the example given, a self-audit ran non-blind because the independent auditor could not be spawned. The model noticed, mentioned it, and let it slide. That defeats the entire point of an independent audit, and nothing in the output screams about it.

How did people confirm it? Two ways. They asked the agent to read its own config file and explain how that section affects skills. And other users reported cold-reviewer and explorer subagents failing, with one saying "Even if I contradict it in claude.md it doesn't work."

Now the honest part. Not everyone reproduced it. Some said the same model dispatched subagents "like a champ", and one reader warned that the original post doubled as an ad for a paid product. So treat it as plausible, partially reproduced, and instructive regardless of final truth.

The instructive bit is the wording. "Unless the user requested it" is a loophole, and loopholes can be tested.

```text
# Narration (easy to ignore)
Step 3: This step is handled by an auditor agent.

# Imperative (hard to ignore)
Step 3: Delegate this to a subagent. Do not do it yourself.
```

And you can build a canary around it. A tiny prompt that asks the model to spawn a no-op subagent and report whether it could. Run it after every update. If it starts failing, you know the harness changed before any of your real work gets silently degraded.

## Case B: Documented Behavior Changes That Cost Tokens

Some "nerfs" are just the vendor telling you what changed, in release notes nobody read.

One newer model was documented as more likely to rewrite an entire file than make a targeted edit, to use denser prose, to stop and ask "Shall I apply this?" unless nudged, and to do more than asked: fix nearby code, add extra tests. Users who hit those traits burned a five-hour limit in 12 to 20 minutes.

Even here, people disagreed. One said "verbose" was the wrong reading, since the output was denser, not longer. Another said full rewrites finally cured their "edit slop". Same behavior, opposite verdicts. That is what a trade-off looks like.


Over-discovery is the third pattern. One user watching a session through a tracing tool saw 68 tool calls and about 50k tokens in a single turn, from a fresh session with a 2k-token instruction file and no extensions. The skeptical reply was fair: hundreds of complaint posts, and almost nobody posting `ccusage` output. "Show your ccusage" became a refrain for a reason.

The fan-out stories are the loudest. A new effort slider reportedly spawned 45 agents. A docs-drift check burned 1.8M tokens. A rate limit arrived after 80 parallel agents. Ten subagents consumed a whole five-hour window on one vulnerability audit. Part of this is documented behavior: a top effort mode that scripts changes and parallelizes across subagents.

A widely quoted vendor figure says multi-agent setups use roughly 15x the tokens of a single chat. The sensible reply was that this trade is fair only for tasks that truly parallelize, like breadth research or wide search. For a focused edit in a tangled module, it is a bill with no benefit.

## Case C: Quota Accounting You Can Audit

The strongest data came from the Codex side, and it was strong because it was boring.

One poster compared the cost of 14% of an allowance before and after a "banked reset". Before: 5 hours 4 minutes, 738 responses, 114.41M input tokens (94.5% cached), 465.5k output. After: 2 hours 4 minutes, 489 responses, 63.60M input tokens (96.5% cached), 284.7k output. The conclusion drawn was that the reset delivered about half the normal allowance.

Note what made it credible. The poster listed confounders on their own: model mix, effort levels, agent spawns, compaction events (10 versus 1), transport retries (10 versus 3). Others brought their own numbers and mostly agreed ("starting at 86%... down to 50% in 12 hours"). Others asked whether the test was cleanly controlled. Good. That is a conversation, not a vibe.

A tracker app claimed a weekly limit fell from about $160 to $80 API-equivalent after a reset. One reader cross-checked with a usage tool and saw roughly half, and planned to check cache hit rate because an earlier bad episode had been a provider-side cache problem.

The counter-case matters just as much. A "10-20x faster drain" claim pointed to a public issue with logs, and a skeptic posted a daily token table (hundreds of millions of tokens a day, 49 to 58% cache hit) and said they never hit a limit. Both can be true. Drain depends on cache state, task mix and model.

The useful unit that falls out: **tokens and API-equivalent dollars per 1% of allowance**, measured on identical task mixes, with cache hit rate, model and effort recorded alongside.

## Mechanisms That Drain Quota Without Any Nerf

Some of the scariest drain stories need no villain at all.

- **Resume cache writes.** A five-agent session reportedly exhausted a fresh $100 plan in under two minutes. An engineer explained that resuming a session after switching plans rewrites the whole context into the cache. Advice: checkpoint after each task, disable auto-resume, write a handoff doc before you hit the limit.
- **Cache expiry.** The claim is that the prompt cache lasts about an hour, so an idle gap means full-price reprocessing instead of the roughly 10% cached rate. Verify this against provider docs, because TTLs change.
- **Model switching mid-conversation.** Switching resends the whole conversation. This is exactly where one "85% savings from routing" claim got challenged.
- **Compaction hooks.** A tool-output compaction hook drew the objection "will reduce cache hits and end up costing more?" and nobody posted an answer. That is a measurable question, left unmeasured.

None of these are nerfs. All of them look like nerfs from the dashboard.

## Controlling the Harness Layer

If the wrapper is a dependency, you are allowed to pin it, diff it and sometimes replace it.

One veteran of 45 years in the industry recommended replacing the default system prompt with a wrapper script, starting from a community repo of extracted prompts. The replies corrected the details: the CLI flag reportedly replaces only the opening lines, full replacement needs the SDK, and a file-based flag is easier. Others asked whether it breaks built-in tool handling. Unverified, so test before trusting.

A gentler route is appending rather than replacing. One author distilled a behavior file by having a stronger model audit sessions from the newer model, then re-running the same prompts on the older one from the same code commits. They load it with an append-system-prompt-file flag plus a shell alias, and a engineer suggested the flag works better than the instruction file alone.



## The Architectural Answer: Make Drift Small and Visible

Here is the uncomfortable pattern. Every case above was hard to diagnose because the thing changing was hidden. A remote-injected line. A cache that behaves differently after a resume. A spawn count nobody asked for.

An agentic harness is a stack of moving parts you did not choose: its prompt, its tools, its exploration policy, its retry logic. Each is a place for drift to hide.

The deterministic alternative shrinks that surface. You pick the exact files that go into the prompt, so context size is a number you can read before sending. You bring your own key, so the meter is the provider's price sheet, not an opaque percentage. The model returns Search/Replace blocks, and the change lands as a normal Git diff. If something regressed, you can diff it. If cost jumped, the per-request cost record says which request did it.

That is not an argument against agents. Prototyping a greenfield app with an autonomous loop is a fine use of one. It is an argument that for a complicated codebase, fewer hidden variables means fewer arguments about quantization.

## Build a Drift Log

A practical checklist, small enough to actually keep.

1. **Pick 3 to 5 representative tasks** and pin them to specific commits.
2. **Record per run:** model, effort, harness version, tokens in, out and cached, wall time, tool-call count, subagent count, and percent of window consumed.
3. **Keep a daily table** in the style of the posted usage tables: tokens, cache hit rate, API-equivalent value, and the version number.
4. **Diff the harness** after each update: system prompt, config sections, new instructions.
5. **Run canaries** for anything that depends on subagents, hooks or tools.
6. **Cap fan-out** in instructions, scope verification loops explicitly (unscoped browser-automation verification can torch a budget), and choose effort per task.
7. **Keep a second provider** and portable instruction files as a hedge.

One poster's day-by-day breakdown is a good template for the spend profile: roughly 40% reads and context scanning, 25% scaffolding and tests, 20% formatting and renames, 15% hard reasoning. Their conclusion was that routing cut a $200 plan to about $30 a month on API. Replies asked how routing works given the full-conversation resend, and whether $30 really beats a cheaper plan. Fair questions. Measure your own profile before copying anyone's.

## What Providers Could Expose, and What Stays Unknowable

What the threads keep asking for and not getting: per-prompt token estimates, a changelog for model-side changes, and notice when harness prompts change. A member of one vendor's team reportedly said a top plan is not going away, yet resets, boosts extended repeatedly and shifting multipliers keep people guessing.

What stays unprovable: quantization, silent routing, per-account experiments. To be plain, the evidence in these discussions contains no verified proof of either side. What is verified is harness text, documented behavior and user-collected usage tables.

So the rule is short. Measure first, argue second.

## FAQ

**Isn't a drift log overkill for something I use to write code?**
For a weekend project, yes. For a codebase with deadlines, an hour of setup beats a week of wondering whether the tool or you changed.

**If the vendor can change anything silently, what does pinning even achieve?**
You cannot pin the weights, but you can pin your inputs, your commits and your harness version, so when results shift you know which side moved.

**Aren't some of these "nerf" reports just confirmation bias?**
Often, yes, and that is exactly why logs beat memory. The same bias runs in both directions.

**Doesn't manual file selection just move the work onto me?**
It does, and that is the trade. You spend a minute scoping context and in exchange get a prompt size you can read and a cost you can predict.

## Key Takeaways

- Climb the diagnostic ladder from your own config to harness text, documented behavior, cache mechanics and quota accounting before ever blaming the weights.
- The unit that makes drift comparable is tokens and API-equivalent dollars per 1% of allowance, recorded with cache rate, model and effort.
- Fewer hidden layers (explicit file context, your own key, plain Git diffs) means fewer places for drift to hide.

*A tool you cannot measure is a tool you can only argue about.*
