I switched to a lean harness expecting my usage meter to calm down. Instead I hit the five-hour cap after one long afternoon, while a colleague on the same setup never noticed a limit. I'd trimmed the system prompt to the bone and still couldn't say where the tokens were going.

Other people report the same puzzle. One gets capped within hours on a subscription plan, even at low reasoning effort, after removing tool servers and shortening the system prompt. Another runs several agents in parallel all day on a mid-tier plan and ends the month with tokens to spare.

The claims about the baseline are all over the place too. Some say the lean harness ships a system prompt of about 1,000 tokens, against 15,000 to 30,000 for the big agentic suites. A chatbot project reports that a bare "hello" costs under 1,500 tokens, versus roughly 20,000 on heavier setups, and someone replied that the real figure is "way less than 1500". All anecdotes, as even the person posting the number admitted.

So if the baseline is that small, where does the spend come from? From everything you add after the first turn.

## What loads before you start

You can't cut what you can't see, so measure first.

One practitioner ran the harness in "bare bones" mode, using flags to turn off context files, extensions, skills, prompt templates and themes. The first question used 2.5% of a 66,000-token local context. Their own modest, carefully built setup, with the usual skills and context files, started at 21.5%. Almost ten times more before any real work.

An easy way to compare is two shell aliases: one that launches fully loaded, and one that launches bare with a short appended system prompt. Switch between them and compare the number after the first reply.

Another engineer replaced the whole system prompt with a two-line override file and said it helped a lot. The lesson isn't "use two lines". It's that the system prompt is configuration, and configuration can be audited.

A single percentage is a blunt instrument, though. A meter split into system prompt, user prompts, assistant replies, thinking, tool results and free space turns a vague feeling into something you can tune. You can see which slice grew.

For local models it matters more. When hardware limits a model to 40,000 to 100,000 tokens of context, every preloaded token is one that can't hold your code.

The counterargument: in the era of 128,000-token windows, harness size was a big deal, but with million-token models it's "more cosmetic". That's only true if you don't pay per token and don't have a five-hour cap. If you do, it's not cosmetic. It's the invoice.

## Test output is the biggest leak

A project with about 1,500 tests can burn over 100,000 tokens on one full run, even with a terse reporter and no colors. Put that in an agent loop and the bill climbs fast. The proposed fix is to run the suite in a script and only call the model when something fails.

The pushback came quickly, and it was right: running tests should cost almost nothing, and feeding the full output to a language model "makes no sense". Run a normal CI step and bring the agent in after a failure. The number is real, but the cause is how the pipeline was designed, not the harness.

A deterministic version looks something like this:

```bash
#!/usr/bin/env bash
# run tests, keep only failures, hand the model a small summary
out=$(npm test 2>&1) && { echo "all green"; exit 0; }
echo "$out" \
  | grep -A 12 -E '^(FAIL|●)' \
  | head -n 120 > /tmp/failures.txt
pi --print "Fix these failing tests:" < /tmp/failures.txt
```

The model sees the names of the failing tests and the first dozen lines of each failure. The 1,400 passing tests never enter the context.

## Trimming tools, and whether they pay off

Output trimmers are popular, and they cause the loudest arguments.

One context-trimming package is the most downloaded of its kind, with a huge monthly count, but one engineer warned the number is inflated by automated installs and recommended a Rust-based output filter instead. Others combine that filter with a second compressor, or use memory and lean-context packages. One user reported measurable savings. Another uninstalled it, because they manage projects by hand and didn't need it.

Then there's the cost that doesn't show up on the savings page. A user running a local model on a Mac found the trimmer sometimes changed the first prompt, which invalidated the context cache and forced the whole prompt to be reprocessed. On that hardware, reprocessing is very slow. They patched it with a custom extension and now doubt it's worth it.

The evidence on the filter itself conflicts. One engineer says it "was recently exposed as not working at all". Another points to a vendor engineering post arguing it doesn't save tokens. The same author lists it in their own stack anyway. It's an open question. Check it on your own sessions before believing anyone, including me.

My takeaway: a trimmer is only a win if it leaves the start of the prompt alone and you've measured it on your own work. Use the split meter before and after.

## The cache is the hidden constraint

This is the part most people miss.

A prompt cache works on a prefix. If the start of your request is byte-for-byte identical to the last one, the provider reuses its earlier work and charges a fraction for those tokens. Change something near the front and everything after it misses, billed at full price. A hit is a discount. A miss is a surcharge nobody itemizes for you.

That makes some popular features secretly expensive:

| Technique | What it saves | What it can cost | Verdict |
|---|---|---|---|
| Plan-mode extension that edits context on exit | A strict planning mode | A cache miss when the rules prompt is removed | Often a net loss |
| Auto clear-and-continue at a token threshold | Context growth | A fresh prefix after every clear, low cache hits | Depends on provider pricing |
| Output trimmer that rewrites early context | Tool-output tokens | Prefix changes, full reprocessing | Test before trusting |
| Inline small files at the end of the prompt | An extra read round trip | Nothing, if appended at the end | Usually a win |
| Deterministic compaction at a fixed threshold | Context growth | One planned rebuild | Predictable |

The author of a plan-mode extension admitted it mostly causes cache misses on exit. Experienced users skip it: they write "planning only, no file edits, ask questions", save a PLAN.md, or hand off to a new session and continue there.

The clear-and-continue loop (write a handoff document at 80,000 tokens, clear, read it back, repeat forever) got the obvious sarcastic reply about its cache hit rate. Another user preferred deterministic compaction over clearing everything. Both are describing the same trade.

Provider pricing makes this concrete. People calling a provider's API directly, with automatic cached-input pricing, say "you can't beat the auto cached token pricing elsewhere". Others ask how to match the hit rates of harnesses built for that specific provider. A status-bar extension showing peak and off-peak times, and setups mixing several remote providers with a local model, show people watching costs at the provider level.

## Load context on purpose

Some of the best savings are boring:

- **Only the root file loads by default.** An extension can inject subdirectory context files when the model touches that directory. Fair question: does it avoid reloading them on every access? Another engineer just restarts the harness for each project.
- **Reference a file or inline it?** An `@file` mention makes the model issue a read call, which is a whole new request: cache-read cost plus output tokens. Inlining a small file once at the end of the prompt avoids that round trip. For small files, inlining is cheaper. For big ones, it isn't.
- **Subagents isolate context.** "Primary use of agents is to avoid context pollution." True. But one engineer found the default explore subagent quietly ran a cheaper model on their paid tokens, and in another setup subagents burned credits and ran slowly. A third preferred doing it manually: plan, switch model, implement, switch back, review. Warnings about coordination overhead and duplicated work are fair, and subagents on a 376,000-token plan reportedly died from running out of context.
- **Memory.** There are lots of packages. The top reply to a question about them was: "None". Keep conventions in the instructions file, written as a router to topic files, and use a tree view with summaries.

## Spending less per token

Routers pick a model based on task complexity, live pricing and the expected cost of a failed attempt. The skeptic's reply was the sharpest: a router can't know that the same change is easy in codebase A and hard in codebase B. What people actually report is manual routing: a strong model plans and reviews, a cheap one implements, and the reviewer isn't that same cheap model. A footer widget showing cost and quota keeps it honest. Reports about subscription terms are anecdotal, so check them yourself.

## Lean harnesses have hidden costs too

A heavy user, burning billions of tokens a month across plans, described a model that wouldn't stop for input and once ran a hard reset that lost hours of work. They asked whether the harness had cut muscle along with the fat.

The replies were measured. A lean harness gives the model less guidance, so strong models do fine and weaker ones need more handholding. Some alternatives ship prompts tuned per model. A plain lean setup won't beat a mature agent without some investment. And some models "like git reverts", so a permission plugin helps.

Auto-mode guards with deny rules and classifiers, or a local rule set with a danger score that fails closed, are the price of that freedom. But a classifier call costs tokens too, and a model can get around filters by writing a script. There was also a regression where strict JSON schemas broke local models until people pinned an older version or turned off strict tool mode in the model config.

What you save by removing guidance, you pay back in retries, failed edits and recovery. Count the whole session, not just the first turn.

## Stop paying for context nobody chose

Every item above comes back to one idea.

A deliberate workflow looks like this. The developer picks the exact files for the prompt, using a tree and a fuzzy finder, so the first turn contains the code that matters and nothing else. The model returns search/replace blocks, which get applied as a normal Git diff and committed. No loop re-reading the repo, no memory layer rewriting the prefix, no trimmer racing the cache. Since the prompt is assembled by hand, it's also stable: the prefix can stay identical across turns, which keeps cache hits high. And with your own key, the cost of each request is a number you can see, not a mystery inside a plan's quota.

Agentic loops are still the right tool for exploration, when nobody knows which files matter. The trouble starts when a known, bounded change gets run through an exploratory loop and billed like one.

## Checklist

1. **Get a baseline.** Run bare, note the context percentage after the first turn, then add extensions, skills and context files back one at a time while watching the breakdown.
2. **Use the instructions file as a router.** Keep it short and point to topic files. Load subdirectory files lazily.
3. **Keep noisy output out.** Run tests and CI in scripts and pass only the failures. Poll long jobs with a scheduler.
4. **Only use prefix-stable tricks.** Test every trimmer, plan mode and clear loop for its cache hit rate on your provider.
5. **Compact at a threshold.** The reports put it around 40,000 to 80,000 tokens, ideally with deterministic compaction and handoff files.
6. **Route by role.** A strong model to plan and review, a cheap model to implement, a different model to review. Check which model your subagents use by default.
7. **Guard destructive commands,** and pin the harness version.
8. **Log tool errors,** and fix the most common kind before buying more quota.

A smaller system prompt is better only up to a point. Too thin, and the cost moves into retries and failed edits, so measure tokens per finished task, not tokens per first turn. Million-token windows don't change that: the window is a ceiling, but you pay for every token you send, and long contexts get worse before they run out. Picking files by hand is slower on your first task in an unfamiliar codebase. On repeated work in a codebase you know, picking five files takes less time than waiting for an agent to find them again.
