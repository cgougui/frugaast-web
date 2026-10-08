# The $60 for $10 Subscription: Do the Arithmetic Before You Burn the Quota

A flat-rate plan that advertises "$60 of usage for $10" is only cheap for one workload shape: cache-heavy, agentic and on the provider's favored model. This article walks through the ledger, line by line, so you can decide with your own numbers.

> I once watched a usage bar jump to 26% after what my own logs said was about five dollars of work, and I spent an evening finding out why. The answer was a multiplier nobody had printed next to the model name.

## The lens: an accountant's ledger

Skip the product reviews. Treat a coding plan like any other recurring cost and write down four columns: what you consumed, what the provider charged for it, what the plan deducted from your allowance, and what the same work would cost elsewhere.

Everything below is a variation on those four columns.

A caveat first. These figures are composites of what developers reported over a summer of price changes, and the dashboards and docs changed several times. Verify against your own bill. That, in fact, is the point.

## A $2 bill and a bar that says it is done

The genre of complaint is consistent. A developer sees 8.5% of a $60 allowance used when raw spend was $5.12, but the dashboard says 26%. Another reports $12 of usage showing as 82% of the weekly limit. Another says a mid-month change left the quota gone after "just $2 worth of usage".

These are not random glitches. They are arithmetic. Time to reproduce it.

## How the quota actually works

Plans like this have a dollar-denominated allowance, limited to a bundle of open-weight models, with layered limits: a five-hour bar, a weekly bar and a monthly bar. Pay-as-you-go balances for closed models are a separate product.

The "$15 / $30 / $60" label next to each model is not a separate allowance. It is a multiplier on one shared pool. A model labeled "$15" is effectively a 0.25x model: it uses the pool four times faster than a "$60" model.

Here is a worked example, with illustrative numbers shaped like the reports:

| Model (raw spend) | Raw cost | Multiplier | Quota consumed |
|---|---|---|---|
| Fast model A | $0.35 | 1x | $0.35 |
| Strong model B | $0.55 | 4x | $2.20 |
| Small model C | $0.09 | 1x | $0.09 |
| Premium model D | $3.06 | 4x | $12.24 |
| Mid model E | $1.07 | 1x | $1.07 |
| **Total** | **$5.12** | | **$15.95** |

$15.95 out of $60 is 26.6%. The dashboard said 26%. Mystery solved.

The cross-check is the best part. The plan's per-million-token price for the strong model was $0.435 in and $0.87 out. The pay-as-you-go listing for the same model was $1.74 and $3.48. Exactly four times.

So "$60 for $10" can mean "$15 of API value for $10" on the models that matter. Whether that is deceptive is a real argument. Some say it was easy to misread but not dishonest ("you're still getting $15 of API for $10"). Others call it deliberate obfuscation. Both can be true: the label is accurate and the page is confusing.

Some operational complaints are fair regardless. Prices moved mid-month with no notice ("20 days to go" with an empty bar). A bar chart that mixes multipliers cannot serve as a daily budget. A per-model "show details" breakdown was added after the complaints, and it still lacks a tokens column. And a docs table of requests per month that treats every model as a "$60 model" is, in one reader's words, nonsensical.

## Why cache hits decide everything

Now the second column. In an agent loop, every turn resends a large prefix: system prompt, tool definitions, the files you already read, the conversation so far. The provider charges a much lower rate for tokens it has seen recently and still holds in its prefix cache. That is the cache-read price.

Because agent loops are mostly prefix, cache reads dominate your token count. Reported workloads:

- About 95-98% cache hit on a cheap fast model.
- About 85% on another, with the author admitting cost came out slightly higher than expected.
- 93% across two months on a dashboard-building project.
- 98-99% from a minimal harness with default tools and a small instruction file.

Here is the rule of thumb that sticks. For a month of 1M fresh input, 200k output and about 55M cache reads, one budget model cost about $1.90 and another about $0.74 off-peak. Ignoring the cache-read price "is like leaving aside 98% of your usage".

Example price sheets, per million tokens (input / cache hit / output), illustrative:

| Model | Input | Cache hit | Output |
|---|---|---|---|
| Fast model, off-peak | $0.22 | $0.007 | $0.66 |
| Fast model, peak | $0.44 | $0.014 | $1.32 |
| Budget model, promo | $0.075 | $0.015 | $0.25 |
| Budget model, list | $0.15 | $0.03 | $0.50 |

Note the ratios. Cache hits are 30 to 50 times cheaper than fresh input on the same model. That is where the whole economy lives.

### What breaks the cache

The cache is a prefix match. Change something early in the conversation and everything after it misses. Reported culprits:

- **Plugins that rewrite history.** Anything that compresses, reorders or "tidies" earlier turns invalidates the prefix. There is an open issue about history being rewritten across turns.
- **Switching models between plan and implement.** A different model has a different cache, so the cost of the swap is a full re-read.
- **Harness differences.** One coding CLI pointed at the plan reportedly did not cache at all while another did.
- **Missing routing hints.** The plan's provider now expects a stable session identifier header from third-party tools, because it ties routing to cache hit rate. One chat front-end fixed it with a header like `{"x-session": "{{CHAT_ID}}"}`. The three requirements listed were typical coding-agent traffic, a self-identifying user agent and a stable session ID.
- **Short TTLs.** One user says a cache survives about an hour on one model and is evicted in about five minutes on another. That is a single-user claim to verify, but the mechanism is real: how long you can pause between prompts depends on how long the cache lives.

A cautionary case on accounting: a user reported 433M tokens in two days with a harness claiming 98% cache, which looked like cache reads billed as normal input, versus "day and night" on another tool. Replies doubted the harness's numbers. Unresolved, so keep your own meter.

## Subscription, router or direct API: break-even depends on cache share

The third column. One claim made the rounds: $10 buys 40-100M+ tokens of a fast model on an aggregator versus 3-8M on the plan.

The rebuttal had numbers, and they are the useful part. Take the aggregator's price sheet for the fast model and the plan's price divided by the multiplier. Then run two workloads:

| Workload (in / out / cache) | Aggregator | Plan |
|---|---|---|
| Agentic: 2% / 1% / 97% | $1.52 | $0.59 |
| Chatty: 10% / 50% / 40% | $9.02 | $11.82 |

Neither side is wrong. The plan wins for almost-all-cache agent loops. The aggregator wins for chatty, low-cache use. And the aggregator routes between providers, so cache and quantization vary unless you pin one.

Earlier data points agree: a user found the plan cheaper than the vendor's own API even at 80-90% cache, spending about $5 in 4-5 days direct. A later poster concluded that after price changes the math "is no longer making sense" for fast models. A warning applies: one user's 100k tokens per request average is high next to a more typical 30k at 90% cache. Your request size changes the answer.

There is even a third pricing model: energy-based inference, where a run that used half a kilowatt-hour cost about $2.50, against about $10 at token rates and about $1.34 of real money on the plan. Counterpoints: the plan caps you and the energy provider does not, and the plan pays more per token than pay-as-you-go, so its "$60" is not really $60.

### The reproducible exercise

You do not need anyone's spreadsheet. You need a log.

1. Put a small proxy between your tool and the provider, or use a tracing service. Record, per request: model, input tokens, cached tokens, output tokens.
2. Compute cache share: cached divided by (input plus cached).
3. For each price sheet, compute `cost = in * p_in + cache * p_cache + out * p_out`.
4. Multiply by the plan's quota multiplier if one applies.
5. Compare, then repeat after any price announcement or promo expiry.

Twenty lines of script. Someone built exactly this, storing counts per request and scraping current prices. It outperforms any dashboard bar.

## Price shocks and promo cliffs

The fourth column is time. A fast model launches. Daily usage on the plan climbs from roughly 3T to 8T tokens per day within weeks, spiking toward 15T. Then the price rises and the quota shrinks. Usage settles around 12T. Peak and off-peak pricing arrives, with off-peak requests roughly double the peak estimate. A free tier ends. A $5 first month vanishes. A user reports losing "20 percent in 10 days, then another 20 percent in 4 hours".

Why? Two readings. One is that it was traffic shaping because capacity was overloaded; the provider's founder said they could reproduce the upstream prices on rented GPUs, which some read as proof the earlier pricing claims were marketing. The other points at real capacity errors. Report both and pick neither.

The lesson holds either way. Promo-priced and free "stealth" models are time-limited. One appeared, got slow under load, and vanished. Another disappeared from the free tier. Users described subscribing as "like playing roulette", and one observed that a subscription "only lasts the month because of the promotional models".

The cheapest price is also where substitution risk concentrates: a cheap reseller was reportedly exposed for routing to smaller models behind a wrapper.

## Cost per task is not cost per token

A model cheap per token can still be expensive per task.

Reports: one model's reasoning looped for 40k tokens on "hi there". Another "used 10x the tokens" a rival did in a whole day, with bash and read loops. A third was called "a token-blowing machine". A fourth burned a five-hour limit in 1.5 tasks.

Counter-reports exist for the same models ("boring, well-behaved", a good reviewer), so the variance is real and your task mix decides.

Speed is a hidden cost as well. One budget model was reported as 20-50% slower per task despite fewer tokens, and took about 14 minutes on a test where a rival took about 5, though launch load muddies that. Time is billable.

Guardrails that cost nothing: step limits, budget alerts, and reading the thinking line. For unattended loops, stories of infinite loops, a deleted file and a $70 run with no visible progress are the argument.

And skepticism about leaderboards, the "benchmaxxed" kind, leads to a better filter: "the model that annoys you least after 3 hours".

## Routing habits users converge on

- Plan with an expensive model, execute with a cheap one. Repeated variants: one model to plan and another to execute; an expensive one only to escalate.
- Review loops: a cheap implementer with a different cheap model reviewing every few hours.
- Plan outside the paid agent: draft in a free web chat, refine in plan mode, then build.
- Mix subscriptions to avoid a single point of limits: a plan, a second chat subscription, free fallback models and a direct key.
- A local fallback: a 35B mixture-of-experts model at 262K context on 8 GB of VRAM and 32 GB of RAM at about 26 tok/s, using `--n-cpu-moe`, `--flash-attn on` and a quantized KV cache (with the caveat that q4 can cause doom loops and q8 near 200k is safer).

Context-trimming tools claim 70-80% savings. Treat all as unvalidated. Critics note most bloat lives in static files and tool descriptions, which you control directly.

## Non-price costs of cheap tokens

Data policy shifts: one model version required opting in to models hosted in a particular jurisdiction, and a zero-data-retention option was reportedly dropped without announcement. Reactions split between privacy objection and "both take data". Some cheap variants are cheaper because they train on your requests.

Reliability: 429 "quota exceeded" errors when only one model was exhausted, capacity errors, streams closed before the finish reason. Keep a second provider configured.

## The paradigm: the meter belongs to you

Everything above is a story about an opaque meter: multipliers you reverse-engineer, caches you cannot see, promos that expire, quotas that move mid-month.

The deterministic answer is boring. Bring your own key. Pay the listed price per token. Log every request. See the exact cost of exactly this prompt before you send the next one.

And control the context yourself. If you choose the files that go into the prompt, you choose the prefix, and a stable prefix is a cache hit. No plugin rewrites history behind your back, no agent decides to read forty files, no loop spends a night at the cache-miss rate. Edits arrive as search/replace blocks you review as a normal Git diff.

Fair is fair: agents are great for prototyping, and a flat rate really is the cheapest option for a high-cache loop. But for a complex codebase, a predictable per-prompt cost beats a clever allowance.

## Practical checklist

- Log tokens in, cached and out, per model, before trusting a bar.
- Compute your cache share. Above about 90%, compare cache-read prices.
- Convert each model to its multiplier and record effective dollars per million tokens.
- Re-run the comparison after any price change or promo expiry.
- Default to the cheap model and escalate on purpose.
- Cap unattended runs and verify plugins do not rewrite history.
- Do not build a workflow around a free or promo model.

## FAQ

**Isn't this just complaining about a good deal?**
Often it is a good deal, for high-cache agent loops on the favored model. The point is to know that before the bar hits zero.

**Why not just use the cheapest per-token model?**
Because per-task cost includes verbosity, loops and speed, and a cheap model that thinks 40k tokens about a greeting is not cheap.

**Is direct pay-as-you-go not scarier than a cap?**
It can be, which is why alerts and per-request logs matter. The trade-off is a variable bill instead of a surprise lockout.

## Key Takeaways

- Label prices are not quota prices: convert every model to its multiplier and its cache-weighted cost per million tokens.
- Cache share decides the break-even, so measure it from your own request log instead of trusting a bar or a headline.
- Treat promos as expiring, keep a second provider, and keep the meter and the context under your own control.

*A price you cannot compute is a price someone else gets to change.*
