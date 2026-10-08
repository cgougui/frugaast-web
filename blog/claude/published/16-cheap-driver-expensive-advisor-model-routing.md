# The Ledger of the Cheap Driver and the Expensive Advisor

Developers who run a cheap or open-weight model as their daily driver keep a premium model on call for the small share of decisions that matter. The routing is easy to build; making it survive context limits, flat-plan quirks and silent provider changes is the hard part.

> I used to pay premium rates for a model to rename variables, and I felt it every month when the invoice arrived. Then I split the work in two and discovered that the split itself had a bill I had never read.

## The pattern: a cheap model types, a strong model is consulted

The setup goes like this. A cheap model is the "driver". It handles edits, tests, refactors, "the mechanical grind". Then there is a tail of maybe 5% of decisions the driver should not own: "the architecture fork", "is this even the right approach", and the bug it has been "circling for twenty minutes, confidently wrong".

For that tail, a stronger model is asked to steer and check. The cheap model types; the expensive one thinks, occasionally.

Another practitioner does the same by hand. A budget model through an aggregator costs "a few cents per large request", perhaps ten dollars for a month of general use, and they switch to a premium model when they "jump into coding territory". Same split, done with a human as the router.

This article uses a **financial lens**. Every claim below is a line in a ledger: what it costs, who pays, and what is capped. Because the pattern is appealing, and appealing patterns tend to hide their invoices.

## Three ways to route, and what each one costs

There are three ways to implement the escalation. Each has a price that is not on the pricing page.

**1. An advisor extension.** A consult tool gives you a "quick second opinion", a "council" of advisors with different stances, or a "debate" between two. A council can mix transports: one advisor called inline over an API, another through a command-line client.

**2. An automatic router.** Several packages already exist for this, and the niche is crowded. They differ in what triggers a switch (turn count, task type, keyword, context size), and the details are worth checking in each repository rather than trusting a thread that only lists names.

**3. Manual switching.** One reply simply suggests staying open and switching models by hand. That is the baseline. If an automatic router cannot beat "switch the model by hand when stuck", it is a hobby, not a saving.

Here is an illustration of an escalation policy. It is a sketch, not something the threads specify:

| Situation | Driver | Advisor | Trigger |
|---|---|---|---|
| Routine edit, test, refactor | cheap model | none | default |
| Same error after N turns | cheap model | strong model, one consult | stuck counter |
| Schema or architecture change | cheap model proposes | strong model reviews plan | before the change |
| Pre-merge review | cheap model wrote it | strong model reads the diff | before merge |

Notice that none of these triggers is "the model feels uncertain". Models are bad at knowing when they are wrong. Triggers should be things a counter or a calendar can detect.

A deterministic pipeline version shows up in one practitioner's bash sketch for a "software factory": one non-interactive call per stage, for writing the spec, writing the plan, executing it, a quick review-and-fix pass, and finally a full code review that gets a *different* model. Review is the one step that earns a second opinion. That is routing as a plain script, with no orchestrator deciding anything.

## Line item one: the advisor that cannot hold your session

The first failure is almost comic. The author of one consult extension built a new one because the first advisor extension "kept dying mid-session". It forwarded the entire session to the advisor "without checking whether the advisor's own context window could hold it". The second opinion failed exactly when a long session needed it most.

The fix reported: size each consult to that advisor's real window. Different models have different windows.

The general lesson is that a consult is a packet, and a packet has a budget. A decent one contains:

1. the task, in two sentences;
2. the constraints you have already set;
3. the failing hypothesis, meaning what was tried and why it did not work;
4. the relevant diffs, not the full transcript;
5. a clear question.

If the packet does not fit, the extension has two honest options: summarize, or refuse and say so. The dishonest option is to truncate silently and get a confident answer to a half-asked question. (This is general guidance; the thread only reports the window-fitting fix.)

There is also a token-diet cautionary tale. A package that wraps tools to keep sessions compact claimed to "cut token usage roughly in half" on benchmark tasks. One tester "didn't see the reduction expected". Another joked about stacking four different context-saving tools on top of each other. Compaction tools are not additive. Each one assumes it is the only one rewriting the context.

## Line item two: is the cheap model even cheap?

Now the awkward part. The premise ("cheap driver, pricey advisor") does not hold for everyone, and the disagreement among experienced developers is instructive.

One camp prefers a premium model through a flat $20 subscription and gets "FAR better limits". Their summary of the budget model: "awesome, but it ain't cheap". Another asks where this cheap model is supposed to be, and how much people actually spend. A third says the premium model is "cheaper and better overall". And a fourth disagrees entirely, pairing two budget models and calling the result "as good as the closed-source SOTA models" at a fraction of the cost.

Everyone is right, because they are paying in different currencies.

| Pricing mode | What is capped | What escalation costs | Where "cheap" breaks |
|---|---|---|---|
| Per-token API | Nothing; the bill grows | Extra tokens at premium rates | Long consult packets |
| Flat plan | Messages or a rolling window | A slice of a quota you already paid for | Hitting the window mid-task |
| Local model | Your hardware and patience | Electricity and wait time | Quality ceiling |

On a flat plan, the premium model may be the cheaper one per task, because the marginal token is free until the window closes. Escalation then is not "spend more money". It is "pick which quota to burn".

For the per-token view, one poster's table listed list prices of about $5/$25 per million input/output tokens for a frontier model, about $1.75/$14 for a mid-tier one, and about $0.10/$0.30 for a tiny budget one. That is a fifty-fold spread on input. It is one person's summary, not a quote sheet, but it is the arithmetic the cheap-driver idea leans on.

The practical advice: measure **cost per completed task**, not cost per token. A model that is five times cheaper per token and needs four times the turns is only slightly cheaper, and you also spent your afternoon on it.

## Line item three: the harness tax

The same model can produce very different bills depending on the harness around it. A developer compared four coding harnesses on one small bugfix task with the same model. All were correct. The numbers, in round figures: two harnesses landed near two minutes and half a million input tokens with about 90% cache hits. A third took more than twice as long and about 3.5 times the input tokens, and was dropped from the comparison.

Same model. Same bug. A 3.5x difference in context tokens.

The second phase of that comparison has the more valuable lesson. A missing model alias in a proxy made one harness silently fall back to a different model for four tasks. The results looked like a harness comparison. They were a model comparison.

If you route between models, a router or a proxy can silently invalidate your measurements, and your bill. So:

- **Log the model that actually answered every turn**, not the one you asked for.
- Alert when the answering model differs from the requested one.
- Re-run comparisons on your own repository with a fixed task list. One repo, one task and one machine is anecdote, however tidy the table.

One more observation from that thread: the real benchmark is whether the agent passed *without touching files it should not*. A correct answer that also rewrote unrelated code is a debit, not a credit.

## Line item four: more agents, more context, no gain

It is tempting to treat multi-agent orchestration as a free upgrade. Experienced developers disagree. One said that super-agents "take up way more context than their worth", with "no measurable improvement to the outcome other than slower time and more money".

Another developer found a subagent extension "too loose, opaque and difficult to steer" and began leaning toward a deterministic graph or plain script. Replies were revealing. One person has an agent write a script against an issue board, but wants "a little more inline human review". One runs fifteen sequential steps from markdown in the system prompt and expects it to break at scale. Others point to workflow engines, "or even Jenkins".

Parallel agents in isolated VMs solve a real problem, namely port and localhost conflicts when several runs happen at once. They do not solve the spend problem. Nothing in that setup caps the bill.

The routing rule that follows: escalate one decision to one stronger model. Do not fan out ten.

## Line item five: why people hedge across providers

The cost-side stories give the hedging instinct its urgency. These are all as reported by individuals, so verify before quoting:

- A large company reportedly burned through a year's AI coding budget in a third of the year, at hundreds to a couple of thousand dollars per engineer per month.
- A team woke up to a five-figure cloud invoice after a runaway agent loop, with cost anomaly detection that "failed entirely".
- A poster argued that current prices are subsidized and asked a pointed question: do you model your own usage assuming cost goes up three to five times, and do you have a fallback?

The details vary, but the mechanism is real. A loop with no ceiling and a billing system that alerts after the fact is a recipe for a surprise.

The dependency side is quieter and arguably worse. An analysis of several thousand sessions reportedly found that after a provider changed a default effort level, thinking depth dropped sharply and the agent read fewer files before editing. The poster's conclusion: "If your workflow can't survive a provider switch, you don't have a workflow."

So keep an off-ramp: a second provider, a local model for the bottom of the ladder, and a pinned effort setting wherever the provider lets you pin one.

## Line item six: the bottom of the ladder

The cheapest tier is local. Two leads, both single-user claims. One reports that an open pipeline on a $500 consumer GPU beat a frontier model on a coding benchmark, at a fraction of a cent of electricity per task. The mechanism matters more than the headline: generate several candidate solutions, run tests, pick the one that passes. Generate, test, select. Another reports a 12B model at Q4 on a 3090 doing around 15 tokens per second, "totally usable for dev work".

Both are leads, not conclusions. But the mechanism, where a test suite does the selecting, is the part that transfers to any tier.

## Line item seven: every router is code with your keys

Every router and advisor extension is more code that can read your API keys. Project-local extension loading made one thread call it a "security nightmare": packages listed in a settings file, skills carrying scripts. Mitigations: a sandbox, loading skills only from the global directory, pinning and auditing. The counterpoint was fair. Editors, environment loaders and Git hooks have always had this property.

A good rule from the thread: "I try to use skills instead of extensions, wherever possible." Keep the set small.

## The deterministic version of all this

Strip away the extensions and the pattern reduces to something plain.

You pick the files that go into the prompt. That is a consult packet you built on purpose, sized to the window of whichever model you call. You pick the model per request, by hand, with your own key. You apply the answer as a Search/Replace block and review it as a normal Git diff. And every call lands in a usage record, so cost per task is a number you read, not a number you reconstruct.

That is "manual switching" with better instruments. It will not out-automate a good router. It will, however, never route your whole session to the wrong model without telling you.

Autonomous routing is genuinely useful in a prototype or a pipeline where nobody is watching. On a codebase that matters, a human choosing the advisor for the 5% is cheap insurance.

## The checklist

1. Decide the pricing mode first: per-token or flat plan.
2. Measure cost per task, not per token.
3. Define escalation triggers a counter can detect, and log each one.
4. Size each consult to the advisor's real window.
5. Record which model answered every turn.
6. Keep a second provider and a local model as an off-ramp.
7. Prefer scripts for pipeline steps; use fan-out only where you can show a gain.
8. Audit and pin extensions.

## FAQ

**If the premium model is better, why not use it for everything?**
On a flat plan, that is sometimes exactly right. On per-token billing, mechanical work at premium rates is where bills balloon for no visible benefit.

**Does a second opinion actually catch errors, or just add confident noise?**
It helps when the question is narrow and the packet contains the failing hypothesis. A vague "is this good?" gets a fluent, unhelpful answer.

**Isn't manual switching just laziness dressed up as principle?**
It is the baseline any automation must beat, and it keeps a human in the loop at the moments that matter. Automation wins when the triggers are objective and logged.

**What if my provider changes something and my results shift?**
They will, eventually. Pin what you can, keep a fallback, and compare against a fixed task list rather than your impressions.

## Key Takeaways

- The pattern is a cheap driver plus an occasional expensive advisor, but "cheap" depends on whether you pay per token or by flat plan.
- Size every consult to the advisor's window, and log which model actually answered each turn.
- One escalation to one stronger model beats a fan-out of agents, and a script you can read beats an orchestrator you cannot.

*Cost you cannot see is cost you cannot cut; make the meter part of the workflow.*
