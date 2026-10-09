How does five dollars of work use up 26% of a sixty-dollar allowance? The answer is a multiplier nobody printed next to the model name.

The complaints all look alike. One developer sees 8.5% of a $60 allowance used by raw spend ($5.12), but the dashboard says 26%. Another reports $12 of usage showing as 82% of the weekly limit. Another says a mid-month change wiped out the quota after "just $2 worth of usage".

These aren't glitches. They're arithmetic, and you can reproduce it. I'll go through four things: what you consumed, what the provider charged, what the plan deducted from your allowance, and what the same work would cost elsewhere.

A caveat: these figures are composites of what developers reported over a summer of price changes, and the dashboards and docs changed several times. Check them against your own bill. That's really the whole point.

## How the quota actually works

Plans like this give you an allowance in dollars, limited to a set of open-weight models, with layered limits: a five-hour bar, a weekly bar and a monthly bar. Pay-as-you-go balances for closed models are a separate product.

The "$15 / $30 / $60" label next to each model isn't a separate allowance. It's a multiplier on one shared pool. A model labeled "$15" is effectively a 0.25x model: it drains the pool four times faster than a "$60" model.

A worked example, with numbers shaped like the reports:

| Model | Raw cost | Multiplier | Quota used |
|---|---|---|---|
| Fast model A | $0.35 | 1x | $0.35 |
| Strong model B | $0.55 | 4x | $2.20 |
| Small model C | $0.09 | 1x | $0.09 |
| Premium model D | $3.06 | 4x | $12.24 |
| Mid model E | $1.07 | 1x | $1.07 |
| **Total** | **$5.12** | | **$15.95** |

$15.95 out of $60 is 26.6%. The dashboard said 26%. Mystery solved.

The cross-check is the best part. The plan's price for the strong model was $0.435 per million tokens in and $0.87 out. The pay-as-you-go price for the same model was $1.74 and $3.48. Exactly four times.

So "$60 for $10" can mean "$15 of API value for $10" on the models you actually want. Whether that's deceptive is a real argument. Some say it was easy to misread but not dishonest ("you're still getting $15 of API for $10"). Others call it deliberate obfuscation. I think both are true: the label is accurate and the page is confusing.

Some complaints are fair either way. Prices changed mid-month without notice ("20 days to go" with an empty bar). A bar that mixes multipliers can't work as a daily budget. A per-model breakdown was added after the complaints, and it still has no token column. And a docs table of requests per month that treats every model as a "$60 model" is, in one reader's words, nonsensical.

## Cache hits decide everything

In an agent loop, every turn resends a big prefix: system prompt, tool definitions, the files already read, the conversation so far. Providers charge much less for tokens they've seen recently and still hold in their prefix cache. That's the cache-read price.

Since agent loops are mostly prefix, cache reads dominate your token count. Reported workloads:

- About 95 to 98% cache hits on a cheap fast model.
- About 85% on another, with the author admitting the cost came out a bit higher than expected.
- 93% over two months on a dashboard-building project.
- 98 to 99% from a minimal harness with default tools and a small instruction file.

The example that stuck with me: for a month of 1M fresh input tokens, 200k output and about 55M cache reads, one budget model cost about $1.90 and another about $0.74 off-peak. Ignoring the cache-read price "is like leaving aside 98% of your usage".

Example price sheets, per million tokens (illustrative):

| Model | Input | Cache hit | Output |
|---|---|---|---|
| Fast model, off-peak | $0.22 | $0.007 | $0.66 |
| Fast model, peak | $0.44 | $0.014 | $1.32 |
| Budget model, promo | $0.075 | $0.015 | $0.25 |
| Budget model, list | $0.15 | $0.03 | $0.50 |

Cache hits are 30 to 50 times cheaper than fresh input on the same model. That's where all the economics are.

### What breaks the cache

The cache is a prefix match. Change something early in the conversation and everything after it misses. Reported culprits:

- **Plugins that rewrite history.** Anything that compresses, reorders or "tidies" earlier turns invalidates the prefix. There's an open issue about history being rewritten between turns.
- **Switching models between planning and implementation.** A different model has a different cache, so every switch means a full re-read.
- **Harness differences.** One coding CLI pointed at the plan reportedly didn't cache at all, while another did.
- **Missing routing hints.** The provider now expects third-party tools to send a stable session ID header, because routing affects cache hit rate. One chat front-end fixed it with a header like `{"x-session": "{{CHAT_ID}}"}`. The listed requirements were typical coding-agent traffic, a user agent that identifies itself, and a stable session ID.
- **Short TTLs.** One user says the cache lasts about an hour on one model and gets evicted after about five minutes on another. That's one user's claim, but the mechanism is real: how long you can pause between prompts depends on how long the cache lives.

A cautionary tale about accounting: a user reported 433M tokens in two days with a harness claiming 98% cache hits, which looked like cache reads billed as normal input. Another tool was "day and night" different. Replies doubted the harness's numbers. It was never resolved, so keep your own meter.

## Subscription, router or direct API

One claim made the rounds: $10 buys 40 to 100M+ tokens of a fast model on an aggregator, versus 3 to 8M on the plan.

The rebuttal had numbers, and they're the useful part. Take the aggregator's prices for the fast model and the plan's prices divided by the multiplier, then run two workloads:

| Workload (in / out / cache) | Aggregator | Plan |
|---|---|---|
| Agentic: 2% / 1% / 97% | $1.52 | $0.59 |
| Chatty: 10% / 50% / 40% | $9.02 | $11.82 |

Neither side was wrong. The plan wins for agent loops that are almost all cache. The aggregator wins for chatty use with little caching. And the aggregator routes between providers, so caching and quantization vary unless you pin one.

Earlier data points agree. One user found the plan cheaper than the vendor's own API even at 80 to 90% cache, after spending about $5 in four or five days going direct. A later poster concluded that after the price changes the math "is no longer making sense" for fast models. Request size matters too: one user's average of 100k tokens per request is high compared with a more typical 30k at 90% cache.

There's even a third pricing model: paying for energy. One run that used half a kilowatt-hour cost about $2.50, against about $10 at token rates and about $1.34 of real money on the plan. The counterpoints: the plan caps you and the energy provider doesn't, and the plan pays more per token than pay-as-you-go, so its "$60" isn't really $60.

### Do it with your own numbers

You don't need anyone's spreadsheet. You need a log.

1. Put a small proxy between your tool and the provider, or use a tracing service. For each request, record the model, input tokens, cached tokens and output tokens.
2. Compute your cache share: cached divided by (input plus cached).
3. For each price sheet, compute `cost = in * p_in + cache * p_cache + out * p_out`.
4. Multiply by the plan's multiplier if there is one.
5. Compare, and do it again after any price announcement or promo ending.

That's about twenty lines of script. Someone built exactly this, storing counts per request and scraping current prices, and it's more useful than any dashboard bar.

## Price shocks and promos that end

Prices also change over time. A fast model launches. Daily usage on the plan climbs from about 3T tokens a day to 8T within weeks, spiking toward 15T. Then the price goes up and the quota shrinks. Usage settles around 12T. Peak and off-peak pricing arrives, with off-peak requests around double the peak estimate. A free tier ends. A $5 first month disappears. One user reports losing "20 percent in 10 days, then another 20 percent in 4 hours".

There are two explanations. One is traffic shaping because capacity was overloaded; the provider's founder said they could match upstream prices on rented GPUs, which some read as proof that the earlier pricing claims were marketing. The other points at real capacity errors. I don't know which is right.

Either way, promo-priced and free "stealth" models don't last. One appeared, got slow under load, and vanished. Another left the free tier. Users said subscribing was "like playing roulette", and one noticed that a subscription "only lasts the month because of the promotional models".

The cheapest prices also carry the most risk of substitution: one cheap reseller was reportedly caught routing requests to smaller models behind a wrapper.

## Cost per task isn't cost per token

A model that's cheap per token can still be expensive per task.

One model's reasoning looped for 40k tokens on "hi there". Another "used 10x the tokens" a rival did in a whole day, stuck in bash and read loops. A third was called "a token-blowing machine". A fourth used up a five-hour limit in a task and a half.

Other people describe the same models as "boring, well-behaved" or a good reviewer, so the variance is real and your own mix of tasks decides.

Speed is a hidden cost too. One budget model was reported as 20 to 50% slower per task despite using fewer tokens, taking about 14 minutes on a test a rival finished in about 5, though launch-week load muddies that. Your time costs money.

Guardrails that cost nothing: step limits, budget alerts, and reading the thinking output. For unattended loops, the stories of infinite loops, a deleted file and a $70 run with no visible progress make the case.

And because people distrust "benchmaxxed" leaderboards, a better filter came up: "the model that annoys you least after 3 hours".

## Habits people converge on

- Plan with an expensive model and execute with a cheap one, or use the expensive one only to escalate.
- Review loops: a cheap model implements, and a different cheap model reviews every few hours.
- Plan outside the paid agent: draft in a free web chat, refine in plan mode, then build.
- Spread across subscriptions so one limit doesn't stop you: a plan, a second chat subscription, free fallback models and a direct key.
- A local fallback: a 35B mixture-of-experts model at 262K context on 8 GB of VRAM and 32 GB of RAM, at about 26 tokens a second, using `--n-cpu-moe`, `--flash-attn on` and a quantized KV cache (q4 can cause doom loops; q8 near 200k is safer).

Context-trimming tools claim 70 to 80% savings. I'd treat all of those as unverified. Critics point out that most bloat sits in static files and tool descriptions, which you control directly.

## Costs that aren't on the price sheet

Data policies change. One model version required opting in to models hosted in a particular jurisdiction, and a zero-data-retention option was reportedly dropped without announcement. Reactions split between privacy objections and "both take data". Some cheap variants are cheap because they train on your requests.

Reliability varies: 429 "quota exceeded" errors when only one model was exhausted, capacity errors, streams closed before the finish reason. Keep a second provider configured.

## Own the meter

All of this is about a meter you can't see into: multipliers you have to reverse-engineer, caches you can't see, promos that expire, quotas that change mid-month.

The boring alternative is to use your own key, pay the listed price per token, log every request, and see exactly what a prompt cost before you send the next one.

And control the context yourself. If you choose the files that go into the prompt, you choose the prefix, and a stable prefix is a cache hit. No plugin rewrites history behind your back, no agent decides to read forty files, no loop spends a night paying cache-miss prices. Edits come back as search/replace blocks you review as a normal Git diff.

To be fair, agents are great for prototyping, and a flat rate really is the cheapest option for a loop that's mostly cache hits. But for a complex codebase, I'd take a predictable cost per prompt over a clever allowance.

## Checklist

- Log input, cached and output tokens per model before trusting any bar.
- Compute your cache share. Above about 90%, compare cache-read prices.
- Convert each model to its multiplier and write down the effective dollars per million tokens.
- Redo the comparison after any price change or promo ending.
- Default to the cheap model and escalate on purpose.
- Cap unattended runs and check that plugins don't rewrite history.
- Don't build a workflow around a free or promo model.

For agent loops that are mostly cache hits, on the model the provider favors, these plans often are a good deal. The point is to know that before the bar hits zero. Pay-as-you-go can feel scarier than a cap, which is why alerts and per-request logs matter. You're trading a variable bill for the risk of a surprise lockout.
