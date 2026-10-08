# The Orchestrator Polling Tax: Why Your Expensive Planner Burns Quota Waiting for Cheap Workers

"Plan with the big model, implement with the cheap one" sounds like free money. Measured session logs say the supervisor often spends more on checking in than the workers spend on working.

> I wired up a premium planner and three cheap workers, went for lunch, and came back to a usage bar that had fallen off a cliff. The workers had done the work for pennies; the planner had spent the whole hour asking whether they were finished yet.

## Read the invoice, not the brochure

This article takes one lens: the itemized bill. Forget which model is smarter. Ask a duller question. When an expensive model supervises cheap ones, which line items does the invoice actually contain?

Here is a measured case that made the rounds among Codex users. A developer opened their own rollout telemetry after a quota bar drained strangely fast. The setup was textbook: a premium orchestrator, cheaper workers underneath. The orchestrator woke up every 30 seconds to ask a single question. "Are the workers done?"

The log was blunt. Dozens of consecutive checks, every one of them returning "no new worker state." Together they accounted for several million input tokens on the parent, and almost all of those were cached tokens. Roughly two thirds of everything the parent had read in that session went to polling. The five-hour bar slid from just over half to empty in about half an hour.

Compare that with a measured session of a cheap model working alone: more input tokens processed overall, over two hours, and the bar barely moved.

So the task was cheap. The workers were cheap. The supervisor was not idle.

## Line item one: the wake-up

Why is a "no change" poll expensive? Because a model has no memory between turns. Each wake-up loads the entire parent conversation as input again. Cached input is discounted, yes. But discounted is not free, and it is still counted against the bar.

Picture a parent context of 150K tokens. Every poll re-reads all of it to produce a dozen tokens of output: "still running." Do that 120 times an hour and the arithmetic gets ugly without anyone doing anything wrong.

Other users confirmed the pattern:

- In one run, 19 short sleep calls made up 44% of the orchestrator's estimated cost.
- An orchestrator that polled made 41 responses while a worker ran (about $1.20 for that phase). The same job with a native wait primitive used one response (about $0.04). Both passed the same tests.
- A model watching a database script would "read the log, say still running, repeat." One engineer who analysed their own sessions put 15 to 20 percent of tokens on this pattern.

One engineer summed up their experience with "learned it the hard way with burning 1 B token."

Is it the model's fault, or the harness's? Experienced developers disagree. One says the harness re-polls background jobs instead of blocking. Another says a rival agent already waits on workers, so this one "blatantly should" too. A third calls the whole thing "cents" and says to patch the open source harness.

All three can be right. For a hobby project it is cents. For a team that runs orchestrated sessions all day, cents multiplied by 40 sessions is a line on a budget review.

## Line item two: the review loop

Polling is not the only leak. When asked to list its own sources of waste, one planner model named a second one: re-reading unfinished code and sending small corrections while executors were still running.

Think about it. The planner pays tokens to review work that is not done, then sends a correction to a worker who is mid-task. The worker re-reads, the planner reads the result again.

The suggested remedy is boring and effective: batch the reviews. Let the workers finish a whole work package. Review once.

## Fix A: make the wait longer than the poll

If the loop is the harness's wait primitive timing out too early, the cheapest fix is configuration. A configuration reported in the investigation thread, which the original poster verified in their rollout telemetry (the 30-second loop disappeared and the parent stayed asleep until worker activity), looked like this:

```toml
# ~/.codex/config.toml
[features.multi_agent_v2]
enabled = true
min_wait_timeout_ms = 1500000      # 25 min
default_wait_timeout_ms = 1500000
max_wait_timeout_ms = 1500000
```

Two details matter. First, one engineer noted that you must set the minimum and the default, not only one of them. Second, key names change between releases, so check them against the version you actually run. Treat the block above as a reported example, not a spec.

The design reasoning was neat: keep the wait shorter than the prompt-cache lifetime, roughly 30 minutes according to one engineer, so the parent is not woken needlessly but the cache has not died when it does wake.

Now the counterpoint, because it is a good one. If the parent sleeps for 10 minutes and the cache expires, the next turn re-reads the whole conversation plus the worker's result as uncached input. That is the full price, not the discounted one. Maybe the 30-second polls were keeping the cache warm, and the "waste" was a warm-cache subscription.

Nobody in the discussion measured the net effect end to end. And the cache lifetime itself is disputed: one user claimed it is now only 3 to 5 minutes and that subagents can reset cache hits, which clashes with the 25 to 30 minute figure. Both claims are unverified.

So the honest position is this. A longer timeout probably helps. How much depends on a number the vendor controls and may change. Measure before and after.

## Fix B: take the model out of the waiting business

A prompt can say: "Avoid repeated polling. Use completion notifications if available. Report what is running and where results will land, say you are stopping polling, and end the turn. When the user returns, check once."

It sometimes works. It is also fragile. One engineer tried the same instruction in the project's agent-rules file and said the model "would happily ignore them since the System Prompt takes higher priority." Another warned the opposite failure: a stuck process can then sit unnoticed for hours.

The sturdier approach is structural. Make waiting a job for something that costs nothing: a script.

A engineer cited a `codex queue` command, reportedly added in a recent CLI release, for sending messages to existing local or remote sessions. The idea is to spawn a watcher that listens for the task to finish and then wakes the chat model. Between those two moments, the parent is idle and the meter is flat. (One user added that the planner "doesn't know how to use it" on its own, so it needs wrapping in a skill.)

An illustrative sketch, not taken from the discussion:

1. The worker writes a marker file when it finishes, for example `done/task-17.ok`.
2. A small shell loop blocks on that file with a timeout, using no model calls at all.
3. When the file appears, the script sends one message to the parent session through the queue command.
4. The parent wakes once, with a short, specific message, and reviews the finished package.

Compare worst cases. A model that polls and fails runs a runaway loop. A watcher that fails costs, in one engineer's words, "a cache hit," not a bill. That asymmetry is the whole argument for monitors over polling.

## Line item three: the context everyone inherits

Even with a perfect wait, the workers have a price. Several users reported that subagents inherit the parent's whole context. One person asked how to force a fresh, hand-written context after "they destroyed my quota." Another said the context counter shows only the parent, while several full-context subagents spin up behind the scenes even on a low reasoning setting.

If a worker needs to rename a function in one file and starts life carrying 150K tokens of planning history, the "cheap" model is no longer cheap. It is reading the planner's diary.

## Is orchestration worth it at all?

Credit where it is due. Orchestration has real fans, and some of their results are good.

- One published workflow uses a light route by default (no subagents for small tasks), has the manager read docs and critical code, sends dependency questions to an explorer, and hands implementation to a cheaper model in small packages with scope, context and expected output. People who copied it pinned worker reasoning to medium and wrote tiny single-purpose prompts. One built a skill that routes parts of a job to different tiers and said it "lowered my usage significantly."
- A cheap model ran for over seven hours uninterrupted from a stronger model's handoff, using a few percent of a high-tier plan. Caveats from the same discussion: not for large existing codebases.
- Another user had the premium model write implementation docs and a mid-tier one implement, and got about three days of use across three parallel projects, while the premium model alone "drained way too fast no matter what thinking."

Now the other side.

- A supervisor that keeps correcting a worker's mistakes "can wipe out a lot of the cost savings." One engineer went further: no savings at all, subagents only help with parallel dumb work.
- A user who followed the plan-big, implement-cheap advice lost another 10% of their allowance on a simple UI task.
- Another said their orchestrated setup "uses 3x the tokens" of using the premium model directly.

Both camps have receipts. What separates them is not taste. It is three conditions:

1. The supervisor is idle while workers run.
2. Workers get minimal context, not the whole history.
3. Worker output passes review the first time.

Miss any one and the savings evaporate. That is a surprisingly demanding list for something sold as a default.

## What the usage bar hides

The deeper problem is that people argue from a bar that shows one number. Compare the evidence habits.

One analysis of several gigabytes of session logs found median tokens per call rising with each model generation (roughly 86K to 138K), cache rates of 94 to 97 percent, and only a couple of hundred output tokens per call. The author's point: look at calls per task and behaviour, not the sticker. A newer model that does more "fumbling around" before acting can cost more without being priced higher.

Another user tracked the API-equivalent weekly limit of a $100 plan and reported it sliding about 11% over ten days. A reply from the vendor side said limits had not changed and blamed faster drain on cache misses, switching model or effort mid-task, and bloated sessions. Take both as claims.

One more oddity: a report that the highest effort level consumed less than low or medium. Hypotheses ranged from "low is eager and makes more tool calls" to cache loss on effort changes. No consensus. Test it.

Then there are plain loops. One user described a model circling the same code for 12 hours and taking a weekly allowance from full to zero. Their fix was a second chat auditing the first every 15 minutes. A second agent polling the first: the polling tax, recursively.

None of this means all complaints are real regressions. Some blame bloated projects, piles of plugins and vague prompts ("people complaining about being nerfed are nerfing it themselves"). Fair. The way to settle it is to read the logs, because accounting bugs in these harnesses have been real before: a compaction cache-hit bug and a token undercount were both fixed in the past.

## The deterministic alternative

Notice what all of these fixes have in common. Every one is an attempt to rebuild control that the harness took away: wait times, context size, who reads what, when review happens.

An agentless workflow gets those properties by construction.

- **Context is a choice, not an inheritance.** The developer picks the exact files for a request. No worker ever starts with a stranger's 150K-token history, because there is no history. There is a short prompt and the files you selected.
- **Nothing wakes up on a timer.** There is no supervisor to poll, so nothing re-reads context to say "still running." Every request is one deliberate call.
- **The bill is per request.** With your own API key, each call has a visible cost. You can total a day, compare two approaches, and know whether a change helped. No usage bar needed.
- **Review happens once, on a diff.** Search/replace edits land as normal Git diffs. A human reads the diff, commits or reverts. No planner reviewing half-finished work.

None of this makes autonomous agents useless. Greenfield prototypes and genuinely parallel, independent chores are where orchestration shines. But for a complex existing codebase, where context discipline is the whole game, a person choosing the files beats a model supervising a model.

## Checklist before adding subagents

| Step | What to do | What it tells you |
|---|---|---|
| Baseline | Run the same task with a single model; record tokens and percent of the weekly bar | Whether orchestration saves anything |
| Count | Tally parent responses while workers run, using rollout logs or a usage tool | Hidden polling |
| Tune | Set wait timeouts above the observed poll interval and below the cache lifetime you believe applies; re-measure | Net effect of long waits |
| Replace | Use completion callbacks (queue or watcher) for scripts and workers | Zero-cost waiting |
| Scope | Small work packages, minimal inherited context, worker reasoning pinned to medium | Cheaper workers |
| Batch | Review once per finished package | Fewer correction rounds |
| Report | Attach the session when you find a pattern | Faster harness fixes |

## FAQ

**Isn't this just a few cents? Why does it matter?**
For one session, yes. Multiply it by every orchestrated session on a team, every day, and it becomes the difference between a plan that lasts the week and one that does not. The more important point is that nobody saw it until they read the logs.

**If a longer timeout can expire the cache, aren't you trading one cost for another?**
Possibly, and nobody has measured the net effect end to end. That is the reason to compare before and after on your own workload rather than trust a rule of thumb.

**Do manual workflows give up real speed compared to parallel agents?**
They do, for tasks that really are parallel and independent. But for work inside one tangled codebase, the time saved is often spent again on review and cleanup, so the comparison deserves a stopwatch.

**Can't a well-written prompt stop the polling?**
Sometimes. Engineers report that models still ignore such instructions because the system prompt outranks them, so a structural fix is more dependable than politeness.

## Key Takeaways

- A cheap worker supervised by an expensive planner pays for every wake-up, because each poll re-reads the whole parent context.
- Orchestration only wins when the supervisor sleeps, workers get minimal context, and output passes review the first time.
- Measure from session logs and per-request cost, not from a usage bar, and prefer designs where context and timing are chosen by you.

*A system you cannot itemize is a system you cannot economize.*
