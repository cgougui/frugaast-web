Each time, I moved back about six weeks later. It took me an embarrassingly long time to notice that I had never complained about the same thing twice.

The pattern went like this. I'd read a benchmark thread, move everything to the new leader, and drift back a few weeks later. When I finally wrote down what I actually disliked, it looked like this. On one tool: cost, and an overconfident refactor that touched nine files when three would do. On the other: slowness, and a habit of doing exactly what was asked and nothing more. Two tools, each good at something different. Not one question with two answers.

Engineers already know how to think about a risky dependency. Who maintains it, what happens if the maintainer disappears, how much of your code touches its API, how hard is it to rip out? A coding agent deserves the same audit. It has a bus factor, a pricing page that can change overnight, a release schedule you don't control, and a model behind it that gets swapped without a changelog. So instead of asking which tool is best, I now ask two duller questions. What makes people switch? And what do they have to carry with them when they do?

There's a sensible opposite position. One developer with five years of experience uses one editor-based agent, reads every line, keeps no instruction files, and tried two alternatives once before going back. The replies were pragmatic: "do what works for you", spend a couple of hours every couple of months trying the latest thing, and remember that the best tools are close to each other. Every new thing costs time, and you can sit tight until the next major model.

Both camps are right about something. The real question is what should trigger a move.

## What people actually switch for

| Trigger | What it looks like | What people did |
|---|---|---|
| Quota used up early | A $20 plan gone in a few days, mostly on the cheap auto mode | Tried a slower editor agent with some unlimited models, a credit-multiplier plan, or a bring-your-own-key extension |
| Refusal | An agent refused a scraping task another tool did without a warning | Switched, then noticed the two tools' reputations had flipped since last year |
| New model behaves differently | A release "far too aggressive in making changes" on a large refactor | Reverted within a day, or kept it because they liked the bolder style |
| Variant confusion | The "codex" flavor of a model versus the base model | Opinions split; some say the variant "gives up" on long tasks |
| Vendor change | A popular extension shutting down, a new platform fee, a tool going unmaintained | Pinned an old version, or moved to a fork |
| The honeymoon ends | "The more you use, the more mistakes you notice" | Nothing; the tool hadn't changed, the novelty had |

A few deserve a closer look.

**Quota.** The most common trigger. For switching, the only thing that matters is that it hits mid-week, mid-task, and never when you planned for it.

**Refusal.** Whether an agent will do something depends on the tool and the model, and it changes between releases. It doesn't appear on any comparison chart. How sympathetic you are to the example depends on what the scraping is for, which is the point: you only find a tool's boundaries by hitting them.

**Temperament.** After one release, a developer refactoring an enterprise codebase found the new model rewrote too much, and reverted after a day. Others reported the opposite: it refused to implement and proposed splitting everything into substeps. One user running in "yolo mode" with frequent backups wanted the boldness. "The model got worse" and "the model's temperament no longer fits my workflow" are different complaints. The second is a legitimate reason to pin a version or move.

**Vendor change.** The sharpest version is a tool announcing it will shut down or pivot, with comments like "beyond saturated". A pricing change that halves free credits and adds a platform fee is the quieter version. An unmaintained tool surviving only as a fork is the slow version. A comment in a spec-driven tool's thread summed it up: it seems like a very low moat if a new coding agent appears every two weeks.

**The honeymoon.** The most underrated trigger is no trigger at all. Part of my six-week cycle was just novelty wearing off. Before switching, ask whether anything actually changed. If not, go back to the old setup for a week and see whether the itch survives.

## IDE agents, CLI agents and fit

Some of the churn isn't about quality at all. It's about fit.

Developers who left one editor-first tool for an agent inside a general editor say it feels much the same, only slower, because, as one put it, reading the output takes time anyway. That's revealing: a slower tool can be a feature if you read everything.

People who find a terminal agent "a mess, with no idea what it was doing" are often describing a UX gap, not a model gap. Meanwhile, some say most of the better clients run on the command line. Both are true, for different people.

Autocomplete is a separate axis. Inline completion and agentic work are different jobs, and plenty of developers use one tool for each. Even the same model behaves differently in different harnesses. In one comparison, developers said an editor-integrated agent used a third to half the tokens of a terminal one on a medium task, but the terminal output was "usually much better". Maybe the editor tool compresses prompts, which "also affects the output". Maybe not. These are anecdotes, and comparing a subscription with a metered API is never apples to apples.

## What a switch costs

Here's what decides how expensive a move is, one lock-in point at a time.

1. **Instruction files.** One tool reads `AGENTS.md`, another `CLAUDE.md`, another its own file. The usual advice: keep `AGENTS.md` as the source and give the others a thin pointer until a standard settles. Very portable, if you keep it short.
2. **Skills.** Sync tools exist to export one tool's skills into a format others can read. The objection is that without intent detection, skills "become just prompts". The format is converging; how skills get loaded isn't.
3. **Memory and handoff.** Everyone eventually builds a cross-tool memory, or copies a `HANDOFF.md` by hand from a brainstorming chat into the agent. How portable it is depends on whether the state lives in your repo or in a vendor's chat.
4. **Session history.** The first thing that breaks when you run two tools is finding what you did last week. Each tool stores sessions separately and only shows the recent ones.
5. **Integrations.** Tool servers that speak the open protocol (browser testing, search) are the most portable piece. Harness behavior is the least: a change to parallel calls in one update can change how your workflow runs.
6. **Billing terms.** Limits change "with zero transparency". Some heavy users never hit a ceiling on a pricey plan; others hit it constantly. The only advice that holds up is the plainest: you can always just try it first.
7. **Subscription sprawl.** Monthly budgets range from a $20 combination of two small plans plus a local model, to $400 across several seats, to one developer who "loses track" across about eight subscriptions. Switching has a bookkeeping cost.

There's a counter-case worth respecting. A minimal tool with a tiny system prompt and a small context footprint teaches you how agents work, because you can read all of its code. Leaving it means losing that. (The token numbers in that discussion weren't measured, so take them as claims.)

## Roles instead of winners

The largest group of reports comes from people who stopped looking for a winner and gave each tool a job.

- **Plan versus implement.** One model plans and reviews, another implements. The planner can be slow and expensive "because it only writes a document". The implementer once quietly rewrote a helper that already existed two folders away, and the planner caught it in review.
- **The reverse split.** Another developer uses a chat model to hold long-term context and do the first review, and a coding agent as a "yes man" that executes. The opposite assignment, reported with equal confidence. No data picks between them.
- **Write versus review.** One model writes, the other reviews, with permission to run the code and try simple mutation testing. In one case the reviewer found a test that never exercised product code, two dozen placeholders without real tests, and a negative test that hit a helper instead of the real path. The roles could probably have been swapped. What mattered was that the reviewer was a different model.
- **Cheap model, premium harness.** The model and the harness can be decoupled, so changing models doesn't mean changing tools. One person running two models side by side thought the "better" one was a placebo.

A useful addition is to turn the plan into something that gets checked. A sketch:

```
PLAN.md
- files and symbols to reuse
- forbidden scope (do not touch)
- acceptance tests
- open assumptions
- rule: search the repo before adding any helper
Return: test command output + `git diff --stat`
```

The trade-off is plain. Two tools double the configuration and the review work. Advocates say the second model catches mistakes that come from shared assumptions; the evidence is anecdotal, and one account warns against using two implementers because their code would be "expensive to reconcile".

## Decide on your own work, not leaderboards

People distrust benchmarks for good reasons. They get called "some of the most useless and gamed things", and one developer who tried a model right after its impressive scores "realized that it was far behind". A single cheap personal test can tell you more: a git question about whether a commit survives a squashed merge, which most models failed and a few passed.

A more careful method came from a critique of a comparison on fifty real pull requests. If the repositories are public, a model with a later training cutoff may have seen both the bug and its fix. Record each PR's merge date and split the results by it.

A personal version:

1. Keep five to ten real tasks with known good outcomes.
2. Run each one in both tools at the same reasoning level.
3. Record time, diff size, number of corrections, and tokens.
4. Repeat after each major model update.

Most people skip the "same reasoning level" part, and it can swing results more than the choice of tool.

Speed deserves its own note. Fast iteration really does help with UI work. But "if the model makes a mistake" and a human has to step in, "any speed advantage is likely gone". Decide which one you're actually optimizing for.

## Keep the dependency thin

If a tool is a dependency, the engineering answer is to minimize what it touches. That's where deterministic, agentless workflows win on switching costs.

Look at the list again. Most of those lock-in points exist because the agent owns state: its own session history, its own memory, its own skill format, its own long-running harness. A workflow where you select the exact files and send a bounded prompt owns none of that. The context is whatever you picked. The result comes back as search/replace blocks. The change lands as an ordinary Git diff.

What do you carry to the next tool? Your repository. That's all.

Add your own API key and the billing problems shrink too. The model becomes a setting, not a subscription, so changing models doesn't mean changing tools. Costs show up per call, so trying another model is a measurable experiment, not a leap of faith into someone's rate-limit policy.

That doesn't make autonomous agents wrong. For a greenfield prototype or a long, boring migration, handing over the wheel is a sensible trade, and the lock-in is worth it. But for a complex, long-lived codebase, I'll take a thin, swappable dependency over a thick, clever one.

## Before you switch

- **Name the trigger.** Quota, refusal, model behavior, vendor change, or boredom. If it's the honeymoon ending, go back to the old setup for a week.
- **Keep the portable parts portable.** Instructions in `AGENTS.md` with thin pointers, handoff notes in files and never in a vendor chat, integrations over the open protocol.
- **Run the five-task trial** at matched reasoning levels.
- **If you run two tools, give them roles** and a checked plan, and let the reviewer run the code.
- **Track subscriptions and limits in one place.**
- **Prefer a model you can swap** over one bundled with the tool.
- **Reassess on a schedule,** a couple of hours every couple of months, not on every release thread.

Tools are converging, but only partly. Instruction files are close; loading rules, limits and refusals still differ, and a cheap exit plan pays off the day a pricing page changes. Staying on one tool for months isn't falling behind, since the best tools are close and every switch costs time. And a manual, file-by-file workflow will feel slower for exploratory or sprawling work. For targeted changes in a codebase that matters, the seconds spent picking files come back as smaller diffs and fewer surprises.
