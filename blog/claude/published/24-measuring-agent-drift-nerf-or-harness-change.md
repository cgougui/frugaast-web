I once spent a whole evening convinced my coding agent had been quietly swapped for a cheaper model. Then I diffed my config and found I had raised the effort setting three days earlier and forgotten.

Go to any developer forum during a bad week and you'll see two kinds of posts side by side. One says "99% sure they started running a 2-bit quant" and gets a pile of jokes back. The other comes with a log excerpt, a token table or a binary analysis. Same anger, very different value.

What separates them is whether they could be proven wrong. "It feels lobotomized" can't be wrong, so it can't be useful. "A hardcoded line in version X stops subagents from spawning" can be checked in five minutes by anyone with a terminal.

And the evidence is humbling. In one classic thread, ten people say the model is smarter today and ten say it's dumber. With opaque providers, as one engineer put it, it's all "guess games". Another said the likeliest culprit is a harness update or a tweak to the system prompt, not the weights.

So I'll ask a narrow question: what evidence lets you tell apart these four things?

1. The model changed (the weights or the serving stack moved).
2. The harness changed (the wrapper's prompt, tools or defaults moved).
3. The quota accounting changed (the meter moved).
4. Your workflow changed (you moved).

I'm leaving out quantization claims, silent routing and per-account A/B tests on purpose. You can't prove them from the user side. What you can prove is smaller, and more useful.

## Start at the bottom of the ladder

Treat it like debugging. Start with the cheapest, most likely cause, and only climb when the lower rung is ruled out.

| Rung | Suspect | Cheapest test |
|---|---|---|
| 1 | Your own change | Diff your config, instruction files, effort and model settings |
| 2 | Harness text | Diff the system prompt and config sections after each update |
| 3 | Documented model behavior | Read the vendor's release notes for changes to rewrites, verbosity and effort |
| 4 | Cache and session mechanics | Check idle gaps, resumes, model switches |
| 5 | Quota accounting | Compare tokens and API-equivalent dollars per 1% of allowance |
| 6 | The weights | Run a fixed set of tasks on pinned commits, over time |

Most people jump from "bad day" straight to rung 6. Almost every documented case was on rungs 2 to 5.

## The harness line that disabled subagents

A report that went around among heavy users of an agent CLI described a two-line instruction. It reportedly applied to only one model family and said, roughly: don't call the agent-spawning tool unless the user asked, and don't use workflows or deep research unless the user asked. It was said to be injected remotely at first, then compiled into the binary for two releases in a row. The poster found the section in the local JSON config where the setting lived, and a public issue had the binary analysis.

Here's why it deserves attention: the run still looks normal. The model doesn't crash. It either does the delegated work inline or quietly skips it. In the example given, a self-audit ran non-blind because the independent auditor couldn't be spawned. The model noticed, mentioned it, and let it slide. That defeats the whole point of an independent audit, and nothing in the output makes noise about it.

People confirmed it two ways. They asked the agent to read its own config file and explain how that section affects skills. And other users reported their reviewer and explorer subagents failing, one saying "Even if I contradict it in claude.md it doesn't work."

Not everyone could reproduce it. Some said the same model spawned subagents "like a champ", and one reader warned that the original post doubled as an ad for a paid product. So: plausible, partly reproduced, and useful either way.

The useful part is the wording. "Unless the user requested it" is a loophole, and you can test loopholes.

```text
# Narration (easy to ignore)
Step 3: This step is handled by an auditor agent.

# Imperative (hard to ignore)
Step 3: Delegate this to a subagent. Do not do it yourself.
```

You can also build a canary around it: a tiny prompt that asks the model to spawn a do-nothing subagent and report whether it could. Run it after every update. If it starts failing, you know the harness changed before any of your real work gets silently worse.

## Documented changes that cost tokens

Some "nerfs" are just the vendor telling you what changed, in release notes nobody read.

One newer model was documented as more likely to rewrite an entire file than make a targeted edit, to write denser prose, to stop and ask "Shall I apply this?" unless nudged, and to do more than asked: fix nearby code, add extra tests. Users who ran into those traits burned through a five-hour limit in 12 to 20 minutes.

Even then, people disagreed. One said "verbose" was the wrong word, since the output was denser, not longer. Another said full rewrites finally cured their "edit slop". Same behavior, opposite verdicts. That's what a trade-off looks like.

The next pattern is over-exploration. One user watching a session through a tracing tool saw 68 tool calls and about 50k tokens in a single turn, from a fresh session with a 2k-token instruction file and no extensions. A skeptic replied, fairly, that there are hundreds of complaint posts and almost nobody posts their `ccusage` output. "Show your ccusage" became a refrain for a reason.

The fan-out stories are the loudest. A new effort slider reportedly spawned 45 agents. A check for docs drift burned 1.8M tokens. A rate limit hit after 80 parallel agents. Ten subagents used up a whole five-hour window on one vulnerability audit. Part of this is documented: a top effort mode that scripts changes and spreads work across subagents.

A widely quoted vendor figure says multi-agent setups use roughly 15x the tokens of a single chat. The sensible reply: that trade is only fair for work that really parallelizes, like broad research or wide search. For a focused edit in a tangled module, it's a bill with no benefit.

## Quota accounting you can audit

The strongest data came from Codex users, and it was strong because it was boring.

One poster compared what 14% of an allowance bought before and after a "banked reset". Before: 5 hours 4 minutes, 738 responses, 114.41M input tokens (94.5% cached), 465.5k output. After: 2 hours 4 minutes, 489 responses, 63.60M input tokens (96.5% cached), 284.7k output. Their conclusion was that the reset gave about half the normal allowance.

What made it credible: the poster listed the confounders themselves. Model mix, effort levels, agent spawns, compaction events (10 versus 1), transport retries (10 versus 3). Others brought their own numbers and mostly agreed ("starting at 86%... down to 50% in 12 hours"). Others asked whether the test was properly controlled. Good. That's a conversation, not a vibe.

A tracker app claimed a weekly limit fell from about $160 to $80 in API-equivalent value after a reset. One reader cross-checked with a usage tool, saw roughly half, and planned to check the cache hit rate, because an earlier bad stretch had turned out to be a cache problem on the provider's side.

The counter-case matters just as much. A claim of "10-20x faster drain" pointed to a public issue with logs, and a skeptic posted a daily token table (hundreds of millions of tokens a day, 49 to 58% cache hits) and said they never hit a limit. Both can be true. How fast quota drains depends on cache state, the mix of tasks and the model.

The useful unit falls out of this: tokens and API-equivalent dollars per 1% of allowance, measured on identical task mixes, with the cache hit rate, model and effort recorded alongside.

## Drains that aren't nerfs

Some of the scariest stories need no villain at all.

- **Resuming rewrites the cache.** A five-agent session reportedly used up a fresh $100 plan in under two minutes. An engineer explained that resuming a session after switching plans writes the whole context into the cache again. Advice: checkpoint after each task, turn off auto-resume, and write a handoff doc before you hit the limit.
- **Cache expiry.** The claim is that the prompt cache lasts about an hour, so an idle gap means paying full price instead of roughly 10% for cached tokens. Check your provider's docs, since TTLs change.
- **Switching models mid-conversation.** Switching resends the whole conversation. That's exactly where one "85% savings from routing" claim got challenged.
- **Compaction hooks.** A hook that compacts tool output drew the question "will reduce cache hits and end up costing more?" Nobody answered. It's a measurable question nobody measured.

None of these are nerfs. All of them look like nerfs from the dashboard.

## Taking control of the harness

If the wrapper is a dependency, you're allowed to pin it, diff it and sometimes replace it.

One developer with 45 years in the industry recommended replacing the default system prompt with a wrapper script, starting from a community repo of extracted prompts. The replies corrected the details: the CLI flag reportedly replaces only the opening lines, full replacement needs the SDK, and a file-based flag is easier. Others asked whether it breaks the built-in tool handling. Unverified, so test before trusting it.

A gentler route is appending instead of replacing. One author built a behavior file by having a stronger model audit sessions from the newer model, then rerunning the same prompts on the older model from the same commits. They load it with an append-system-prompt-file flag plus a shell alias, and one engineer said the flag works better than the instruction file alone.

## Fewer hidden layers, less drift

Every case above was hard to diagnose because the thing that changed was hidden. A remotely injected line. A cache that behaves differently after a resume. A spawn count nobody asked for.

An agentic harness is a stack of moving parts you didn't choose: its prompt, its tools, how it explores, how it retries. Each one is a place for drift to hide.

The deterministic alternative shrinks that surface. You pick the exact files that go into the prompt, so context size is a number you can read before sending. You use your own key, so the meter is the provider's price sheet, not an opaque percentage. The model returns search/replace blocks and the change lands as a normal Git diff. If something regressed, you can diff it. If cost jumped, the per-request cost record tells you which request did it.

That's not an argument against agents. Prototyping a greenfield app with an autonomous loop is a fine use for one. But on a complicated codebase, fewer hidden variables means fewer arguments about quantization.

## Keep a drift log

Small enough that you'll actually keep it:

1. **Pick 3 to 5 representative tasks** and pin them to specific commits.
2. **Record for each run:** model, effort, harness version, input, output and cached tokens, wall time, tool calls, subagents, and the percentage of the window used.
3. **Keep a daily table** like the usage tables people post: tokens, cache hit rate, API-equivalent value, and the version number.
4. **Diff the harness** after each update: system prompt, config sections, new instructions.
5. **Run canaries** for anything that depends on subagents, hooks or tools.
6. **Cap fan-out** in your instructions, scope verification loops explicitly (unscoped browser-automation verification can torch a budget), and choose effort per task.
7. **Keep a second provider** and portable instruction files as a hedge.

One poster's day-by-day breakdown is a good template for where the tokens go: roughly 40% reading and scanning context, 25% scaffolding and tests, 20% formatting and renames, 15% hard reasoning. They concluded that routing cut a $200 plan to about $30 a month on the API. Replies asked how routing works when switching models resends the whole conversation, and whether $30 really beats a cheaper plan. Fair questions. Measure your own profile before copying anyone's.

## What providers could show us, and what we'll never know

What people keep asking for and not getting: per-prompt token estimates, a changelog for model-side changes, and notice when harness prompts change. A member of one vendor's team reportedly said a top plan isn't going away, yet resets, repeatedly extended boosts and shifting multipliers keep people guessing.

What stays unprovable: quantization, silent routing, per-account experiments. To be plain, nothing in these discussions proves either side. What's verified is harness text, documented behavior, and the usage tables users collected themselves.

A drift log is overkill for a weekend project. For a codebase with deadlines, an hour of setup beats a week of wondering whether the tool changed or you did. You can't pin the weights, but you can pin your inputs, your commits and your harness version, so when results shift you know which side moved. And yes, some nerf reports are confirmation bias. That's exactly why logs beat memory: the same bias runs both ways. Measure first, argue second.
