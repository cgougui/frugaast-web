Imagine a prepaid card whose only display is a progress bar. No balance, no itemized receipts. Every purchase moves the bar by an amount that depends on the store, the time of day and, apparently, your mood. That's a coding agent's subscription meter.

So when the five-hour limit runs out after two prompts, the natural reaction is an angry post. The better one is to price the session from the local logs. Often the culprit turns out to be a top reasoning setting left on for a mechanical rename.

In the same week, one user on a high tier ran long sessions with the newest flagship and watched the weekly figure drop from 39% to 26% in three and a half hours, with two banked resets in hand. A user on the cheapest paid tier said the five-hour limit was gone after one or two prompts. Another said a mid-tier model ran for hours on a $20 plan without passing 10%, while someone on a $100 plan lost 10% of their week in five minutes at the top setting.

All four can be telling the truth. The meter shows "% of weekly" and "% of 5h", with no token allowance and no price per prompt. One engineer called this confusing on purpose. Maybe. But cynicism isn't a measurement, so the rest of this post is about producing numbers.

## Why "% used" can't be compared

Before any math, here's what moves the percentage without the plan changing at all:

- **Model tier.** Heavier tiers cost more per token and often have their own plan multiplier.
- **Reasoning effort.** Low and maximum can differ by an order of magnitude on the same prompt.
- **Fast mode, subagents, long context.** Each multiplies tokens.
- **Cache state.** A warm cache is cheap. A cold one isn't.
- **Product surface.** Chat, CLI, IDE and cloud tasks may draw on the quota differently.

Two of these deserve a closer look.

First, the cutoff itself. One engineer argued that when the five-hour limit stops a task mid-run, resuming doesn't restore the same state. The cache is gone, so the session pays for an expensive cache write again, plus the tokens spent re-planning. The limit doesn't just stop work. It makes the next hour more expensive.

Second, the mix of input and output. One engineer in a "the reset is a trick" thread pointed out that the poster generated almost twice as many output tokens per input token as they did, and output costs roughly six times more per token. Another quoted a flagship output price of $30 per million tokens at short context and $45 at long context. Two people with the same "hours of use" can have wildly different bills.

The skeptics had a fair point too: "show your raw token logs." People underestimate how different newer models are from older ones, and they add skills and plugins that bloat every request.

## Dollars per 1%

The method that shows up across several threads is simple enough for a Sunday afternoon:

1. Read your local session logs.
2. Sum the tokens per turn, grouped by model (input, cached input, output).
3. Price them with the public rate card.
4. Record the change in weekly percentage between two timestamps.
5. Divide to get dollars consumed per 1% of the weekly limit.
6. Plot it over time, like a stock chart.

Now you have a unit. You can track what a weekly limit is "worth" in API-equivalent value across resets and plan changes.

A sketch of the core (an illustration, not a published tool):

```python
# per turn: group by model, then price
cost = (inp - cached) * rate.input \
     + cached * rate.cached_input \
     + out * rate.output
# log: timestamp, model, effort, cost, weekly_pct_now
# ratio: cost_since_last_sample / (pct_now - pct_last)
```

Reported data points, all self-reported and unverified, give a sense of scale:

| Report | Plan | Finding |
|---|---|---|
| Tracker user, before and after a reset | Cheapest paid | Weekly value fell from about $160 to about $100 (about -35%); fast-mode minutes per 1% fell from roughly 12-15 to roughly 7 |
| Heavy user, one short session | Cheapest paid | A 6-minute session at the top setting cost about $15 of a 5h window and 16% of the week; earlier months gave about $50 a week |
| Capacity inferred per reset window | Mid tier | 20,015, then 19,617, then 16,124, then 14,482 credits across four windows |
| Heavy user | $100 plan | Claimed about $4,000 of usage at API prices in a month |
| Heavy user | Top tier | Estimated about 3B tokens for 100% |

Read that carefully. The last two rows suggest subscriptions are still wildly generous in API terms. The first three suggest the generosity has shrunk. Both can be true. The unit just makes the argument possible.

## The objections, which you should keep

A measurement with no critics is a press release. The real objections:

- **Cache hits.** Cached tokens are cheaper, so raw token counts mislead. Price them separately or the dollar figure is garbage.
- **Multiple devices.** Local logs only see one machine.
- **Request counts.** A newer model may make more requests and tool calls per task, which the dollar figure alone hides.
- **"This app could have been a prompt."** True, and a fair jab. A spreadsheet works too.

There's counter-evidence as well. One user said their weekly limit was "higher than ever" at around 4 billion tokens. Others asked for before-and-after screenshots. A public tracker of model quality was cited as objective evidence against quantization claims, though I'd check its methodology before leaning on it.

Quality drift and quota drift are different things. A tracker of benchmark scores says nothing about how much your plan buys.

## Resets are good for morale and bad for measurement

Resets came in waves. Global ones tied to user milestones. Later, "banked" ones users could trigger themselves. Each one is a gift, and each one wrecks your data.

Planning problems people reported:

- A bonus reset that also pushes the next weekly reset date back, which punishes people who'd kept a buffer.
- A reset landing hours before the user's own reset, making it nearly worthless.
- Business accounts left out of some resets.
- Users burning the last 40 to 50% of their week on top-effort fast mode because a reset was rumored.

There are two interpretations. One says resets cover for lowered limits ("each reset I burn through the credits even faster afterwards"). The other, from an engineer, proposes a mechanism: resets trigger when unused quota across all users exceeds overused quota, so they preempt people who saved tokens. Neither is proven. For measuring, what matters is the practical effect: compare capacity per window across reset boundaries, and never compare a day after a reset with a day before without checking whether the date shifted.

One camp recommends ignoring resets entirely. Budgeting is easier when your plan doesn't depend on a rumor.

## The five-hour window

The five-hour window was removed for a while, then came back for the cheapest tier. Reactions were predictable.

People who liked the removal said they could burn quota over a weekend, manage fewer sessions and do fewer handoffs. Critics of the window said it made the week feel like two or three five-hour limits. The official reason for bringing it back was smoothing load and stopping casual users from burning a week in one go. The reaction: "1-2 prompts every 5 hours."

One report is a gift to anyone measuring. A single high-effort prompt thought for 11 minutes and used 54% of the five-hour window. Twenty-eight minutes later, the five-hour reading was 0% and the weekly reading was 84% remaining. Reading both meters together shows which window is the real limit. Here it was the short window, not the weekly one, and that changes the advice completely: the fix is smaller prompts and lower effort, not rationing the week.

A related loophole: long tasks kept running after the meter hit 0%, a third-party project made it easy to abuse, and the behavior was removed. That's one user's account and people disputed who was to blame, so read it as a story about incentives, not a verdict.

## Where the drain comes from

One engineer did some nice arithmetic on the newest flagship. Price per token through the API: 2.5x the previous top tier. Cost per task, according to an independent index: under 2x. Plan usage, according to the published limits: 3.3x. Three different multipliers, and only one of them hits your meter.

Reports of single prompts eating half a five-hour window followed. So did one of 21M tokens and 5% of a top-tier weekly limit for a simple chat on a light variant.

What people do about it:

- A mid-tier model at medium effort as the default, the high tier for strategic sessions, extra-high variants only as occasional advisors, and routine work on a mini or low tier.
- A planner tier, an implementer tier and a finisher tier, which one user said sustained a 20x plan seven days a week.
- Open-weight models for implementation, hosted models for planning and QA.

The disagreement is instructive. One user set everything to a cheaper tier at max effort, "12 times cheaper" on paper, and still drained a top-tier account in 24 hours. Another said the same tier "only eats crumbs". A third found the cheaper tier did the same job for 3% instead of 14%, but worse. The conclusion is simple: a cheaper tier is only cheaper per task if you don't have to rerun the result.

Overengineering is another hidden multiplier. People describe flagship models adding guard systems, hundreds of tests and extra docs nobody asked for. One fix: a second, adversarial session asking "is this level of engineering necessary?" Another: extract a spec from the result and have a separate agent reimplement it without seeing the code. One engineer noticed that "chronic use of ultra" chases absurdly unlikely edge cases. Top effort on mechanical edits is like hiring a surgeon to cut sandwiches.

## Hidden consumers

Before deciding the plan shrank, check what's running in the background.

**Auto-review.** One user found a feature that rereads the conversation to approve each action and claimed it burned 10.4M tokens in a week. The pushback was good: the chart showed turns, not tokens; the calls go to a smaller model; and the feature is documented, not hidden. Another user turned off "approve for me" and saw zero auto-review usage. The lesson isn't that auto-review is the villain. It's to look at usage by model and feature before blaming the plan.

**Local state.** Some users deleted state databases and a log file that had grown to 1 GB and reported better behavior. Others found 5 GB, or even 180 GB, in the config folder. One wiped the whole directory and broke their extension. Nobody established a mechanism, so this is anecdote. Back up before deleting anything, and test on a fixed task before and after.

## Moving work off the meter

Some tokens never needed to be metered.

People plan in a general chat before touching the agent: generate a project archive in chat, move it over, and do architecture Q&A in a separate tool. The counterpoints: the premium chat tier isn't unlimited, can be slow and buggy, and code requests may get redirected to a mode that shares the agent's limits. Doing UI work from images, with mockups in chat and code in the agent, saves quota too, though one engineer noted the conversion can take many rounds.

A controlled comparison across vendors also appeared: the same React recreation task, the same rules. One side used 40% of its weekly meter. The other used about 95% of a five-hour window and 10 to 15% of its week. One run each, and the more expensive result had a more complete UI. Opposite reports exist. Treat it as a method, not a result.

## Own the meter

All of this exists because the price is hidden. A percentage on a dashboard is a measurement the vendor controls, and it can move for reasons you'll never see.

Compare the deterministic route. With your own API key, every request has a price on the provider's published rate card. You choose the exact files that go into the prompt, so you can estimate context size before you hit send. No background reviewer rereads the conversation, and nothing spawns agents you didn't ask for. Edits come back as search/replace blocks and land as an ordinary Git diff, so a rerun shows up in history, not in a vanishing percentage. Tracking cost per project becomes bookkeeping instead of an investigation.

Subscriptions have their place. For heavy autonomous sessions, the flat price can be a bargain, as the $4,000-on-$100 claim suggests. But you can't plan around a bargain you can't measure.

## Budgeting checklist

1. **Instrument first.** Log tokens by model and effort from your local logs, compute dollars per 1% of the week and of the 5h window, and record reset dates and any date shifts.
2. **Pick a default tier** (mid tier, medium effort) and escalate on purpose. Save top effort for advisor and review calls.
3. **Check background consumers** before concluding the plan changed: auto-review, subagents, memories, bloated config folders, extension context.
4. **Keep a buffer,** and don't gamble on resets.
5. **Schedule big autonomous jobs** away from window or week boundaries, because a mid-run cutoff wastes the cache.
6. **Move planning and prototypes** off the meter where that's allowed, and route bulk implementation to cheaper models.
7. **Keep a second provider** as a hedge.

Is this just "skill issue" with a spreadsheet? Partly, and that's fine. The point is to use numbers to separate your own usage from the provider's changes, not to assign blame. Some drops really did line up with resets, so neither slogan survives contact with the data. Paying by API key isn't always cheaper either; heavy users may get far more from a flat plan. What it buys is visibility and predictability, not a guaranteed discount.
