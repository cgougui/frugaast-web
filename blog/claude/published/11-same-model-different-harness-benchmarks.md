# Same Model, Different Harness: Reading a 7x Cost Gap Like a Crime Scene

Hold the model fixed, swap only the wrapper, and the bill moves a lot. The interesting question is why, and the answer is rarely the one on the headline slide.

> I read a post that said "estimated $13, real $2.60" and felt both vindicated and suspicious, because my own invoice had never matched my own estimate either. Nobody could say which part of the wrapper was responsible, and neither could I.

## The scene: a table with a suspicious number

A developer runs thirty agentic tasks through four different harnesses. Same cheap open-weight model, same tools exposed through a shared router, a 900-second cap per task, an external verifier. A composite of the kind of result that circulates:

| Harness | Passed | Cost per success | Median time | Tokens per task |
|---|---|---|---|---|
| Minimal (4 tools) | 20/30 | $0.028 | 132s | ~560k |
| Heavy A | 16/30 | $0.195 | 123s | ~740k |
| Heavy B | 16/30 | $0.081 | 245s | ~665k |
| Mid-weight C | 14/30 | $0.073 | 130s | ~690k |

The author's explanation is tidy. The minimal harness ships four tools (read, write, edit, bash) and under 1K tokens of system prompt. A heavier one puts around 33K tokens of prompt and tool schemas into context before the first user message is even typed. Another published result points the same way: a premium model on a feature-heavy harness used about 3x the tokens per task of a minimal one, at the same success rate.

Tidy stories deserve a cross-examination.

Look at the numbers again. Tokens per task differ by about 1.3x between best and worst. Pass rate differs by 1.25x. Multiply them and you expect roughly a 1.6x gap in cost per success. The table shows 7x.

Something else is in the room.

That something is almost certainly the cache. Providers price cached input at a fraction of fresh input. A harness whose requests keep an identical prefix turn after turn pays the small price for most of its tokens. A harness that shuffles, rewrites or truncates the prefix pays full rate for the same volume. The post does not break out cache-read versus fresh tokens, so the 7x figure cannot be explained from what was published. Treat it as an unsolved case, because the best evidence in the area is about exactly this.

Anecdotes point at the same mystery: "estimated $13, real $2.60" with no method given; users of a very short system prompt reporting fewer tokens and better focus. All consistent with a harness tax. None says where it is collected.

## Suspect one: prompt and tool-schema bulk

The simplest theory is weight. Every request carries the system prompt, the tool definitions, the rules file and any skills. Ship thirty tools and you carry thirty schemas, every turn, forever.

People who measure this report starting contexts from about 200 to 300 tokens (deferred tools, explicit caching) to 26K (thirty tools plus system prompt plus skills). One user tracks initial context against what each extension is actually used for: "often eye opening".

The recurring fix is lazy loading. Skills and tool servers get a one-line stub and expand only when needed, dropping starting context to 8 to 10K. One web tool returns a 50KB page as roughly 500 characters through a `focus` parameter.

A fair counterpoint: "90% of extensions could be a skill file," says one engineer, and a critic of sprawl notes that yesterday's update broke a lot of extensions. Bulk is a cost, but so is fragility.

Prompt weight explains some of the gap. Because cached tokens are cheap, it cannot explain 7x by itself.

## Suspect two: the loop

The second theory is behaviour. A harness is not just a prompt. It is a loop that decides when to stop.

The cleanest controlled comparison in the field is a minimal harness against its own feature-rich fork: more than thirty tools, hash-anchored edits, language-server integration, a debugger, a scripting kernel, a browser. Thirty hard tasks, same cheap model, same verifier, same 900-second cap. The minimal one passed 20 at a median of about two minutes. The fork passed 17 at a median of about four and a half.

The detail that matters is the task split. Both passed the same 16 and failed the same 9. The whole gap lives in five tasks: the minimal harness won four, the fork won one.

And the failure mode in those five was behavioural. The fork found the right data and kept working until time or context ran out. One task ran 1.2M tokens and 861 seconds because the agent wanted one more page of results. Another burned 1.8M tokens and satisfied 3 of 13 verifier checks. A loop that does not know when it is finished runs to the cap, and the cap is where your money goes.

So the tooling did not make the model better on this model. "More tooling did not win."

But hold that thought, because the same post carries evidence against its own headline. Across a separate benchmark of sixteen models on edit tasks, hash-anchored edits improved the success rate by around 15 points on average, and for one weak editor from 6.7% to 68.3%. The fork's edit tool helps models that are bad at producing exact edits, even if its loop hurts here.

The sceptics disagree in useful ways:

- For this model, vanilla is "much better" once all extensions are stripped.
- This model's thinking is "anxious" and burns tokens on ambiguity, so it may be a model quirk.
- "Such a stupid test, as soon as you do real work the feature-rich one is far superior."
- Minimal "would surprise me on long-horizon tasks, you need subagents to control context size."

All plausible, none measured. And one lead engineer who migrated from a heavy harness to the fork reports faster, cheaper, better results on a complex project, with a five-hour limit going from exhausted in an hour to 25% used. Anecdote, but the opposite anecdote counts.

## Suspect three: the obedient model changes the verdict

A harness effect is not a constant. It depends on the model.

In an edit-precision benchmark with six harnesses, eleven models and 226 tasks, one instruction-following model scored 98.9% on its best harness and 70.2% on its worst. The same model, a nearly 29-point swing from the wrapper alone. Meanwhile, the open-weight family behaved consistently across all of them and scored surprisingly high. The author's reading: harness matters most for models that follow instructions closely, because the harness is the thing they are following.

This is why a ranking measured on one model does not transfer. As one engineer said of a harness leaderboard, it was "benchmarking how [one model] does in each harness", not how the harness does in general.

And quality-sensitive work flips results again. In one informal head-to-head, the same premium model at maximum thinking, the same prompt, and a self-contained physics project: the minimal harness scored about 7.5 out of 10, the full-featured one 8.7. The winner had cleaner architecture, stronger tests, and a faster benchmark (about 0.20 against 0.68 ms per step), though the loser's contact solver was more sophisticated. The author admitted it was not scientific. n=1, one judge, one task. But it is the honest caveat to every cheap-model result above: pass/fail on short tasks rewards early stopping.

## Suspect four: a request shape that breaks the cache

Now the best evidence. Three independent reports found the cost problem was not harness size at all. It was a mismatch between how the harness shaped its requests and how the provider or the local runtime cached them.

**Case 1: the reasoning-retention flag.** A developer on a subscription plan noticed that multi-step tool turns consumed 10 to 20% of a session limit per task, even under 50K tokens of context, five to ten times faster than in another harness. The trace ended at one request parameter. The provider's default is to clear prior reasoning on each turn (`clear_thinking` set to true). The harness never sent that parameter, yet always resent the previous reasoning content in the history. The provider therefore saw a changed prefix every time and re-billed the lot. The other harness set the flag to false explicitly for that provider. A fix landed upstream.

**Case 2: the chat template.** A developer running a 4B model fully locally found that the shipped chat template dropped earlier thinking blocks from the history. The local server then saw a different prompt each turn, so the key-value cache had to recompute the entire conversation every time. The fix was a custom Jinja template.

**Case 3: the extension fighting the SDK.** A user of third-party models saw usage reset to 0% after every response and suspected a caching extension was fighting the SDK.

Three setups, three layers, one mechanism: a prefix that is not byte-identical from turn to turn. This is the likely shape of the unexplained 7x. A hypothesis, but the only one that fits.

People who care have tuned for it. One user reports over 99% cache hits after setting up cache hints. Another keeps a start of roughly 200 to 300 tokens, with deferred tools, explicit caching, placeholder strings, and anything dynamic appended to user messages rather than inserted into the cached prefix.

One caution: routing per prompt kills caching, so a router can cost the same or more. "If you route per task, why not just pick the model for the task".

### A request-diff check you can run today

You do not need a vendor's blessing to test this.

1. Log the outgoing request body for two consecutive turns.
2. Compare them byte for byte up to the new user message. Everything before it should be identical.
3. Check whether prior reasoning content is resent, and whether the provider has a retention flag that says what to do with it.
4. Compare the provider's cached-token count in the response with what you expected.
5. If the counts are low, bisect: remove one extension or template change at a time.

## What the minimal camp and the maximal camp both get right

The threads end up in three positions that deserve to sit side by side.

- "The more you control your context, the better results."
- Comfort that the heavy harness is "more engineered by others".
- "The harness is just well-designed and minimal; the model's intelligence is what matters."

The honest synthesis: minimal wins on cost and predictability for short, well-scoped tasks on cheap models, and heavier setups win when work is long-horizon, parallel or needs guardrails. Orchestrator, planner, implementer and verifier runs lasting days really do need subagents and checkpoints, though skeptics note that the hard part is decoupling issues so merges do not collide.

Safety cuts the other way. A minimal harness often ships no sandbox at all. Users bolt one on with containers, permission layers and budget checks before an unattended run starts. The reply that stuck: "imagine waking up to find your entire PC deleted".

A pattern recurs across the cost threads: plan with a frontier model, implement on the cheap one, call an advisor when stuck. One developer ran the cheap model for half a day: 58.6 million tokens for under forty cents. But it sometimes ignored a custom instruction. Cheap is not free of friction.

## The deterministic reading of all this

The whole investigation is about what happens between your intent and the model's input.

An agent loop decides which files to read, how many tool results to append, when to compact and when to stop. Each decision is a variable you did not set and cannot easily see. The bulk, the runaway loops, the cache misses, the cursed sessions: they are all consequences of delegating context assembly to a loop.

The deterministic alternative is plain. You pick the exact files that enter the prompt, so the prefix is as small and stable as you make it. You bring your own key, so every call is billed on a named model at a rate you can read, and the cost per task is a log entry, not an estimate. The model answers with Search/Replace blocks, you apply them, and the result is a standard Git diff you can review and commit. "Accepted" has one meaning.

Autonomous harnesses have real strengths, especially for greenfield exploration. But for work on an existing codebase with a budget attached, the cheapest harness to debug is the one with nothing to debug.

## A protocol for benchmarking your own wrapper

1. Fix the model and the provider. Run enough repeats per task, because runs are stochastic. Cap time and tokens. Use an external verifier.
2. Report pass rate, median time, tokens per task, cache-read versus fresh input, and cost per success, not just cost per run.
3. Diff the first-turn context: system prompt, tool schemas, rules file, skills.
4. Verify the cache prefix is stable across turns, and check provider-specific reasoning flags.
5. Test at least two models: one obedient, one cheap open-weight.
6. Add one long-horizon, quality-sensitive task so the benchmark does not reward quitting early.
7. Collect the cheap wins: lazy-load skills, subagents without extensions, strong edit tools for weak editors, plan on frontier and implement on cheap, sandbox before unattended runs.

## FAQ

**If a minimal harness wins on cost, why does anyone use the heavy ones?**
Because cost per short task is not the only axis; long-horizon work, guardrails and team workflows are where extra machinery earns its tokens.

**Aren't thirty-task benchmarks too small to trust?**
Yes, which is why the useful part is the mechanism (cache prefix, loop behaviour) that you can reproduce on your own setup, not the headline ranking.

**How do I know the cache is the culprit and not the model?**
You don't until you log the cached-token counts per turn; if they are low while the prefix looks stable, the request shape is suspect before the model is.

**Won't hand-picking files just move the cost into my own time?**
It does, and for sprawling refactors that trade is bad; for most scoped changes a few seconds of file selection is cheaper than a loop that wanders.

## Key Takeaways

- A harness gap has several sources (prompt bulk, loop behaviour, cache-breaking requests), so diagnose which one you have before switching tools.
- Measure cost per success with a cache-read versus fresh-token split, and verify that the request prefix is identical from turn to turn.
- Harness effects depend on the model and the task, so benchmark your own setup with an external verifier, repeats and a long-horizon case.

*Every token you did not choose to send is a decision somebody else made for you, at your expense.*
