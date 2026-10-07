# Local Coding Models Are Not Great or Useless: They Are Unreported

Two developers run the same class of open-weight model on their own hardware and come back with opposite verdicts. The difference is rarely the model: it is the quant, the KV cache, the sampling, the context window and what each person asked it to do.

> I have read a lot of "local coding is dead" posts that never mention a single flag, and I have watched myself write the same kind of post after one bad afternoon. A verdict without a config is just a mood.

## The lens: treat every result like a lab notebook entry

A benchmark result you cannot reproduce is an anecdote with a chart on it.

So this article takes a lab-notebook view. For each claim about local coding models, ask the boring questions: which weights, which quantization, which runtime, which flags, which task, how many runs, who judged the output. If the answer is missing, the claim is a screening signal at best.

Why bother? Because the local-model conversation is stuck in two camps. One camp declares it is done with local LLMs for coding after a weekend with a 27B dense model. The other posts "this is it" after a model one-shots a game. Both are real experiences. Neither tells you what *you* will get.

## Two verdicts, one model class

Take the pessimist first. A developer tries a mid-size dense model against a hosted frontier model at work. The complaints are about decisions and tool calls. A `docker build` runs longer than the harness's default timeout. The model assumes the build failed, never reads the output, and invents a plausible-sounding cause (a missing audio library, in this case) instead of checking.

That is a real failure. It is also a failure of *harness plus model plus timeout*, not of weights alone.

Now the optimist. A different developer runs a 35B mixture-of-experts model, wires up a screenshot loop so the model can see what it built, and ships a small game. Other threads claim "frontier-level" results on consumer hardware, and the pushback is immediate: it is "not even 5.5 level benchmarks let alone real world performance".

Experienced developers in the trenches keep pointing at the same fault line. Some people use an LLM "to speed up/improve their coding" and are fine locally. Others "expect LLMs to do the thinking and take decisions for them". The first group reviews every diff. The second group is waiting to be impressed.

And the missing details are always the same: hardware, flags, harness, tools. Which leads straight to the notebook.

## The serving config is part of the result

Here is what people who *do* publish their settings tend to share. These are composite examples, shaped like real reports.

| Setup | Model and quant | Context and cache | Notable flags | Reported speed |
|---|---|---|---|---|
| Small box, 16 GB GPU | 27B dense, 3-bit quant | ~73k context, KV cache at q4_1 | native multi-token-prediction (MTP) drafting, `n-max 2`, temp 0.65, top_k 20, min_p 0.05 | usable for a full small REST service in a few prompts |
| Workstation, 16 GB GPU plus RAM | 35B MoE (3B active), 6-bit | ~120k context | `--cpu-moe`, flash attention on, `--no-mmap`, `--ctx-checkpoints 5`, `--reasoning-budget -1` | fine for interactive use |
| Dual 24 GB cards | 27B dense, 4-bit | ~180k context | speculative decoding | ~85 tok/s |

Look at what moves the outcome.

**Quantization.** There is a standing argument between the q6-with-offloaded-experts camp and the 3-bit crowd. One rule that keeps coming up for small models: use 8-bit "if not full fat", because it "makes all the difference". Side-by-side posts that show BF16, Q8_0 and Q4_K_M on the same prompt exist, and the honest reading is that the gap depends on the task. Lower only with a measured delta on your own tasks.

**KV cache type.** Quantizing the KV cache saves memory and buys context. It can also cause doom loops at long context. Someone running a 262k window on 8 GB of VRAM plus system RAM reports good speed, then adds the caveat that a q4 cache is prone to loops and q8 near 200k is safer.

**Sampling.** The model card is the baseline. Deviating can work, but it should be a labeled deviation. Several people pointed out that a label like "Recommended Quant Sampler Tuning" is not the vendor's recommendation, and may degrade output.

**Copy-pasted flags.** One of the best examples: someone asks whether `--reasoning-budget -1` disables reasoning or means unlimited. It is a flag people copy without understanding. (Unlimited, in most builds. Check yours.)

**Template bugs.** A jinja error such as "Unknown StringValue filter: safe" is fixed by deleting `| safe` from the chat template. Another report says a coding CLI pointed at a local server was 90% slower with a useless cache until one setting was changed. That is not a model problem. That is plumbing.

**Speculative decoding is not free.** The advice "benchmark MTP before you enable it" comes from a Mac user for whom it made things *slower*, helping only on pure code sequences, likely because of memory bandwidth. Same feature, opposite sign, depending on the machine.

### A serving config card

Here is the one-page template worth attaching to any local-model claim:

1. Model, size, dense or MoE, and quant (exact file name).
2. Runtime and version (and any patches).
3. Context size and KV cache types.
4. Sampling parameters, and whether they match the model card.
5. Speculative decoding or MTP: on or off, with measured prompt-processing and generation tokens per second.
6. Template fixes and special flags.
7. Harness, tools and timeouts.

Seven lines. When one loud "never again" post was asked for this, the details did not come right away. That is the whole genre in one anecdote.

One caution about the glowing posts, too. A claim like "a full API plus tool server from three prompts" is a single anecdote, and the same post shows `parallel = 1` while talking about spawning sub-agents. Read the config *against* the story.

## Hardware: what people bought and what it bought them

Reports run from a thousand-dollar laptop to a nine-thousand-euro workstation.

A pair of big-memory boards, no fast interconnect, running a roughly 230B model under vLLM for a coding CLI. The owner found the "conventional wisdom" setting (pipeline parallelism) was not the winning one. Replies pointed out that hosted plans for the same model cost a few dollars a month, and asked about electricity. That thread is the cautionary tale on payback.

At the other end, a developer spent eight hours on a flight with a local model, honestly scoped: small edits, comments, spec updates, brainstorming. Their summary was "nothing like 'wow this replaces frontier models'". That is the most useful sentence in the genre, because it states the task.

What actually limits people, in order:

- **VRAM**, first. Sixteen-gigabyte owners keep asking for bigger variants.
- **Prompt-processing speed**, second. Prefill is "instant" at a few thousand tokens and painful on a codebase of thousands of lines.
- **Context length**, third.

And there is the counter-evidence: someone who found local models slower with large contexts and asked why not run the same weights from a cheap cloud host. Fair question.

For buyers, derive requirements from sizes people actually run (27B dense, 35B-A3B, a ~120B MoE), not from launch announcements. Compute weights plus KV cache at your target context. Then check that your runtime supports the architecture on day one. A 30B coding model that has no llama.cpp support for its architecture is a press release, not a tool.

A rule of thumb that helps when reading comparisons: a MoE behaves roughly like a dense model sized at the geometric mean of its total and active parameters. A 26B-A4B is about a 10B dense. Slightly cynical, but it explains a lot of "small model matches big model" headlines.

Reasoning tokens are a hardware cost, too. In one popular head-to-head, a 27B model spent about 34,000 tokens and 18 minutes on a task that a rival finished in about 6,000 tokens and under 4 minutes on the same laptop. Tokens per second is not time per task.

## Why one-shot demos and leaderboards mislead

The demo genre is familiar: Pac-Man, a bouncing-physics canvas, a car on a road, a ray tracer in BASIC.

The criticisms are fair, and they are specific:

- An underspecified "make Pac-Man" prompt tests whether the model memorized Pac-Man. That is "essentially a benchmaxxing test".
- Canvas animation is unusually forgiving. It measures "vibes on one prompt". Open the HTML and compare structure and line count instead.
- No sampling settings, no repeated runs, and "which quants?" asked in every thread.
- In one vendor-adjacent comparison, the labels looked backwards and the smaller model won two of three scenes. The poster was the founder of the app being promoted.

The constructive moves are in the same threads. Give the model eyes: a browser tool or screenshots so it can render, inspect and iterate. One BASIC ray-tracer comparison used identical quants for both models, and the result was a clean story: the older model left errors it could not see, while the newer one iterated to a good picture alone. Same quant on both sides is rare, and it is what makes that test worth reading.

Leaderboards deserve the same suspicion. An index that calls itself "coding" but is built from two odd benchmarks tells you about those two benchmarks. A model that ties a hosted frontier model on an "agentic" index can still take six minutes on a chore the hosted one finishes in twenty seconds (moving ten docs into a documentation site). A vendor scoring its own model on its own code benchmark is, politely, rough. And one reviewer's line, "NextJS is also at top slop eval", sums up what happens when a ranking contradicts its own listed numbers.

Self-reported numbers get picked apart the same way. "87% with a 4B model" turns out to be 4B *active* parameters. A distilled model with thousands of traces and no benchmarks is "premature". Someone who tried several distills of a frontier model found shorter reasoning and no better results on their handful of tests.

One more caveat: a local number is a model-plus-harness number. Scaffolding alone has moved the same small model from the low 20s to the high 70s on a public coding benchmark, which "makes you question every benchmark comparison".

## What a measured split looks like

Very few people measure. The best example is a developer who logged ten days of work and replayed a random 150 tasks on a local 27B model, then compared to the cloud answer.

| Task bucket | Share of workload | Reported match vs cloud |
|---|---|---|
| Read, scan, explain | 35% | 97% |
| Tests, boilerplate, single-file edits | 30% | 88% |
| Multi-file debugging | 20% | 61% |
| Architecture, 5+ file refactors | 15% | 29% |

Routing by bucket reportedly cut a monthly API bill from about $85 to about $22.

The skeptics in the thread were not wrong. How was "matched" judged? Which harness routed the tasks? Is a five-file change really "complex"? One reader said they spent more time fixing the missing 10% than they saved. Another asked whether a cheap cloud host would be faster for nearly the same price.

Still, this is the right *shape*. A table of buckets and rates beats any demo.

A 20-line version is easy to build, and this is a suggestion, not a quote from anyone: log each task with a category and token counts, replay a random sample against local and cloud, and record pass or fail by a stated rule (tests pass, or the diff was accepted). Run at least two quants or two runs. Then decide.

## The paradigm: make the model small, make the human precise

Notice what every satisfied local user has in common. They plan, specify and review themselves. "The more work/planning/control you do yourself, the less capable model you can use."

That is the deterministic answer to the whole problem. A local model is cheapest and most reliable when it is given a *small, exact* job:

- **Manual file scoping.** Hand it the three files that matter, not a whole repository to explore. Context bloat is a larger tax on a 73k window than on a hosted million-token one.
- **Agentless control.** No hidden loop deciding that a slow build failed. You run the build and paste the output.
- **Standard Git diffs.** Search/replace edits, reviewed as a diff and committed. If the 10% misses show up, they show up as a reviewable change, not as a surprise 40 files later.
- **BYOK economics.** When a task is beyond the local model, send that one task to a hosted key and see exactly what it cost. Keep both options. Route by task type.

Autonomous agents have a place. Greenfield prototypes and throwaway tools are where "build me something" shines, and a model that can render, look and iterate is genuinely impressive there. But on a complex codebase the failure above (assume the build failed, invent a cause) is exactly what you cannot afford.

## Checklist

1. Pick the model class first, then size VRAM plus RAM for weights and KV cache.
2. Confirm day-one runtime support for the architecture.
3. Record the config card for every result you trust.
4. Benchmark MTP and flash attention on your own machine, especially on a Mac.
5. Prefer 8-bit for small models; go lower only with a measured delta.
6. Replay your own tasks in buckets, with a visual or test feedback loop.
7. Treat leaderboards and demos as screening, never as selection.
8. Read vendor-run and founder-run comparisons with the disclosure in mind.

## FAQ

**If configs matter this much, is local coding just too fiddly to be worth it?**
For many people, yes; the setup cost is real and a hosted key with a clear bill is simpler. It pays off when your tasks are small and well-scoped, or when offline and privacy requirements decide it for you.

**Isn't a replay of 150 of my own tasks overkill compared with trying the model for a week?**
A week of vibes is exactly the problem, because you remember the wins and the irritations, not the rates. A tiny log with buckets and pass/fail is an afternoon of work and survives your mood.

**Why not just run the same open weights from a cheap cloud host?**
Often you should; it removes the hardware bill and the prefill wait. The trade-off is that quantization, truncation and routing then vary by provider unless you pin one.

**Doesn't manual file selection throw away what makes models useful on big codebases?**
It throws away the exploration, which is where small models burn context and make wrong guesses. You lose some convenience and gain predictability and a smaller bill.

## Key Takeaways

- Most local-coding verdicts are disagreements about config, task mix and expectations, so demand a serving config card before trusting any of them.
- Measure your own task buckets with a replay and a stated pass rule, and route by task type, because match rates fall sharply on multi-file work.
- Keep the model's job small and the human's scoping precise: exact files, reviewable diffs, and a hosted key for the tasks that need it.

*A model you cannot reproduce is a rumor, and a benchmark without a config is a rumor with a logo.*
