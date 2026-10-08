# Where the Tokens Go in a Minimal Harness: Cache Hits, Context Budgets and the Limits of "It Uses Fewer Tokens"

A minimal harness can ship a system prompt of around a thousand tokens and still run into a five-hour usage cap. The reason is that spend is decided by what gets loaded, what floods the context and what breaks the prompt cache, not by the size of the starting prompt.

> I switched to a lean harness expecting my usage meter to relax, and instead I hit the five-hour cap after one long afternoon while a colleague on the same setup never noticed a limit. I had trimmed the system prompt to the bone and still could not explain where the tokens were going.

## The ledger lens

This article reads token spend like an accountant. There is a balance sheet. There are line items. And there are a few entries that look like savings on paper and show up as costs in the books.

The starting puzzle is real. Two people run the same harness. One is capped within hours on a subscription plan even at low reasoning effort, after stripping tool servers and shortening the system prompt. Another runs several parallel agents all day on a mid-tier plan and ends the month with tokens to spare.

Claims about the baseline are all over the place too. Some say the lean harness ships a system prompt of about 1,000 tokens against 15,000 to 30,000 for the big agentic suites. A chat-bot project reports that a bare "hello" costs under 1,500 tokens, versus roughly 20,000 for heavier setups, and somebody replied that the real figure is "way less than 1500". Treat all of it as anecdote. Even the person posting the number said so.

So here is the question: if the baseline is this small, where does the spend come from?

Short answer: it comes from everything you add after turn one.

## Line item 1: the first-turn load

You cannot cut what you cannot see. So measure first.

One practitioner ran the harness in "bare bones" mode, switching off context files, extensions, skills, prompt templates and themes with flags. The first question consumed 2.5 percent of a 66,000-token local context. Their own modest, carefully built setup, with the usual skills and context files, started at 21.5 percent. Almost ten times more, before a single real task.

A handy way to keep both modes at hand is two shell aliases: one that launches fully loaded and one that launches bare with a short appended system prompt. Flip between them and compare the number after the first reply.

Another engineer replaced the system prompt wholesale with a two-line override file and said it helped a lot. The lesson is not "use two lines". The lesson is that the system prompt is configuration, and configuration can be audited.

A single percentage is a weak instrument though. A segmented meter, with slices for system prompt, user prompts, assistant replies, thinking, tool results and free space, turns a vague feeling into a tuning knob. You can see which slice grew.

For local models the stakes are sharper. With hardware limiting a model to 40,000 to 100,000 tokens of context, every preloaded token is a token that cannot hold your code.

Now the counterargument, fairly stated. Someone observed that in the era of 128,000-token windows, harness size was a big deal, but with million-token models the choice is "more cosmetic". That holds only if you are not paying per token and not capped per five hours. For anyone who is, it is not cosmetic. It is the invoice.

## Line item 2: tool output and test runs

Here is the biggest single leak.

A project with about 1,500 tests can burn over 100,000 tokens on one full run, even with a terse reporter and no colors. Loop that inside an agent and the bill appears fast. The proposed fix is to run the suite inside a script and call the model only when something fails.

Pushback came quickly, and it was correct: running tests should cost almost nothing. Feeding the full output to a language model "makes no sense". Use a normal CI step, then bring in the agent after a failure. The number is real, but the cause is a pipeline design choice, not the harness.

A sketch of what the deterministic version looks like:

```bash
#!/usr/bin/env bash
# run tests, keep only failures, hand the model a small summary
out=$(npm test 2>&1) && { echo "all green"; exit 0; }
echo "$out" \
  | grep -A 12 -E '^(FAIL|●)' \
  | head -n 120 > /tmp/failures.txt
pi --print "Fix these failing tests:" < /tmp/failures.txt
```

The model sees failing test names and the first dozen lines of each failure. The 1,400 passing tests never enter the context.

## Line item 3: trimming tools, and whether they pay

Trimmers are popular. They also generate the loudest disagreement.

A context-trimming package has been the most downloaded of its kind, with a very large monthly count, but one engineer warned the metric is skewed by automated installs and recommended a Rust-based output filter instead. Others combine that filter with a second compressor, or use memory and lean-context packages. One user reported measurable savings. Another uninstalled it, because they manage projects by hand and found it unnecessary.

Then comes the entry that does not appear on the savings page. A user running a local model on a Mac reported that the trimmer sometimes changed the first prompt, which invalidated the context cache and forced the full prompt to be reprocessed. On that hardware, reprocessing is very slow. He patched it with a custom extension and now doubts the net benefit.

And the evidence on the filter itself conflicts. One engineer says it "was recently exposed as not working at all". Another points to a vendor engineering post arguing it does not save tokens. The same author lists it in their own stack anyway. That is an open claim. Verify it on your sessions before believing anyone, including this paragraph.

The rule that falls out: a trimmer is a win only if it is prefix-stable and measured on your own work. Use the segmented meter before and after.

## Line item 4: the cache is the hidden constraint

This is the part most people miss, so slow down.

A prompt cache works on a prefix. If the beginning of your request is byte-for-byte identical to the last request, the provider reuses its earlier work and charges a fraction for those tokens. Change something near the front, and everything after it is a miss, billed at full price. A cache hit is a discount. A miss is a surcharge that nobody itemizes for you.

Which makes some popular features expensive in disguise:

| Technique | What it saves | What it can cost | Verdict |
|---|---|---|---|
| Plan-mode extension that edits context on exit | A strict planning mode | Cache miss when the rules prompt is removed | Often net negative |
| Auto clear-and-continue at a token threshold | Context growth | A fresh prefix after every clear, low cache hits | Depends on provider pricing |
| Output trimmer that rewrites early context | Tool-output tokens | Prefix changes, full reprocessing | Test before trusting |
| Inline small files at the end of the prompt | An extra read round trip | Nothing, if appended at the end | Usually a win |
| Deterministic compaction at a set threshold | Context growth | One planned rebuild | Predictable |

The author of a plan-mode extension admitted it mostly causes cache misses on exit. Experienced users skip the extension: they write "planning only, no file edits, ask questions", save a PLAN.md, or hand off to a new session and continue there.

The clear-and-continue loop (write a handoff document at 80,000 tokens, clear, read it back, repeat forever) drew the obvious sarcastic reply about the low cache hit rate. Another user preferred deterministic compaction over clearing everything. Both are expressing the same trade.

Provider pricing makes this concrete. People who go straight to a provider API with automatic cached-input pricing say "you can't beat the auto cached token pricing elsewhere". Others ask how to reach the hit rates of harnesses built for that specific provider. A status-bar extension that shows peak and off-peak times, and mixes of several remote providers with a local model, show cost awareness at the provider level.

## Line item 5: loading context on purpose

Some of the best savings are boring.

- **Only the root file loads by default.** An extension can inject subdirectory context files when the model touches that directory. A reasonable question: does it avoid reloading on every access? Another engineer simply restarts the harness per project.
- **Reference a file, or inline it?** An `@file` mention makes the model issue a read call, which is a whole new request: cache-read cost plus output tokens. Inlining a small file once at the end of the prompt avoids that round trip. For small files, inlining is cheaper. For large ones, it is not.
- **Subagents isolate context.** "Primary use of agents is to avoid context pollution." That holds. But one engineer found the default explore subagent quietly used a cheaper model on their own paid tokens, and in another setup subagents burned credits and ran slowly. A third preferred manual plan, switch model, implement, switch back, review. Warnings about coordination overhead and duplicate work are fair, and subagents on a 376,000-token plan reportedly died from context exhaustion.
- **Memory.** Packages abound. The top reply to a question about them was: "None". Keep conventions in the instructions file as a router to topic files. Use a tree view with summaries.

## Line item 6: spending less per token

Routers pick a model by task complexity, live pricing and the expected cost of a failed attempt. The skeptic's reply is the sharpest: a router cannot know whether the same change is easy in codebase A and hard in codebase B. What people actually report is manual routing: a strong model plans and reviews, a cheap one implements, and the reviewer is not the same cheap model. A footer widget showing cost and quota keeps it honest. Provider terms for subscriptions are anecdotal, so verify them yourself.

## The counter-entry: minimal harnesses have hidden costs

A heavy user, burning billions of tokens a month across plans, described a model that did not stop for input and once ran a hard reset that lost hours of work. He asked whether the harness had cut muscle along with weight.

The replies were measured. A lean harness gives the model less guidance, so strong models do fine and weaker ones need handholding. Some alternatives ship per-model prompts. A plain lean setup will not beat a mature agent without investment. And some models "like git reverts", so a permission plugin helps.

Auto-mode guards with deny rules and classifiers, or a local rule set plus a danger score that fails closed, are the cost of that freedom. But note that a classifier call is itself a token cost, and a model can bypass filters by writing a script. There was also a version regression where strict JSON schemas broke local models until people pinned an older version or turned off strict tool mode in the model configuration.

The accounting lesson: savings from removing guidance are paid back in retries, failed edits and recovery. Count the whole session, not turn one.

## Where deterministic control fits

Every line item above comes down to one idea: stop paying for context that nobody chose.

A deliberate workflow looks like this. A developer picks the exact files for the prompt, using a tree and a fuzzy finder, so the first turn contains the code that matters and nothing else. The model returns Search/Replace blocks, which are applied as a normal Git diff and committed. There is no loop re-reading the repo, no memory layer rewriting the prefix, no trimmer racing the cache. Because the prompt is assembled by hand, it is also stable: the prefix can stay identical across turns, which keeps cache hits high. And with a bring-your-own-key setup, the cost of each request is a visible number, not a mystery inside a plan's quota.

Agentic loops are still the right tool for exploration, where nobody knows which files matter. The problem starts when a known, bounded change is run through an exploratory loop and billed like one.

## A practical checklist

1. **Baseline.** Run bare, record the context percentage after the first turn, then add extensions, skills and context files back one at a time while watching the breakdown.
2. **Instructions file as a router.** Keep it short and point to topic files. Load subdirectory files lazily.
3. **Noisy output stays outside.** Run tests and CI in scripts and pass only failures. Poll long jobs with a scheduler.
4. **Prefix-stable only.** Test every trimmer, plan mode and clear loop for cache hit rate on your provider.
5. **Compact at a threshold.** Somewhere around 40,000 to 80,000 tokens in the reports, ideally with deterministic compaction and handoff files.
6. **Route by role.** Strong model for plan and review, cheap model for implementation, a different model for review. Check subagent default models.
7. **Guard destructive commands** and pin the harness version.
8. **Log tool errors** and fix the top error class before buying more quota.

## FAQ

**Is a smaller system prompt not simply better?** Only up to a point: a prompt too thin pushes cost into retries and failed edits, so the right measure is tokens per completed task, not tokens per first turn.

**Why not let a compression tool handle all this automatically?** Some do help, but any tool that rewrites the beginning of the conversation can destroy cache hits, so the savings need to be measured against your own provider's cache billing.

**If million-token windows exist, why budget at all?** Because windows are a ceiling and bills are a floor: you pay for every token you send, and long contexts degrade quality before they run out.

**Isn't manual file selection slower than letting an agent explore?** On the first task in an unfamiliar codebase, yes. On repeated work in a codebase you know, picking five files takes less time than waiting for an agent to rediscover them.

## Key Takeaways

- Spend is set by the first-turn load, tool-output floods and cache invalidation, so measure with a breakdown before changing anything.
- A savings trick that edits the front of the prompt can cost more than it saves; prefer prefix-stable, deterministic techniques.
- Count whole sessions, including retries and recovery, because a leaner harness only wins if the work still lands on the first attempt.

*A token you chose to send is an investment; a token someone else decided to load is a tax.*
