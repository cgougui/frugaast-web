# Switch Triggers and Switching Costs: Why Developers Keep Changing Coding Agents and What They Carry With Them

Developers change coding agents every few weeks, and the reasons are rarely the ones in the benchmark threads. This piece sorts the real triggers from the noise and lists the few artifacts that decide whether a switch costs an afternoon or a month.

> I switched my main coding tool four times in one year, and each time I moved back about six weeks later. It took me an embarrassing while to notice that I had never been complaining about the same thing twice.

## The lens: a tool is a dependency

Engineers already know how to think about a risky dependency. You ask who maintains it, what happens if the maintainer vanishes, how much of your code touches its API, and how hard it is to rip out.

A coding agent deserves the same audit. It is a dependency with a bus factor, a pricing page that can change overnight, a release cadence you do not control, and a model behind it that gets swapped without a changelog. So this article does not ask which tool is best. It asks two duller and more useful questions.

What makes people switch?

And what do they have to carry with them when they do?

## Four switches, one real lesson

Go back to the developer who moved four times. They read a benchmark thread, moved everything to the new leader, and drifted back about six weeks later. Then they wrote down what they actually disliked.

On one tool: cost, and an overconfident refactor that touched nine files when three would do. On the other: slowness, and a habit of doing exactly what was asked and nothing more. Two different tools, each good at a different thing. Not one question with two answers.

There is a sensible counter-position. An experienced developer with five years behind them uses one editor-based agent, reads every line, keeps no instruction files, and tried two alternatives once before going back. Replies were pragmatic: "do what works for you", spend a couple of hours every couple of months trying the latest, and remember that the pace of development is close between all the best tools. Every new thing costs time, and you can sit tight until the next major model.

Both camps are right about something. The question is what should trigger a move.

## The triggers people actually name

| Trigger | What it looks like | What people did |
|---|---|---|
| Quota exhausted early | A $20 plan gone in a few days, mostly on the cheap auto mode | Tried a slower editor agent with some unlimited models, a credit-multiplier plan, or a bring-your-own-key extension |
| Refusal | An agent declined a scraping task that another handled without a warning | Switched tools, then noticed the reputations had flipped since last year |
| New model behaves differently | A release that is "far too aggressive in making changes" on a large refactor | Reverted within a day, or kept it because they wanted the bolder style |
| Variant confusion | The "codex" flavor of a model vs its base model | Opinions split, with some saying the variant "gives up" on long tasks |
| Vendor change | A popular extension sunsetting, a new platform fee, a tool going unmaintained | Pinned an old version, or moved to a fork |
| Honeymoon decay | "The more you use, the more mistakes you notice" | Nothing; the tool had not changed, the novelty had |

A few of these deserve a closer look.

**Quota.** This is the most common trigger and it belongs mostly to economics, so it gets one line here. The only point that matters for switching is that it arrives mid-week, mid-task, and never when you planned it.

**Refusal.** Whether an agent will do something is a property of the tool and the model, and it changes between releases. It appears on no comparison chart. Sympathy for the example also depends on what the scraping is for, which is exactly the point: you only learn a tool's boundaries by hitting them.

**Temperament.** After one release, a developer refactoring an enterprise codebase found the new model rewrote too much and reverted after a day. Others reported the opposite: it refused to implement and proposed splitting everything into sub-steps. One user in "yolo mode" with frequent backups wanted the boldness. "The model got worse" and "the model's temperament no longer matches the workflow" are different complaints. The second is a legitimate reason to pin a version or move.

**Vendor change.** The sharpest version is a tool announcing it will shut down or pivot, with comments like "beyond saturated". A pricing change that halves free credits and adds a platform fee is a quieter version. An unmaintained tool that survives only as a fork is the slow version. And a remark from a spec-driven tool's thread says it best: it seems like a very low moat if a new coding agent appears every two weeks.

**Honeymoon.** The most underrated trigger is the absence of one. Part of the six-week cycle is simply the novelty wearing off. Before switching, ask whether anything actually changed. If not, pin the old setup for a week and see whether the itch survives.

## IDE agents, CLI agents and the fit questions

Some of the churn is not about quality at all. It is about fit.

Developers leaving one editor-first tool for an agent inside a general editor describe it as feeling much the same, only slower, because, as one developer put it, reading the output takes time anyway. That is a revealing remark: a slower tool can be a feature if you read everything.

People who find a terminal agent "a mess, with no idea what it was doing" are often reporting a UX gap, not a model gap. Meanwhile some say most of the better clients are command-line ones. Both are true for different people.

Autocomplete is a separate axis. Inline completion and agentic work are different jobs, and plenty of developers use one tool for the first and another for the second. Even the same model behaves differently in different harnesses. In one comparison, developers reported that an editor-integrated agent burned a third to half the tokens of a terminal one on a medium task, but the terminal output was "usually much better". Maybe the editor tool compresses prompts, which "also affects the output". Maybe not. These are anecdotes, and comparing a subscription to a metered API is never apples to apples.

## What it costs to switch: the lock-in ledger

Now the part that decides how expensive a move is. Think of it as a ledger with a row per lock-in surface.

1. **Instruction files.** One tool reads `AGENTS.md`, another `CLAUDE.md`, another its own file. The common advice: keep `AGENTS.md` as the source and give the others a thin pointer, until a standard settles. Portability: high, if you keep it short.
2. **Skills.** Sync tools exist to export one tool's skills into a format others can read. The objection is that without intent detection, skills "become just prompts". The format is converging; the loading behavior is not.
3. **Memory and handoff.** Everyone eventually builds a cross-tool memory, or hand-copies a `HANDOFF.md` from a brainstorming chat into the agent. Portability depends on whether the state lives in your repo or in a vendor's chat.
4. **Session history.** The first thing that breaks when running two tools is finding what you did last week. Each tool stores sessions separately and shows only the recent ones.
5. **Integrations.** Tool servers speaking the open protocol (browser testing, search) are the most portable piece. Harness behavior is the least: a parallel-call change in an update can alter how your workflow runs.
6. **Billing terms.** Limits change "with zero transparency". Some heavy users never hit a ceiling on a pricey plan, while others hit it constantly. The only advice that holds up is the plainest one: you can always just try it first.
7. **Subscription sprawl.** Monthly budgets range from a $20 stack of two small plans plus a local model, to $400 spread over several seats, to a developer who "loses track" across about eight subscriptions. Switching has a bookkeeping cost.

There is also a counter-case worth respecting. A minimal tool with a tiny system prompt and a small context footprint teaches you how agents work, because you can read all of its code. The cost of leaving it is losing that leverage. (The token numbers in that discussion were not measured, so take them as claims.)

## Not choosing: roles instead of winners

The largest cluster of reports belongs to people who stopped looking for a winner and assigned jobs.

- **Plan versus implement.** One model plans and reviews, another implements. The planner can be slow and expensive "because it only writes a document". The implementer once quietly re-wrote a helper that already existed two folders away, and the planner caught it in review.
- **The reverse split.** Another developer uses a chat model as the long-term context holder and first reviewer, and a coding agent as a "yes man" executor. The opposite assignment, reported with equal confidence. No data picks between them.
- **Write versus review.** One model writes, the other reviews with permission to run the code and try simple mutation testing. In that case the reviewer found a test that never exercised product code, two dozen placeholders without real tests, and a negative gate test that hit a helper instead of the real path. The roles could probably be swapped. What mattered was that the reviewer was a different model.
- **Cheap model, premium harness.** The model layer and the harness can be decoupled, so changing the model does not require changing the tool. One person running two side by side thought the "better" one was placebo.

A useful addition is to turn the plan into a checked artifact. A sketch:

```
PLAN.md
- files and symbols to reuse
- forbidden scope (do not touch)
- acceptance tests
- open assumptions
- rule: search the repo before adding any helper
Return: test command output + `git diff --stat`
```

The trade-off is plain. Two tools double the configuration surface and the review burden. Advocates say the second model catches shared-assumption errors; the evidence is anecdotal, and one account warns against two implementers because the code would be "expensive to reconcile".

## Deciding on your own work, not on leaderboards

Benchmarks are distrusted for good reasons. People call them "some of the most useless and gamed things", and one developer who tried a model right after its impressive scores "realized that it was far behind". A single cheap personal probe can be more telling: a git question about whether a commit survives a squashed merge, failed by most models tried, passed by a few.

A more careful method came from a critique of a comparison on fifty real pull requests. If the repositories are public, a model with a later training cutoff may have seen the bug and its fix. Record each PR's merge date and split results by it.

A personal recipe built from this:

1. Keep five to ten real tasks with known good outcomes.
2. Run each in both tools at the same reasoning level.
3. Record time, diff size, number of corrections, and tokens.
4. Repeat after each major model update.

The "same reasoning level" step is the one most people skip, and it can swing results more than the choice of tool.

Speed deserves its own paragraph. Rapid iteration is genuinely valuable for UI work. But "if the model makes a mistake" and a human has to intervene, "any speed advantage is likely gone". Decide which axis you are actually optimizing.

## The paradigm: make the dependency thin

If a tool is a dependency, the engineering answer is to minimize the surface it touches. This is where deterministic, agentless workflows pull ahead on switching costs.

Look at the ledger again. Most of its rows exist because the agent owns state: its own session history, its own memory, its own skill format, its own long-running harness. A workflow where the developer selects exact files by hand and sends a bounded prompt owns none of that. The context is whatever you picked. The result comes back as search/replace blocks. The change lands as an ordinary Git diff.

What do you carry to the next tool? Your repository. That is all of it.

Add bring-your-own-key access and the billing rows shrink too. The model layer is a setting, not a subscription, so a model change is not a tool change. Costs show up per call, which means a trial of another model is a measurable experiment, not a leap of faith into someone's rate-limit policy.

This does not make autonomous agents wrong. For a greenfield prototype or a long, boring migration, handing over the wheel is a sensible trade, and the lock-in is a price worth paying. But for a complex, long-lived codebase, a thin and swappable dependency beats a thick and clever one. Every time.

## The switch checklist

- **Name the trigger.** Quota, refusal, model behavior, vendor change, or boredom. If it is the honeymoon effect, pin the old setup for a week.
- **Keep the portable parts portable.** Instructions in `AGENTS.md` with thin pointers, handoff notes in files and never in a vendor chat, integrations over the open protocol.
- **Run the five-task trial** at matched reasoning levels.
- **If running two tools, give them roles** and a checked plan, and let the reviewer run the code.
- **Track subscriptions and limits in one place.**
- **Prefer a swappable model layer** over a bundled one.
- **Reassess on a schedule**, the "couple of hours every couple of months" rule, not on every release thread.

## FAQ

**If tools are converging anyway, why bother planning for a switch?**
Because convergence is partial: instruction files are close, but loading rules, limits and refusals still differ. A cheap switch plan costs little and pays off the day a pricing page changes.

**Isn't staying on one tool for months just falling behind?**
Sometimes, but the pace between the best tools is close, and every switch has a real cost in time and re-learning. A scheduled reassessment captures most of the upside.

**Do role splits across two tools really beat one strong model?**
Nobody has shown it on matched tasks; the evidence is anecdotal. The plausible gain is catching shared-assumption mistakes, at the price of double configuration and more review.

**Can a manual, file-by-file workflow really keep up with autonomous tools?**
For exploratory or sprawling work, no, it will feel slower. For targeted changes in a codebase that matters, the extra seconds of selecting files are repaid in smaller diffs and fewer surprises.

## Key Takeaways

- People switch on concrete triggers (quota, refusal, model temperament, vendor change, novelty fatigue), and naming the trigger first prevents most unnecessary moves.
- Switching cost lives in a short list of artifacts: instruction files, skills, memory, session history, integrations, billing terms. Keep them in your repo and in open formats.
- The thinner the tool's footprint (hand-picked context, Git diffs, a swappable model key), the less any switch can cost.

*Choose tools the way you choose libraries: assume they will leave, and keep your own code ready for the day they do.*
