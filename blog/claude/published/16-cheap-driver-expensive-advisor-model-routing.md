Paying premium rates for a model to rename variables is an easy mistake to fix. Split the work: a cheap model types, an expensive one advises. The catch is that the split has a bill of its own, and almost nobody reads it.

Here's the setup more and more people run. A cheap model is the "driver". It handles edits, tests, refactors, "the mechanical grind". Then there's a tail of maybe 5% of decisions the driver shouldn't own: "the architecture fork", "is this even the right approach", and the bug it has been "circling for twenty minutes, confidently wrong". For those, a stronger model gets asked to steer and check. The cheap model types; the expensive one thinks, now and then.

One practitioner does it by hand. A budget model through an aggregator costs "a few cents per large request", maybe ten dollars for a month of general use, and they switch to a premium model when they "jump into coding territory". Same split, with a human as the router.

The pattern is appealing, and appealing patterns tend to hide their invoices. So here's what each part costs, who pays, and what's capped.

## Three ways to route

Each way of escalating has a price that isn't on the pricing page.

**1. An advisor extension.** A consult tool gives you a "quick second opinion", a "council" of advisors with different stances, or a "debate" between two. A council can mix transports: one advisor called over an API, another through a command-line client.

**2. An automatic router.** Several packages already exist, and the niche is crowded. They differ in what triggers a switch (turn count, task type, keyword, context size). Check the details in each repository rather than trusting a thread that only lists names.

**3. Switching by hand.** One reply simply suggests staying open to switching models manually. That's the baseline. If an automatic router can't beat "switch models by hand when stuck", it's a hobby, not a saving.

Here's an example escalation policy (my sketch, not from the threads):

| Situation | Driver | Advisor | Trigger |
|---|---|---|---|
| Routine edit, test, refactor | Cheap model | None | Default |
| Same error after N turns | Cheap model | Strong model, one consult | Stuck counter |
| Schema or architecture change | Cheap model proposes | Strong model reviews the plan | Before the change |
| Pre-merge review | Cheap model wrote it | Strong model reads the diff | Before merge |

None of these triggers is "the model feels unsure". Models are bad at knowing when they're wrong. Use triggers a counter or a calendar can detect.

One practitioner sketched a deterministic version in bash for a "software factory": one non-interactive call per stage, for writing the spec, writing the plan, executing it, a quick review-and-fix pass, and finally a full code review done by a different model. Review is the one step that gets a second opinion. That's routing as a plain script, with no orchestrator deciding anything.

## The advisor that can't hold your session

The first failure is almost comic. The author of one consult extension built a new one because the previous advisor extension "kept dying mid-session". It forwarded the entire session to the advisor "without checking whether the advisor's own context window could hold it". The second opinion failed exactly when a long session needed it most.

The reported fix was to size each consult to that advisor's actual window. Different models have different windows.

The general lesson: a consult is a packet, and a packet has a budget. A good one contains:

1. the task, in two sentences;
2. the constraints you've already set;
3. the failing hypothesis: what was tried and why it didn't work;
4. the relevant diffs, not the whole transcript;
5. a clear question.

If the packet doesn't fit, the extension has two honest options: summarize, or refuse and say so. The dishonest option is to truncate silently and get a confident answer to half a question. (That's my general advice; the thread only reports the window-sizing fix.)

There's a token-diet cautionary tale too. A package that wraps tools to keep sessions compact claimed to "cut token usage roughly in half" on benchmark tasks. One tester "didn't see the reduction expected". Another joked about stacking four different context-saving tools. Compaction tools don't add up. Each one assumes it's the only thing rewriting the context.

## Is the cheap model even cheap?

The premise doesn't hold for everyone, and the disagreement is instructive.

One camp prefers a premium model through a flat $20 subscription and gets "FAR better limits". Their verdict on the budget model: "awesome, but it ain't cheap". Another asks where this cheap model is supposed to be, and how much people actually spend. A third says the premium model is "cheaper and better overall". A fourth disagrees completely, pairing two budget models and calling the result "as good as the closed-source SOTA models" at a fraction of the cost.

They're all right, because they pay in different currencies.

| Pricing | What's capped | What escalation costs | Where "cheap" breaks |
|---|---|---|---|
| Per-token API | Nothing; the bill grows | Extra tokens at premium rates | Long consult packets |
| Flat plan | Messages or a rolling window | A slice of a quota you already paid for | Hitting the window mid-task |
| Local model | Your hardware and patience | Electricity and waiting | The quality ceiling |

On a flat plan, the premium model may be cheaper per task, because the next token is free until the window closes. Escalating doesn't mean spending more money. It means choosing which quota to burn.

For the per-token view, one poster listed prices of about $5/$25 per million input/output tokens for a frontier model, about $1.75/$14 for a mid-tier one, and about $0.10/$0.30 for a tiny budget one. That's a fiftyfold spread on input. It's one person's summary, not an official price sheet, but it's the arithmetic the whole cheap-driver idea rests on.

What I'd actually measure is cost per finished task, not cost per token. A model that's five times cheaper per token but needs four times the turns is only a little cheaper, and you also spent your afternoon on it.

## The harness tax

The same model can produce very different bills depending on the harness around it. One developer compared four coding harnesses on one small bugfix with the same model. All four got it right. In round numbers, two landed near two minutes and half a million input tokens, with about 90% cache hits. A third took more than twice as long, used about 3.5 times the input tokens, and was dropped from the comparison.

Same model, same bug, 3.5x the context tokens.

The second phase of that comparison had the more valuable lesson. A missing model alias in a proxy made one harness silently fall back to a different model for four tasks. The results looked like a harness comparison. They were a model comparison.

If you route between models, a router or proxy can silently invalidate your measurements, and your bill. So:

- **Log which model actually answered each turn,** not the one you asked for.
- Alert when the answering model differs from the requested one.
- Rerun comparisons on your own repo with a fixed list of tasks. One repo, one task and one machine is an anecdote, however tidy the table.

One more point from that thread: the real test is whether the agent succeeded without touching files it shouldn't have. A correct answer that also rewrote unrelated code counts against it.

## More agents, more context, no gain

It's tempting to treat multi-agent orchestration as a free upgrade. Experienced developers disagree. One said super-agents "take up way more context than their worth", with "no measurable improvement to the outcome other than slower time and more money".

Another found a subagent extension "too loose, opaque and difficult to steer" and started leaning toward a deterministic graph or a plain script. The replies were revealing. One person has an agent write a script against an issue board, but wants "a little more inline human review". One runs fifteen sequential steps from markdown in the system prompt and expects it to break at scale. Others point to workflow engines, "or even Jenkins".

Running parallel agents in isolated VMs solves a real problem: port and localhost conflicts when several runs happen at once. It doesn't solve spending. Nothing in that setup caps the bill.

So the rule I'd take away: escalate one decision to one stronger model. Don't fan out ten.

## Why people hedge across providers

The cost stories explain the urge to hedge. These are individual reports, so check them before quoting:

- A large company reportedly burned through a year's AI coding budget in a third of the year, at hundreds to a couple of thousand dollars per engineer per month.
- A team woke up to a five-figure cloud invoice after a runaway agent loop, with cost anomaly detection that "failed entirely".
- One poster argued that current prices are subsidized and asked: do you model your own usage assuming costs go up three to five times, and do you have a fallback?

The details vary, but the mechanism is real. A loop with no ceiling and a billing system that alerts after the fact is a recipe for a surprise.

The dependency risk is quieter and arguably worse. An analysis of several thousand sessions reportedly found that after a provider changed a default effort level, thinking depth dropped sharply and the agent read fewer files before editing. The poster's conclusion: "If your workflow can't survive a provider switch, you don't have a workflow."

So keep an exit: a second provider, a local model for the bottom of the ladder, and a pinned effort setting wherever the provider lets you pin one.

## The bottom of the ladder

The cheapest tier is local. Two leads, both single-user claims. One reports an open pipeline on a $500 consumer GPU beating a frontier model on a coding benchmark, for a fraction of a cent of electricity per task. The mechanism matters more than the headline: generate several candidate solutions, run the tests, keep the one that passes. Another reports a 12B model at Q4 on a 3090 doing around 15 tokens per second, "totally usable for dev work".

Neither is a conclusion. But the mechanism, letting a test suite pick the winner, works at any tier.

## Every router is code holding your keys

Every router and advisor extension is more code that can read your API keys. Loading extensions per project led one thread to call it a "security nightmare": packages listed in a settings file, skills that carry scripts. Mitigations: a sandbox, loading skills only from the global directory, pinning and auditing. The counterpoint was fair: editors, environment loaders and Git hooks have always had this property.

A good rule from the thread: "I try to use skills instead of extensions, wherever possible." Keep the set small.

## Routing by hand, with better instruments

Strip away the extensions and the pattern gets plain.

You pick the files that go into the prompt, which makes a consult packet you built on purpose, sized to the window of whichever model you call. You pick the model per request, by hand, with your own key. You apply the answer as a search/replace block and review it as a normal Git diff. And every call lands in a usage record, so cost per task is a number you read, not one you have to reconstruct.

That's manual switching with better instruments. It won't out-automate a good router. But it will never send your whole session to the wrong model without telling you.

Automatic routing is genuinely useful in a prototype or a pipeline nobody's watching. On a codebase that matters, having a human choose the advisor for the 5% is cheap insurance.

## Checklist

1. Know your pricing first: per token or flat plan.
2. Measure cost per task, not per token.
3. Define escalation triggers a counter can detect, and log each one.
4. Size each consult to the advisor's real window.
5. Record which model answered every turn.
6. Keep a second provider and a local model as a way out.
7. Use scripts for pipeline steps, and fan out only where you can show a gain.
8. Audit and pin extensions.

On a flat plan, using the premium model for everything is sometimes exactly right. On per-token billing, paying premium rates for mechanical work is how bills balloon for nothing. A second opinion catches errors when the question is narrow and the packet includes the failing hypothesis; a vague "is this good?" gets a fluent, useless answer. And your provider will change something eventually. Pin what you can, keep a fallback, and compare against a fixed task list rather than your impressions.
