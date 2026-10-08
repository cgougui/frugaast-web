# Your Subscription Is a Prepaid Card With No Balance Display

A weekly limit shown as a bare percentage cannot be compared with last month, with a colleague, or with itself after a reset. Convert it into dollars per percent from local logs and most of the mystery turns into a short list of controllable levers.

> I hit my five-hour limit after two prompts one afternoon and wrote an angry post in my head. Then I priced the session from the logs, and the culprit was a top reasoning setting I had left on for a mechanical rename.

## The Financial Lens: Read the Ledger Before You Blame the Bank

Imagine a prepaid card whose only display is a progress bar. No balance. No itemized receipts. Every purchase just moves the bar by an amount that depends on the store, the time of day and, apparently, your mood.

That is a subscription meter for a coding agent.

In the same week, one user on a high tier ran long sessions with the newest flagship and watched the weekly figure go from 39% to 26% in three and a half hours, with two banked resets in hand. A user on the cheapest paid tier reported the five-hour limit gone after one or two prompts. Another said a mid-tier model ran for hours on a $20 plan without breaking 10%, while someone on a $100 plan lost 10% of the week in five minutes at the top setting.

All four can be telling the truth. The meter shows "% of weekly" and "% of 5h", with no token allowance and no per-prompt price. One engineer called this confusing on purpose. Maybe. But cynicism is not a measurement, so the rest of this piece is about producing numbers.

## Why "% Used" Cannot Be Compared

Before any math, list what moves the percentage without the plan changing at all:

- **Model tier.** Heavier tiers cost more per token and often have their own plan multiplier.
- **Reasoning effort.** Low to maximum can differ by an order of magnitude on the same prompt.
- **Fast mode, subagents, long context.** Each multiplies tokens.
- **Cache state.** A warm cache is cheap. A cold one is not.
- **Product surface.** Chat, CLI, IDE and cloud tasks may draw differently.

Two items deserve a closer look.

First, the cut-off itself. An engineer argued that when the five-hour limit stops a task mid-run, the resume does not restore the same state. The cache is gone, so the session pays a costly cache write again, plus tokens spent re-planning. The limit does not just stop work. It makes the next hour more expensive.

Second, the input/output mix. One engineer on a "the reset is a trick" thread pointed out that the poster generated almost twice as many output tokens per input token as they did, and output costs roughly six times more per token. Another quoted a flagship output price of $30 per million tokens at short context and $45 at long context. Two people with the same "hours of use" can have wildly different bills.

The skeptics had a fair counterpoint too: "show your raw token logs." People underestimate the gap between newer and older models, and they add skills and plugins that bloat every request.

## The Method: Dollars per 1%

The approach reported across several threads is simple enough to run on a Sunday afternoon.

1. Read local session logs.
2. Sum tokens per turn, grouped by model (input, cached input, output).
3. Price them with the public rate card.
4. Record the change in weekly percentage between two timestamps.
5. Divide: **dollars consumed per 1% of weekly limit.**
6. Plot it over time, like a stock chart.

Now you have a unit. A weekly limit "worth" a certain amount of API-equivalent value can be tracked across resets and plan changes.

A sketch of the core (an illustration, not a published tool):

```python
# per turn: group by model, then price
cost = (inp - cached) * rate.input \
     + cached * rate.cached_input \
     + out * rate.output
# log: timestamp, model, effort, cost, weekly_pct_now
# ratio: cost_since_last_sample / (pct_now - pct_last)
```

Reported data points, all self-reported and unverified, give a sense of the scale:

| Report | Plan | Finding |
|--------|------|---------|
| Tracker user, before and after a reset | Cheapest paid | Weekly value about $160 down to about $100 (about -35%); fast-mode minutes per 1% fell from roughly 12-15 to roughly 7 |
| Heavy user, one short session | Cheapest paid | A 6-minute top-setting session cost about $15 of a 5h window and 16% of weekly; earlier months gave about $50/week |
| Inferred capacity per reset window | Mid tier | 20,015 then 19,617 then 16,124 then 14,482 credits across four windows |
| Heavy user | $100 plan | Claimed about $4,000 of API-valued usage in a month |
| Heavy user | Top tier | Estimated about 3B tokens for 100% |

Read that table carefully. The last two rows suggest subscriptions are still wildly generous in API terms. The first three suggest the generosity moved. Both can hold. The unit simply makes the argument possible.

## Critiques of the Method (Keep Them)

A measurement with no critics is a press release. These are the real objections:

- **Cache hits.** Cached tokens are cheaper, so raw token count misleads. Price them separately or the dollar figure is garbage.
- **Multi-device use.** Local logs only see one machine.
- **Request counts.** A newer model may make more requests and tool calls per task, which the dollar figure alone hides.
- **"This app could have been a prompt."** True, and a fair jab. A spreadsheet works too.

There is also counter-evidence. One user said their weekly limit was "higher than ever" at around 4 billion tokens. Others asked for before/after screenshots. A public tracker for model quality was cited as objective evidence against quantization claims, though its methodology deserves checking before anyone leans on it.

Quality drift and quota drift are different animals. A tracker of benchmark scores says nothing about how much your plan buys.

## Resets: Great for Morale, Terrible for Measurement

Resets arrived in waves. Global ones tied to user milestones. Later, "banked" ones that users could trigger themselves. Each is a gift and each wrecks your data.

Planning problems reported:

- A bonus reset that also pushes the next weekly reset date back, which punishes people who had kept a buffer.
- A reset landing hours before the user's own reset, making it nearly worthless.
- Business accounts excluded from some resets.
- Users who burned the last 40 to 50% of their week on top-effort fast mode, because a reset was rumored.

Two interpretations sit side by side. One says resets cover for lowered limits ("each reset I burn through the credits even faster afterwards"). The other, from a engineer, proposes a mechanism: resets trigger when under-used quota across all users exceeds over-used quota, so they pre-empt people who saved tokens. Neither is proven. For measurement, what matters is the practical effect: compare capacity per window across reset boundaries, and never compare a post-reset day with a pre-reset day without checking the date shift first.

One camp recommends ignoring reset chasing altogether. Budgeting is easier when the plan does not depend on a rumor.

## The Five-Hour Window: Removed, Returned, Argued Over

The five-hour window was removed for a while, then returned for the cheapest tier. Reactions were predictable.

Fans of removal said they could burn quota over a weekend, manage fewer sessions and do fewer handoffs. Critics of the window said it made the week feel like two or three five-hour limits. The official framing for its return was smoothing load and stopping casual users from burning a week in one go. The reaction: "1-2 prompts every 5 hours."

One report is a gift to anyone measuring. A single high-effort prompt thought for 11 minutes and consumed 54% of the five-hour window. By the end, 28 minutes later, the five-hour reading was 0% and the weekly reading was 84% remaining. Reading both meters together shows **which window binds**. Here the short window, not the weekly one, was the constraint. That changes the advice entirely: the fix is smaller prompts and lower effort, not weekly rationing.

A related loophole: long tasks kept running after the meter hit 0%, a third-party project made it easy to abuse, and the behavior was removed. The account is one user's, and engineers disputed blame, so take it as a story about incentives, not a verdict.

## The Tier Ladder: Where the Drain Comes From

An engineer did a nice piece of arithmetic on the newest flagship. Per-token API price: 2.5x the previous top tier. Task cost per an independent index: under 2x. Plan usage per the published limits: 3.3x. Three different multipliers, and only one of them hits your meter.

Reports of single prompts eating half a five-hour window followed. So did one of 21M tokens and 5% of a top-tier weekly limit for a simple chat on a light variant.

What do people do about it? Reported routing stacks:

- Mid tier at medium as the default driver, the high tier for strategic sessions, extra-high variants only as ad-hoc advisors, routine work on a mini or low tier.
- A planner tier, an implementer tier and a finisher tier, which one user said sustained a 20x plan seven days a week.
- Open-weight models for implementation, hosted models for planning and QA.

The disagreement is the instructive part. One user set everything to a cheaper tier at max effort, "12 times cheaper" on paper, and still drained a top-tier account in 24 hours. Another said the same tier "only eats crumbs". A third found the cheaper tier did the same job for 3% instead of 14%, but worse. The conclusion is plain: a cheaper tier is cheaper per task only if the result does not need a rerun.

Then there is overengineering as a hidden multiplier. Reports describe flagship models adding guard systems, hundreds of tests and extra docs nobody asked for. One mitigation: a second adversarial session asking "is this level of engineering necessary?" Another: extract a spec from the result and let a separate agent reimplement without seeing the code. And one engineer observed that "chronic use of ultra" chases absurdly improbable edge cases. Top effort on mechanical edits is the financial equivalent of hiring a surgeon to cut sandwiches.

## Hidden Consumers

Before concluding the plan shrank, check the background.

**Auto-review.** One user found a feature that re-reads the conversation to approve each action and claimed it burned 10.4M tokens in a week. Pushback was good: the chart showed turns, not tokens; the calls go to a smaller model; the feature is documented, not hidden. Another user disabled "approve for me" and saw zero auto-review usage. The takeaway is not "auto-review is the villain". It is "look at usage by model and feature before blaming the plan".

**Local state.** Some users deleted state databases and a log file that had grown to 1 GB and reported better behavior. Others found 5 GB or even 180 GB in the config folder. One wiped the whole directory and broke their extension. No mechanism has been established, so this is anecdotal. Back up before deleting anything, and test it on a fixed task, before and after.

## Moving Work Off the Metered Path

Some tokens never needed to be metered.

Planning in a general chat before touching the agent: generate a project archive in chat, move it over, do architecture Q&A in a separate tool. Counterpoints from the threads: the premium chat tier is not unlimited, can be slow and buggy, and code requests may redirect to a mode that shares the agent's limits. Image-to-code UI work, mockups in chat and code in the agent, saves quota too, though one engineer noted the conversion can take many iterations.

A controlled cross-vendor comparison also appeared: same React recreation task, same rules. One side used 40% of the weekly meter. The other used about 95% of a five-hour window and 10 to 15% of weekly. n=1, and the more expensive result had a more complete UI. Opposite reports exist. Treat it as a method, not a result.

## The Architectural Answer: Own the Meter

Everything above exists because the price signal is hidden. A percentage on a dashboard is a measurement the vendor controls, and it can move for reasons you will never see.

Compare the deterministic route. With your own API key, every request has a price in the provider's published rate card. You choose the exact files that enter the prompt, so context size is a number you can estimate before pressing send. No background reviewer re-reads the conversation; no spawn count you did not ask for. Edits come back as Search/Replace blocks and land as an ordinary Git diff, so a rerun is visible in history, not in a vanishing percentage. Cost tracking per project becomes a bookkeeping exercise instead of an investigation.

Subscriptions have their place. For heavy autonomous sessions the flat price can be a bargain, as the $4,000-on-$100 claim suggests. But a bargain you cannot measure is a bargain you cannot plan around.

## A Quota-Budgeting Checklist

1. **Instrument first.** Log tokens by model and effort from local logs; compute dollars per 1% weekly and per 5h window; record reset dates and date shifts.
2. **Pick a default tier** (mid tier, medium effort) and escalate on purpose. Reserve top effort for advisor and review calls.
3. **Audit background consumers** before concluding the plan changed: auto-review, subagents, memories, bloated config folders, extension context.
4. **Keep a buffer rule** and do not gamble on resets.
5. **Batch large autonomous goals** away from window or week boundaries, because a mid-run cutoff wastes cache.
6. **Move planning and prototypes** off the metered path where permitted, and route bulk implementation to cheaper models.
7. **Keep a second provider** as a hedge.

## FAQ

**Isn't this just "skill issue" dressed up with a spreadsheet?**
Partly, and that is fine; the point is to separate your usage from the provider's changes using numbers, not to assign blame. Some drops genuinely coincided with resets, so neither slogan survives contact with data.

**Why not trust the vendor's meter?**
It may be accurate, but a percentage cannot be audited or compared across weeks. Dollars per percent turns it into something you can check.

**Won't pricing tokens ignore cache and request counts?**
Yes if done lazily, which is why cached input and request counts must be tracked separately. The method is only as good as its logging.

**Is paying by API key actually cheaper?**
Not always; heavy users may get far more value from a flat plan. The advantage is predictability and visibility, not a guaranteed discount.

## Key Takeaways

- Convert the opaque percentage into API-equivalent dollars per 1% from local logs, pricing cached input and output separately.
- Most drain traces to controllable levers: tier, effort, background reviewers, bloated state and cutoffs that destroy the cache.
- Read both meters and note reset dates, because which window binds decides the right fix.

*A budget you cannot see is just a mood.*
