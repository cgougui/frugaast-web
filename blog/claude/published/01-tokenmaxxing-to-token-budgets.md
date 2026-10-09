"Tokenmaxxing is how you keep your job." Three months later, from the same author, on the same dashboard: "Please use tokens wisely." Nobody could say which memo engineers were supposed to have obeyed.

Plenty of engineers have been through the same sequence this year: a mandate to use more, then a bill, then a cap. Here is what's on that bill, line by line, with a note on how much each number can be trusted.

## The numbers going around

A large consumer-tech firm reportedly burned its yearly AI budget in four months. One internal team allegedly used a whole yearly budget in a week on a menial task. A consultant claimed an unnamed company spent half a billion dollars in one month with no license limits, and skeptics immediately suspected a run rate had been reported as actual spend. A developer at a company of about 2,000 people described close to $2M on tokens in a single quarter. Another, at a Fortune 500 firm, described roughly $60,000 a day across the org, one week after a coding-assistant billing change.

None of this is audited. Most of it comes from skeptic-leaning forums, and I'd treat each figure as an anecdote. What's worth noticing is that the stories all have the same shape.

## Usage leaderboards get gamed

An internal "AI usage" leaderboard is the textbook case. Staff padded their scores with pointless activity until the leaderboard was scrapped, with a vice president reportedly saying, more or less, please don't use AI just for the sake of using AI.

The gaming is specific and a little funny. Running the largest model on maximum thinking for a trivial rename. Pointing the agent at a throwaway copy of a repo and discarding the output. One engineer who defaults to a mid-tier model watched their org switch from ranking people by spend to ranking them by efficiency.

Tokens are easy to count. Output quality isn't. "Asking people to maximize token usage is like asking to maximize LoC," as one engineer put it, and we stopped counting lines of code for a reason.

Some of it is confusion rather than bad faith. Engineers say nobody told them whether management wanted big numbers or small ones. A metric with no definition of "good" is just a dare.

If your team measures tokens, expect people to optimize the token count. Measure changes that shipped, got reviewed, and are still running.

## Then metered billing arrived

Here's the sequence engineers describe. All of it is reported, none of it verified:

| Step | What people say happened |
|---|---|
| 1. Flat fee | An assistant plan includes a top model for a low monthly price |
| 2. Squeeze | The top model leaves the cheap tier, rate limits drop, token billing is announced |
| 3. Meter on | One prompt reportedly eats over 30% of a monthly allowance, and org-wide pools show no per-user usage |
| 4. Re-estimate | A vendor's own estimate of average daily spend per developer reportedly doubles, from about $6 to $13 |
| 5. Enterprise switch | Customers move to token pricing; one is quoted as seeing spend "up 7x the first day" |
| 6. Subscription fence | Subscriptions limited to interactive use; scripted or third-party harness use billed at API rates |

Some developers already joke about driving the terminal UI by hand instead of using the headless flag. Another reports $50 a day or more through an editor wrapper on the largest model.

It hurts because nobody can predict tokens per task before sending the prompt. Output tokens cost several times what input tokens cost, and the prompt barely controls how many you get. You can't really budget a number you can't predict.

There's more variance on top. Engineers report that moving from a mid-tier to a top-tier model used roughly ten times the tokens for the same task. That figure is unverified, but the direction is easy to believe.

## Where the tokens actually went

**Tool schemas.** Every connected tool ships its definition into context. A vendor test with 508 tools reported 75.1M input tokens and about $377 per run. Replacing the tools with four meta-tools (list servers, read a signature, get docs, run code in a sandbox) brought it to 5.4M tokens and $29, with all test cases still passing. The savings grew with the number of tools: 58% at 96, 84% at 251, 92% at 508. It's the vendor's own test suite, so take the exact numbers lightly. The mechanism is real, though: context you don't need still gets billed on every call.

One developer said a project-management integration was so large it ate the whole conversation, and recommended replacing it with a skill that just tells the model where the API keys are.

**Context loaded before you type anything.** A one-word greeting consumed about 4% of a session for one user. A tool built to find these "ghost tokens" claims tens of thousands saved per session. That's unverified, but checking what's in context before your first prompt costs nothing.

**Runaway subagents.** In one reported bug, a settings flag meant to disable forked subagents was apparently ignored. A denied permission led the agent to spawn a child, which hit the same wall and spawned another, about fifty generations deep: 1.2M tokens in thirty minutes. One guess was that a "0" got read as "unlimited". Whatever the cause, caps have to be enforced outside the model.

**Retry loops and long deliberation.** One developer let a top model spend about an hour and a half on splitting a component, then did it by hand. Engineers point out that most coding-agent gains come from retries, tool calls, bigger context, compaction and extra integrations rather than one-shot quality. So cost grows with the number of loops.

**Regressions.** Someone claimed that an analysis of thousands of sessions showed the interrupt rate rising twelvefold after a change in how reasoning is displayed. Others blame quantization, or the novelty wearing off. It's contested. But one developer says they now burn through a quarter of their allocation much faster than before, and cost per finished task is the number that matters.

## Rationing, and what it does to people

When the bill lands, finance reaches for caps. Controls people report:

- A per-developer ceiling of about $500 a month, plus "use cheaper models for most work", rolled out in stages.
- A $5-a-day limit.
- Tiers where crossing a threshold notifies your manager and their manager.
- Emails saying, in effect, use worse models and don't use agent mode unless you really need it.
- Plan downgrades before a billing change, followed by people hitting caps within two or three days.

Developers adapt in predictable ways. They save their monthly tokens for one hard feature and write the rest by hand. One used up a monthly allotment in a day.

The same engineers are being told to use AI everywhere and to use less of it. One paraphrased leadership as asking for "10x productivity with 1/10 the token usage".

Not everyone is stuck. A developer already on a cloud provider's token billing just moved off the assistant they were using. Others point out that the move from flat fee to metered billing shifts risk onto the customer, because "user-based pricing shelters you".

## The cost nobody metered

Generating code is cheap. Checking it isn't.

Open-source maintainers report pull-request volume rising while the number of reviewers stays flat, and at least one hosting community reportedly voted 70-30 to ban repositories that are mostly machine-generated. A study cited in one discussion found agentic coding raised commits by about 140% but releases by only about 25%, with human review as the bottleneck. I'd read the paper before quoting those numbers.

Then there's the daily reality: 2,500-line pull requests that sit for a month, where review comments get pasted into a model and its answers get pasted back. A colleague who timed review-and-fix work and found it one minute faster than writing the code by hand.

Token invoices miss all of that. Reviewer hours never get their own line.

Practices engineers say help (anecdotes, not measurements):

1. Stack small pull requests for agent-written code.
2. If you didn't read it, you don't send it.
3. The sender attaches what was checked: tests run, numbers verified against the source.
4. Reviewers can bounce anything without that evidence, no discussion.

A security leader reportedly argued that a human in the loop isn't the gold standard because humans are inconsistent too. The pushback was strong, and the accountability point is the one I agree with: a script an agent wrote is still the responsibility of whoever ran it.

## What people actually did about it

Each of these is either reported by someone who used it or just claimed, and I've marked which.

- **Replace tool bloat with skills or on-demand discovery.** Reported, with the vendor-test caveat above.
- **Log at the tool boundary.** Reported. Wrappers write one line per tool call (timestamp, tool, arguments), so you don't have to read transcripts. Roll up cost per session on top.
- **Run agents with narrow permissions.** Reported. A nearly unprivileged user, no secrets file, no keys, no SSH, and someone reads the diff afterwards.
- **Route between models.** Default to a cheaper model and escalate for hard tasks. One developer disagrees: the bugs from cheaper models cost them more than the top-model bill.
- **Evaluate before tuning.** One author claims harness gains on a benchmark of their own. A single data point.
- **Lock down graders.** A team auditing its own benchmark found that 14% of 340 implementations across 16 configurations had accessed answers they shouldn't have seen. If you compare agents on cost, the grader has to be honest.
- **Local models as a hedge.** Opinion only. Last year's frontier now runs on hardware under five figures; the counterargument is that self-hosting means building infrastructure and guessing capacity. Nobody in these discussions posted a benchmark.

## Is it worth the money?

The skeptics have their examples: a COO who can't tie token use to proportionally more useful features, an engineering org that saw no measurable productivity gain after tripling usage while stability got worse, an executive saying compute now costs more than employees, and a back-of-envelope post claiming that a 40% operating margin on $8K a month of tokens implies $11,200 a month. That last one is the author's arithmetic, not a vendor figure.

Practitioners in the middle say code review by top models "improved enormously" and that clearing low-priority backlog works, but new feature work stalls. Some use models only for examples, explanations, docs and research.

On the optimistic side, a former manager says about 2% of engineers use AI "very effectively" and most firms see 10 to 15% gains. That's plausible, if someone says how productivity was measured.

One data point shows why tokens per day aren't value per day. A user reports a single task worth about $23 of API tokens consuming about 75% of a $20 plan's allowance. It illustrates the subsidy gap without proving it.

## The boring alternative

Look at what the worst line items have in common: context nobody chose, loops nobody bounded, autonomy nobody limited, and a bill that shows up after the fact.

The workflow that avoids all four isn't exciting. Pick the exact files that go into each prompt, so context is a decision. Use your own API key, so the provider's usage page is the source of truth and a spending cap is one setting away. Have the model return search/replace blocks and apply them as an ordinary Git diff that a person reads before committing. Track the cost of each request against the project.

With no subagents, nothing can fork fifty generations deep. With no tool schemas, nothing inflates context that nobody connected. Autonomous agents still make sense for greenfield prototypes, where burning lots of tokens is a fair price for speed. In a mature codebase, I want the tokens to go where a human pointed them.

## Before you turn on metered billing

1. Set hard per-user and per-org caps outside the agent, and get per-user visibility. Alert on daily spend, not monthly.
2. Instrument: a tool-call log, tokens per session, cost per merged pull request, review time per pull request, and reverts and incidents tied to agent changes.
3. Shrink the baseline context. Audit tool schemas and check what's loaded before the first prompt.
4. Route models by task, require a reason to use the top one, and never rank engineers by spend.
5. Guard against loops with harness-enforced depth limits, timeouts, a per-task budget and a kill switch. Test config flags instead of trusting them.
6. Protect review capacity with small pull requests and evidence from the sender.
7. Decide in advance what a good outcome looks like (features shipped, incidents, cycle time), so the next pricing change doesn't turn into a surprise meeting.

Some of this is vendors raising prices, and that part isn't yours to fix. But metering also exposes waste that flat fees used to hide, and that part is. Few of the figures above are reliable, so measure your own repository before trusting any "Nx cheaper" claim, including the ones in this post.
