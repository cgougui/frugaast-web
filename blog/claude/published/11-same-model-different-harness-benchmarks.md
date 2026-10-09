Same cheap model. Same thirty tasks. Same verifier. One harness paid $0.028 per success, another $0.195. Nothing changed except the wrapper around the model, and the bill moved by a factor of seven.

## A table with a suspicious number

A developer runs thirty agentic tasks through four harnesses. Same cheap open-weight model, same tools exposed through a shared router, a 900-second cap per task, and an external verifier. Results like these circulate (composite):

| Harness | Passed | Cost per success | Median time | Tokens per task |
|---|---|---|---|---|
| Minimal (4 tools) | 20/30 | $0.028 | 132s | ~560k |
| Heavy A | 16/30 | $0.195 | 123s | ~740k |
| Heavy B | 16/30 | $0.081 | 245s | ~665k |
| Mid-weight C | 14/30 | $0.073 | 130s | ~690k |

The author's explanation is tidy. The minimal harness ships four tools (read, write, edit, bash) and a system prompt under 1K tokens. A heavier one loads about 33K tokens of prompt and tool schemas into context before you type anything. Another published result points the same way: a premium model on a feature-heavy harness used about 3x the tokens per task of a minimal one, with the same success rate.

But look at the numbers again. Tokens per task differ by about 1.3x between best and worst. Pass rate differs by 1.25x. Multiply them and you'd expect about a 1.6x gap in cost per success. The table shows 7x.

Something else is going on, and it's almost certainly the cache. Providers charge a fraction of the normal price for cached input. A harness whose requests keep an identical prefix turn after turn pays that small price for most of its tokens. A harness that shuffles, rewrites or truncates the prefix pays full price for the same volume. The post doesn't split cache reads from fresh tokens, so the 7x can't be explained from what was published. The best evidence in this area is about exactly this, though.

The anecdotes point at the same mystery: "estimated $13, real $2.60" with no method; users of a very short system prompt reporting fewer tokens and better focus. All consistent with a harness tax. None of them says where it's collected.

So I went through the suspects one by one.

## Suspect one: prompt and tool-schema bulk

The simplest theory is weight. Every request carries the system prompt, tool definitions, rules file and any skills. Ship thirty tools and you carry thirty schemas, every turn, forever.

People who measure this report starting contexts from about 200 to 300 tokens (deferred tools, explicit caching) up to 26K (thirty tools plus system prompt plus skills). One user tracks starting context against what each extension is actually used for, and calls it "often eye opening".

The usual fix is lazy loading. Skills and tool servers get a one-line stub and only expand when needed, which brings starting context down to 8 to 10K. One web tool returns a 50KB page as roughly 500 characters through a `focus` parameter.

A fair counterpoint: "90% of extensions could be a skill file," says one engineer, and a critic of sprawl notes that yesterday's update broke a lot of extensions. Bulk costs money, but fragility costs too.

Prompt weight explains part of the gap. Since cached tokens are cheap, it can't explain 7x on its own.

## Suspect two: the loop

The second theory is behavior. A harness isn't just a prompt. It's a loop that decides when to stop.

The cleanest controlled comparison I found pits a minimal harness against its own feature-rich fork: more than thirty tools, hash-anchored edits, language-server integration, a debugger, a scripting kernel, a browser. Thirty hard tasks, same cheap model, same verifier, same 900-second cap. The minimal one passed 20 with a median of about two minutes. The fork passed 17 with a median of about four and a half.

The task breakdown is what matters. Both passed the same 16 and failed the same 9. The whole gap is in five tasks: the minimal harness won four and the fork won one.

And in those five, the failure was behavioral. The fork found the right data and kept working until it ran out of time or context. One task ran 1.2M tokens and 861 seconds because the agent wanted one more page of results. Another burned 1.8M tokens and passed 3 of 13 verifier checks. A loop that doesn't know when it's done runs to the cap, and the cap is where your money goes.

So on this model, the extra tooling didn't help: "More tooling did not win."

The same post has evidence against its own headline, though. On a separate benchmark of sixteen models doing edit tasks, hash-anchored edits raised success rates by about 15 points on average, and for one weak model from 6.7% to 68.3%. The fork's edit tool helps models that are bad at producing exact edits, even if its loop hurts here.

The skeptics disagreed in useful ways:

- For this model, vanilla is "much better" once all extensions are removed.
- This model's thinking is "anxious" and burns tokens on ambiguity, so it might be a model quirk.
- "Such a stupid test, as soon as you do real work the feature-rich one is far superior."
- Minimal "would surprise me on long-horizon tasks, you need subagents to control context size."

All plausible, none measured. And one lead engineer who moved from a heavy harness to the fork reports faster, cheaper, better results on a complex project, with a five-hour limit going from used up in an hour to 25% used. An anecdote, but the opposite anecdote counts too.

## Suspect three: obedient models change the verdict

The harness effect isn't constant. It depends on the model.

In an edit-precision benchmark with six harnesses, eleven models and 226 tasks, one model known for following instructions scored 98.9% on its best harness and 70.2% on its worst. Same model, a nearly 29-point swing from the wrapper alone. Meanwhile, an open-weight family scored consistently across all harnesses, and surprisingly high. The author's reading: the harness matters most for models that follow instructions closely, because the harness is what they're following.

That's why a ranking measured on one model doesn't transfer. As one engineer said of a harness leaderboard, it was "benchmarking how [one model] does in each harness", not how the harness does in general.

Quality-sensitive work flips results again. In one informal head-to-head with the same premium model at maximum thinking, the same prompt, and a self-contained physics project, the minimal harness scored about 7.5 out of 10 and the full-featured one 8.7. The winner had cleaner architecture, better tests and a faster benchmark (about 0.20 against 0.68 ms per step), though the loser had a more sophisticated contact solver. The author admitted it wasn't scientific: one task, one judge. But it's the honest caveat to every cheap-model result above. Pass/fail on short tasks rewards stopping early.

## Suspect four: requests that break the cache

Now the best evidence. Three independent reports found the cost problem wasn't harness size at all. It was a mismatch between how the harness shaped its requests and how the provider or local runtime cached them.

**The reasoning flag.** A developer on a subscription plan noticed that multi-step tool turns ate 10 to 20% of a session limit per task, even under 50K tokens of context, five to ten times faster than in another harness. The trace led to one request parameter. The provider's default is to clear previous reasoning on each turn (`clear_thinking` set to true). The harness never sent that parameter, but always resent the previous reasoning in the history. So the provider saw a changed prefix every time and billed all of it again. The other harness explicitly set the flag to false for that provider. A fix landed upstream.

**The chat template.** A developer running a 4B model locally found that the shipped chat template dropped earlier thinking blocks from the history. The local server saw a different prompt every turn, so the KV cache had to recompute the entire conversation each time. A custom Jinja template fixed it.

**An extension fighting the SDK.** A user of third-party models saw cache usage reset to 0% after every response and suspected a caching extension was fighting the SDK.

Three setups, three layers, one mechanism: a prefix that isn't byte-identical from one turn to the next. It's a hypothesis, but it's the only one that fits the unexplained 7x.

People who care have tuned for it. One user reports over 99% cache hits after setting cache hints. Another keeps a starting context of roughly 200 to 300 tokens with deferred tools, explicit caching and placeholder strings, and appends anything dynamic to user messages instead of inserting it into the cached prefix.

One caution: routing each prompt to a different model kills caching, so a router can cost the same or more. "If you route per task, why not just pick the model for the task".

### A check you can run today

You don't need anyone's permission to test this.

1. Log the outgoing request body for two consecutive turns.
2. Compare them byte for byte up to the new user message. Everything before it should be identical.
3. Check whether previous reasoning gets resent, and whether the provider has a flag that says what to do with it.
4. Compare the cached-token count in the provider's response with what you expected.
5. If it's low, bisect: remove one extension or template change at a time.

## What both camps get right

The threads land in three positions:

- "The more you control your context, the better results."
- Comfort that the heavy harness is "more engineered by others".
- "The harness is just well-designed and minimal; the model's intelligence is what matters."

My synthesis: minimal wins on cost and predictability for short, well-scoped tasks on cheap models, and heavier setups win when the work is long, parallel, or needs guardrails. Runs with an orchestrator, planner, implementer and verifier that last for days really do need subagents and checkpoints, though skeptics point out that the hard part is splitting issues so the merges don't collide.

Safety cuts the other way. A minimal harness often ships with no sandbox at all. Users add one with containers, permission layers and budget checks before any unattended run. The reply that stuck with me: "imagine waking up to find your entire PC deleted".

One pattern shows up across the cost threads: plan with a frontier model, implement with the cheap one, and call an advisor when stuck. One developer ran the cheap model for half a day: 58.6 million tokens for under forty cents. But it sometimes ignored a custom instruction. Cheap still has friction.

## Or assemble the context yourself

This whole investigation is about what happens between your intent and the model's input.

An agent loop decides which files to read, how many tool results to append, when to compact and when to stop. Each decision is a variable you didn't set and can't easily see. The bulk, the runaway loops, the cache misses, the cursed sessions: they all come from letting a loop assemble the context.

The deterministic alternative is plain. You pick the exact files that go into the prompt, so the prefix is as small and stable as you make it. You use your own key, so every call is billed on a named model at a rate you can read, and the cost per task is a log entry, not an estimate. The model answers with search/replace blocks, you apply them, and the result is a normal Git diff you review and commit.

Autonomous harnesses have real strengths, especially for exploring greenfield ideas. But for work on an existing codebase with a budget, the cheapest harness to debug is the one with nothing to debug.

## Benchmarking your own wrapper

1. Fix the model and the provider. Repeat each task enough times, since runs are random. Cap time and tokens. Use an external verifier.
2. Report pass rate, median time, tokens per task, cache reads versus fresh input, and cost per success, not just cost per run.
3. Diff the first-turn context: system prompt, tool schemas, rules file, skills.
4. Check that the cached prefix stays stable across turns, and check provider-specific reasoning flags.
5. Test at least two models: one that follows instructions closely and one cheap open-weight model.
6. Include one long, quality-sensitive task so the benchmark doesn't reward quitting early.
7. Take the cheap wins: lazy-load skills, run subagents without extensions, give weak models a strong edit tool, plan on a frontier model and implement on a cheap one, and sandbox before unattended runs.

Thirty-task benchmarks are too small to trust as rankings. What's useful is the mechanism (a stable cache prefix, a loop that knows when to stop), because you can reproduce it on your own setup. And until you log cached-token counts per turn, you can't tell whether the model or the request shape is to blame. If the counts are low while the prefix looks stable, suspect the request shape first.
