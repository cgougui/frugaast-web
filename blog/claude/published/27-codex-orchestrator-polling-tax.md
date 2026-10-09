Every 30 seconds: "Are the workers done?" No. Thirty seconds later: "Are the workers done?" No. In one measured session, about two thirds of everything a premium orchestrator read went into asking that question, while the cheap workers did the actual work for pennies.

Forget which model is smarter for a moment. When an expensive model supervises cheap ones, what's actually on the bill?

One measured case made the rounds among Codex users. A developer opened their own rollout telemetry after their quota bar drained strangely fast. The setup was textbook: a premium orchestrator with cheaper workers underneath. Every 30 seconds, the orchestrator woke up to ask one question: are the workers done?

The log was blunt. Dozens of consecutive checks, every one returning "no new worker state." Together they added up to several million input tokens on the parent, almost all of them cached. About two thirds of everything the parent read in that session went to polling. The five-hour bar slid from just over half to empty in about half an hour.

Compare that with a measured session of a cheap model working alone: more input tokens processed overall, over two hours, and the bar barely moved.

The task was cheap. The workers were cheap. The supervisor just never stopped checking.

## Why a "no change" check is expensive

A model has no memory between turns. Every wake-up loads the entire parent conversation as input again. Cached input is discounted, but discounted isn't free, and it still counts against the bar.

Picture a parent context of 150K tokens. Every check rereads all of it to produce a dozen tokens of output: "still running." Do that 120 times an hour and the math gets ugly without anyone doing anything wrong.

Other users confirmed the pattern:

- In one run, 19 short sleep calls made up 44% of the orchestrator's estimated cost.
- An orchestrator that polled made 41 responses while a worker ran (about $1.20 for that phase). The same job with a native wait primitive used one response (about $0.04). Both passed the same tests.
- A model watching a database script would "read the log, say still running, repeat." One engineer who analyzed their own sessions put 15 to 20 percent of their tokens on this pattern.

One engineer summed it up: "learned it the hard way with burning 1 B token."

Is it the model's fault or the harness's? People disagree. One says the harness re-polls background jobs instead of blocking. Another says a rival agent already waits on its workers, so this one "blatantly should" too. A third says it's all "cents" and suggests patching the open-source harness.

All three can be right. For a hobby project, it's cents. For a team running orchestrated sessions all day, cents times 40 sessions shows up in a budget review.

## Reviewing work that isn't finished

Polling isn't the only leak. Asked to list its own sources of waste, one planner model named another: rereading unfinished code and sending small corrections while the workers were still running.

The planner pays tokens to review work that isn't done, then sends a correction to a worker in the middle of its task. The worker rereads, and the planner reads the result again.

The fix is boring and effective: batch the reviews. Let the workers finish a whole package of work, then review once.

## Fix 1: make the wait longer than the poll

If the loop happens because the harness's wait times out too early, the cheapest fix is configuration. One reported in the investigation thread, which the original poster checked in their telemetry (the 30-second loop disappeared and the parent stayed asleep until a worker did something):

```toml
# ~/.codex/config.toml
[features.multi_agent_v2]
enabled = true
min_wait_timeout_ms = 1500000      # 25 min
default_wait_timeout_ms = 1500000
max_wait_timeout_ms = 1500000
```

Two details matter. One engineer noted you have to set both the minimum and the default, not just one. And key names change between releases, so check them against the version you actually run. Treat this as a reported example, not a spec.

The reasoning behind it was neat: keep the wait shorter than the prompt-cache lifetime, roughly 30 minutes according to one engineer, so the parent isn't woken for nothing, but the cache is still alive when it does wake.

The counterpoint is a good one. If the parent sleeps for 10 minutes and the cache expires, the next turn rereads the whole conversation plus the worker's result as uncached input. That's full price. Maybe the 30-second checks were keeping the cache warm, and the "waste" was paying for a warm cache.

Nobody in the discussion measured the net effect end to end. And the cache lifetime itself is disputed: one user claimed it's now only 3 to 5 minutes and that subagents can reset cache hits, which clashes with the 25 to 30 minute figure. Neither claim is verified.

So: a longer timeout probably helps. How much depends on a number the vendor controls and may change. Measure before and after.

## Fix 2: take the model out of the waiting

You can put this in a prompt: "Avoid repeated polling. Use completion notifications if available. Report what is running and where results will land, say you are stopping polling, and end the turn. When the user returns, check once."

Sometimes it works. It's also fragile. One engineer put the same instruction in the project's agent rules file and said the model "would happily ignore them since the System Prompt takes higher priority." Another warned about the opposite failure: a stuck process can then sit unnoticed for hours.

The sturdier fix is structural. Make waiting the job of something that costs nothing: a script.

One engineer pointed to a `codex queue` command, reportedly added in a recent CLI release, for sending messages to existing local or remote sessions. The idea is to start a watcher that waits for the task to finish and then wakes the chat model. In between, the parent is idle and the meter is flat. (One user added that the planner "doesn't know how to use it" on its own, so you have to wrap it in a skill.)

A sketch of how that could look (mine, not from the discussion):

1. The worker writes a marker file when it finishes, like `done/task-17.ok`.
2. A small shell loop waits for that file with a timeout, using no model calls at all.
3. When the file appears, the script sends one message to the parent session through the queue command.
4. The parent wakes once, with a short, specific message, and reviews the finished work.

Compare the worst cases. A model that polls and fails runs a runaway loop. A watcher that fails costs, in one engineer's words, "a cache hit," not a bill. That asymmetry is the whole argument for watchers over polling.

## Workers inherit everything

Even with a perfect wait, the workers have a cost. Several users reported that subagents inherit the parent's entire context. One person asked how to force a fresh, hand-written context after "they destroyed my quota." Another said the context counter only shows the parent, while several full-context subagents spin up behind the scenes, even on a low reasoning setting.

If a worker needs to rename a function in one file and starts out carrying 150K tokens of planning history, the "cheap" model isn't cheap anymore. It's reading the planner's diary.

## Is orchestration worth it at all?

Orchestration has real fans, and some of their results are good.

- One published workflow skips subagents by default for small tasks, has the manager read docs and critical code, sends dependency questions to an explorer, and hands implementation to a cheaper model in small packages with scope, context and expected output. People who copied it pinned worker reasoning to medium and wrote tiny single-purpose prompts. One built a skill that routes parts of a job to different tiers and said it "lowered my usage significantly."
- A cheap model ran for over seven hours straight from a stronger model's handoff, using a few percent of a high-tier plan. The same discussion added: not for large existing codebases.
- Another user had the premium model write implementation docs and a mid-tier one implement them, and got about three days of use across three parallel projects, while the premium model alone "drained way too fast no matter what thinking."

And the other side:

- A supervisor that keeps correcting a worker's mistakes "can wipe out a lot of the cost savings." One engineer went further: no savings at all, and subagents only help with parallel grunt work.
- A user who followed the plan-big, implement-cheap advice lost another 10% of their allowance on a simple UI task.
- Another said their orchestrated setup "uses 3x the tokens" of just using the premium model.

Both camps have receipts. What separates them isn't taste. It's three conditions:

1. The supervisor stays idle while the workers run.
2. Workers get minimal context, not the whole history.
3. Worker output passes review the first time.

Miss any one and the savings disappear. That's a demanding list for something sold as a default.

## What the usage bar hides

The deeper problem is that people argue from a bar that shows one number.

One analysis of several gigabytes of session logs found the median tokens per call rising with each model generation (roughly 86K to 138K), cache rates of 94 to 97 percent, and only a couple of hundred output tokens per call. The author's point: look at calls per task and behavior, not the price tag. A newer model that does more "fumbling around" before acting can cost more without a higher price.

Another user tracked the API-equivalent weekly limit of a $100 plan and reported it sliding about 11% over ten days. A reply from the vendor's side said limits hadn't changed and blamed faster drain on cache misses, switching models or effort mid-task, and bloated sessions. Both are claims.

One oddity: a report that the highest effort level used less than low or medium. Theories ranged from "low is eager and makes more tool calls" to the cache being lost when effort changes. No consensus. Test it.

And then there are plain loops. One user described a model circling the same code for 12 hours and taking a weekly allowance from full to zero. Their fix was a second chat that audited the first every 15 minutes. A second agent polling the first: the polling tax, recursively.

Not every complaint is a real regression. Some people blame bloated projects, piles of plugins and vague prompts ("people complaining about being nerfed are nerfing it themselves"). Fair. The way to settle it is to read the logs, because accounting bugs in these harnesses have happened before: a compaction cache-hit bug and a token undercount were both fixed in the past.

## Or choose the context and timing yourself

All of these fixes have something in common. Each one tries to rebuild control the harness took away: wait times, context size, who reads what, when review happens.

An agentless workflow gets those by construction.

- **Context is a choice, not an inheritance.** You pick the exact files for a request. No worker starts with someone else's 150K-token history, because there's no history, just a short prompt and the files you chose.
- **Nothing wakes up on a timer.** There's no supervisor to poll, so nothing rereads context to say "still running." Every request is one deliberate call.
- **The bill is per request.** With your own API key, each call has a visible cost. You can total a day, compare two approaches, and know whether a change helped. No usage bar needed.
- **Review happens once, on a diff.** Search/replace edits land as normal Git diffs. A human reads the diff, then commits or reverts. No planner reviewing half-finished work.

That doesn't make autonomous agents useless. Greenfield prototypes and genuinely parallel, independent chores are where orchestration shines. But in a complex existing codebase, where context discipline is everything, a person choosing the files beats a model supervising a model.

## Before adding subagents

| Step | What to do | What it tells you |
|---|---|---|
| Baseline | Run the same task with a single model; record tokens and the % of the weekly bar | Whether orchestration saves anything |
| Count | Tally parent responses while workers run, using rollout logs or a usage tool | Hidden polling |
| Tune | Set wait timeouts above the poll interval you observed and below the cache lifetime you believe applies; measure again | The net effect of long waits |
| Replace | Use completion callbacks (queue or watcher) for scripts and workers | Waiting that costs nothing |
| Scope | Small work packages, minimal inherited context, worker reasoning pinned to medium | Cheaper workers |
| Batch | Review once per finished package | Fewer correction rounds |
| Report | Attach the session when you find a pattern | Faster harness fixes |

For one session, this really is a few cents. Multiply it by every orchestrated session on a team, every day, and it's the difference between a plan that lasts the week and one that doesn't. The bigger point is that nobody noticed until they read the logs. Manual workflows do give up speed on tasks that are truly parallel and independent. But inside one tangled codebase, the time saved often gets spent again on review and cleanup, so time it with a stopwatch before deciding.
