Two developers download the same class of open-weight model on the same weekend. One posts "I'm done with local LLMs for coding." The other posts "this is it." Neither mentions a single flag.

The local-model conversation is stuck between two camps. One is done with local LLMs for coding after a weekend with a 27B dense model. The other posts "this is it" after a model one-shots a game. Both experiences are real, and neither tells you what you'll get.

For every claim, I now ask the boring questions. Which weights, which quantization, which runtime, which flags, which task, how many runs, and who judged the output? If those answers are missing, the claim is a hint at best.

## Two verdicts, one class of model

The pessimist first. A developer tries a mid-size dense model against a hosted frontier model at work. The complaints are about decisions and tool calls. A `docker build` runs longer than the harness's default timeout. The model assumes the build failed, never reads the output, and makes up a plausible cause (a missing audio library) instead of checking.

That's a real failure. It's also a failure of the harness, the model and the timeout together, not of the weights alone.

Now the optimist. A different developer runs a 35B mixture-of-experts model, sets up a screenshot loop so the model can see what it built, and ships a small game. Other threads claim "frontier-level" results on consumer hardware, and the pushback is immediate: it's "not even 5.5 level benchmarks let alone real world performance".

Experienced developers keep pointing at the same divide. Some people use an LLM "to speed up/improve their coding" and are fine running locally. Others "expect LLMs to do the thinking and take decisions for them". The first group reviews every diff. The second is waiting to be impressed.

And the missing details are always the same: hardware, flags, harness, tools.

## The serving config is part of the result

Here's what people who do publish their settings tend to share (composites, shaped like real reports):

| Setup | Model and quant | Context and cache | Notable flags | Reported speed |
|---|---|---|---|---|
| Small box, 16 GB GPU | 27B dense, 3-bit | ~73k context, KV cache at q4_1 | native multi-token prediction (MTP) drafting, `n-max 2`, temp 0.65, top_k 20, min_p 0.05 | Built a small REST service in a few prompts |
| Workstation, 16 GB GPU plus RAM | 35B MoE (3B active), 6-bit | ~120k context | `--cpu-moe`, flash attention on, `--no-mmap`, `--ctx-checkpoints 5`, `--reasoning-budget -1` | Fine for interactive use |
| Two 24 GB cards | 27B dense, 4-bit | ~180k context | Speculative decoding | ~85 tok/s |

What actually changes the outcome:

**Quantization.** There's a running argument between the q6-with-offloaded-experts camp and the 3-bit crowd. One rule that keeps coming up for small models: use 8-bit "if not full fat", because it "makes all the difference". There are side-by-side posts comparing BF16, Q8_0 and Q4_K_M on the same prompt, and honestly, the gap depends on the task. Only go lower if you've measured the difference on your own tasks.

**KV cache type.** Quantizing the KV cache saves memory and buys context. It can also cause doom loops at long context. Someone running a 262k window on 8 GB of VRAM plus system RAM reports good speed, then warns that a q4 cache is prone to loops and q8 near 200k is safer.

**Sampling.** The model card is your baseline. Deviating can work, but say that you did. Several people noticed that a label like "Recommended Quant Sampler Tuning" isn't the vendor's recommendation, and may make output worse.

**Flags copied without understanding.** Someone asked whether `--reasoning-budget -1` turns reasoning off or makes it unlimited. In most builds it means unlimited. Check yours.

**Template bugs.** A Jinja error like "Unknown StringValue filter: safe" goes away when you delete `| safe` from the chat template. Another report says a coding CLI pointed at a local server ran 90% slower with a useless cache until one setting was changed. That's plumbing, not the model.

**Speculative decoding isn't free.** The advice "benchmark MTP before you enable it" comes from a Mac user for whom it made things slower, helping only on pure code sequences, probably because of memory bandwidth. Same feature, opposite effect, depending on the machine.

### A config card

This is the one-page template I'd attach to any local-model claim:

1. Model, size, dense or MoE, and quant (exact file name).
2. Runtime and version, plus any patches.
3. Context size and KV cache types.
4. Sampling parameters, and whether they match the model card.
5. Speculative decoding or MTP on or off, with measured prompt-processing and generation tokens per second.
6. Template fixes and special flags.
7. Harness, tools and timeouts.

Seven lines. When one loud "never again" post was asked for this, the details didn't come. That sums up the genre.

The glowing posts deserve the same scrutiny. "A full API plus tool server from three prompts" is a single anecdote, and that same post shows `parallel = 1` while talking about spawning subagents. Read the config against the story.

## What people bought and what it got them

Reports range from a thousand-dollar laptop to a nine-thousand-euro workstation.

One owner ran a roughly 230B model under vLLM for a coding CLI on a pair of big-memory boards with no fast interconnect, and found that the "conventional wisdom" setting (pipeline parallelism) wasn't the fastest. Replies pointed out that hosted plans for the same model cost a few dollars a month, and asked about the electricity bill. That's the cautionary tale on payback.

At the other end, a developer spent an eight-hour flight with a local model and scoped it honestly: small edits, comments, spec updates, brainstorming. Their summary was "nothing like 'wow this replaces frontier models'". It's the most useful sentence in the genre, because it states the task.

What actually limits people, in order:

- **VRAM.** People with 16 GB keep asking for bigger variants.
- **Prompt-processing speed.** Prefill is "instant" at a few thousand tokens and painful on a codebase of thousands of lines.
- **Context length.**

And there's counter-evidence: someone who found local models slower with large contexts and asked why not run the same weights on a cheap cloud host. Fair question.

If you're buying, work out requirements from the sizes people actually run (27B dense, 35B-A3B, a ~120B MoE), not from launch announcements. Compute weights plus KV cache at your target context. Then check that your runtime supports the architecture on day one. A 30B coding model whose architecture llama.cpp can't run yet is a press release, not a tool.

A rule of thumb that helps when reading comparisons: an MoE behaves roughly like a dense model sized at the geometric mean of its total and active parameters, so a 26B-A4B is about a 10B dense. It's a bit cynical, but it explains a lot of "small model matches big model" headlines.

Reasoning tokens cost hardware time too. In one popular head-to-head, a 27B model spent about 34,000 tokens and 18 minutes on a task a rival finished in about 6,000 tokens and under 4 minutes, on the same laptop. Tokens per second isn't time per task.

## Why one-shot demos and leaderboards mislead

You know the demos: Pac-Man, a bouncing-physics canvas, a car on a road, a ray tracer in BASIC.

The criticisms are fair and specific:

- A vague "make Pac-Man" prompt tests whether the model memorized Pac-Man. It's "essentially a benchmaxxing test".
- Canvas animation is unusually forgiving. It measures "vibes on one prompt". Open the HTML and compare structure and line count instead.
- No sampling settings, no repeated runs, and someone asking "which quants?" in every thread.
- In one vendor-adjacent comparison, the labels looked backwards and the smaller model won two of three scenes. The poster founded the app being promoted.

The same threads have the useful ideas. Give the model eyes: a browser tool or screenshots, so it can render, look and iterate. One BASIC ray-tracer comparison used identical quants for both models, and the result was clear: the older model left errors it couldn't see, while the newer one iterated to a good picture on its own. Using the same quant on both sides is rare, and it's what makes that test worth reading.

Leaderboards deserve the same suspicion. A "coding" index built from two odd benchmarks tells you about those two benchmarks. A model that ties a hosted frontier model on an "agentic" index can still take six minutes on a chore the hosted one does in twenty seconds (moving ten docs into a documentation site). A vendor scoring its own model on its own code benchmark is, to put it politely, rough. And one reviewer's line, "NextJS is also at top slop eval", sums up a ranking that contradicts its own numbers.

Self-reported numbers get picked apart too. "87% with a 4B model" turns out to mean 4B active parameters. A distilled model with thousands of traces and no benchmarks is "premature". Someone who tried several distills of a frontier model found shorter reasoning and no better results on their handful of tests.

One more caveat: a local number is a model-plus-harness number. Scaffolding alone has moved the same small model from the low 20s to the high 70s on a public coding benchmark, which "makes you question every benchmark comparison".

## What measuring looks like

Very few people measure. The best example I found is a developer who logged ten days of work, replayed a random 150 tasks on a local 27B model, and compared the results with the cloud model's answers.

| Task type | Share of workload | Matched the cloud |
|---|---|---|
| Read, scan, explain | 35% | 97% |
| Tests, boilerplate, single-file edits | 30% | 88% |
| Multi-file debugging | 20% | 61% |
| Architecture, refactors over 5+ files | 15% | 29% |

Routing by task type reportedly cut a monthly API bill from about $85 to about $22.

The skeptics in the thread had fair questions. How was "matched" judged? Which harness routed the tasks? Is a five-file change really "complex"? One reader said they spent more time fixing the missing 10% than they saved. Another asked whether a cheap cloud host would be faster for about the same price.

Still, it's the right shape. A table of task types and success rates beats any demo.

You can build a 20-line version yourself. This is my suggestion, not anyone's quote: log each task with a category and token counts, replay a random sample against local and cloud, and record pass or fail by a rule you state up front (tests pass, or the diff was accepted). Run at least two quants or two runs. Then decide.

## Small model, precise human

Every satisfied local user I've read has the same thing in common: they plan, specify and review themselves. "The more work/planning/control you do yourself, the less capable model you can use."

A local model is cheapest and most reliable when you give it a small, exact job:

- **Pick the files yourself.** Hand it the three files that matter, not a whole repo to explore. Context bloat hurts a lot more in a 73k window than in a hosted million-token one.
- **No hidden loop.** Nothing decides on its own that a slow build failed. You run the build and paste the output.
- **Plain Git diffs.** Search/replace edits, reviewed as a diff and committed. When the 10% misses show up, they show up as a change you can review, not as a surprise 40 files later.
- **Your own API key as a fallback.** When a task is beyond the local model, send that one task to a hosted model and see exactly what it cost. Keep both options and route by task type.

Autonomous agents have their place. Greenfield prototypes and throwaway tools are where "build me something" shines, and a model that can render, look and iterate is genuinely impressive there. But in a complex codebase, the failure at the top of this post (assume the build failed, invent a cause) is exactly what you can't afford.

## Checklist

1. Pick the model class first, then size VRAM plus RAM for weights and KV cache.
2. Confirm your runtime supports the architecture on day one.
3. Write a config card for every result you trust.
4. Benchmark MTP and flash attention on your own machine, especially on a Mac.
5. Prefer 8-bit for small models, and go lower only with a measured difference.
6. Replay your own tasks by type, with a visual or test feedback loop.
7. Use leaderboards and demos to build a shortlist, never to make the final pick.
8. Read comparisons run by vendors and founders with that in mind.

For a lot of people, local coding is too fiddly to be worth it, and a hosted key with a clear bill is simpler. It pays off when your tasks are small and well scoped, or when offline or privacy requirements make the choice for you. Running the same open weights on a cheap cloud host is often the sensible middle, as long as you pin a provider, since quantization and truncation vary between them. Whatever you pick, a week of trying it out tells you which wins and annoyances you remember, not the rates. A small log with task types and pass/fail takes an afternoon and doesn't depend on your mood.
