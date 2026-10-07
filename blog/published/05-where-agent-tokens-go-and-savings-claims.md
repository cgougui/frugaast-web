# Where Your Coding Agent's Tokens Actually Go (and Why "Save 60-90%" Keeps Collapsing)

Most token waste that survives measurement is fixed overhead injected before any work starts: tool schemas, skill blurbs, duplicated instruction files and redundant read-verify loops. Retrieval and memory tools that promise 60 to 90 percent savings mostly fail independent reruns, because the headline math ignores caching, output tokens and whether the agent even calls the tool.

> I once trusted a "token saver" that advertised an 80 percent cut, and my monthly API bill came out slightly higher than the month before. The invoice, as usual, had no sense of humor.

## The Financial Lens

Think of the context window as a ledger. Every turn, the agent pays for what it reads (input), what it writes (output), what it re-reads cheaply (cache reads) and what it stores for later (cache writes). Tool calls and subprocesses add their own lines.

An honest audit has two sections. First, **overhead you can delete**: costs charged before the agent does anything useful. Second, **retrieval you are told to buy**: tools that claim to shrink what the agent reads. The first section tends to pay out reliably. The second tends to be a sales deck.

## The Genre: How a 178x Claim Gets Made

A builder of a context tool, in a moment of rare honesty, mocked the whole genre. Take a large public repository of about 14 million tokens. Retrieve around 80 thousand for one query. Divide. Announce 178x.

The author's objection was the right one. Real usage is input plus output plus cache reads plus cache writes plus tool calls plus subprocesses. And retrieval "isn't even the hard problem, memory is": what survives an automatic compaction, and what is needed again ten turns later. (The same post then pitched a product, and readers called it marketing. Take it as an illustration of the genre, not an endorsement.)

The pattern repeated in a benchmark write-up from an author who disclosed a commercial interest. An independent rerun of two popular token-saver tools reportedly measured single-digit savings against a claimed sixty-odd percent for one, and a slightly higher cost than doing nothing for the other. A third vendor's claimed saving of over eighty percent dropped to roughly half when someone else reran it. Composite numbers, but the shape is familiar to anyone who has watched a vendor demo meet a real repository.

So the rule for the rest of this article is simple. Delete fixed overhead first. Buy retrieval last.

## Ledger Line One: Tool Schemas

Before the agent has read one line of your code, every connected tool has already billed you its description.

One team reported about forty one-tool-per-endpoint functions (create, get, list, update, delete, repeated per resource) costing about 55 thousand tokens up front. They replaced them with two tools: a documentation search and a sandbox where the agent writes and runs code against the SDK. Context dropped to around one thousand. Multi-step flows became more reliable, because the model writes the whole flow as a single program. Arithmetic became correct, because it happens in code. And API keys stay in the sandbox rather than passing through tool parameters.

A second report used a deliberately oversized stress fixture: roughly 217 thousand bytes of schema, about 54 thousand tokens at four characters per token. Reduced to a card of about five thousand bytes, around 1.3 thousand tokens, using only `search` and `execute`. The search takes a plain-language intent, cards are capped at 1,800 bytes, and the full schema is rebound and validated on the server. The author listed the limits unprompted, which earns trust: discovery adds a step, large tool outputs still cost, and it is one fixture.

Here is the minimal shape:

- `search_tools(intent)` returns a small card per matching operation.
- `run_code(program)` executes in a sandbox with scoped credentials.
- Nothing else is loaded until needed.

A former backend lead at an agent company argued the same direction from another angle: a single `run(command="...")` tool in a Unix style, with progressive `--help` discovery, instead of a typed function catalog. The trade-off, as readers noted: typed calls give strict access boundaries, while a general `run` needs a command filter or full trust. A local-model user put the cost bluntly: "tool schema size is a real tax" on small setups.

Counterpoints, fairly presented. Some providers already ship a tool-search feature. Another reader said major agents do not use the lazy-loading the protocol allows, so "the whole MCP model needs a rework", with little incentive for providers to fix it. And the perennial question: "doesn't it cache?"

It does, and the answer needs numbers. Caching reduces the price of re-reading a schema. It does not reduce latency of the prefix, and it does not reduce context pressure. A 54 thousand token schema in a 200 thousand token window is a quarter of the room, cached or not.

## Ledger Line Two: Skills and Instruction-File Copies

One user counted 117 installed skills injecting about 7,300 tokens on every turn, around 3.6 percent of a 200 thousand window, scaling linearly with each skill added. Their fix: skills reduced to names only, plus a small retrieval server of about 900 tokens. The caveat they reported themselves: retrieval recall of about 0.79 on their test set. Matching also leans on keyword overlap, so a skill named for accessibility debugging may not fire on "review my UI for accessibility".

The dissent was the cheapest fix of all: "Nobody needs 117 live skills". Fewer skills beats clever retrieval of many.

Subagents are the second leak. A test with ten subagents found each one loaded the full project instruction file. Setting `omitClaudeMd` to true on those subagents cut input from about 226 thousand tokens to about 26 thousand, roughly 88 percent. A config of that kind is one line. Verify the option and the version against current documentation, and note the limit: it only suits subagents whose tasks do not need project rules.

On instruction files themselves, experienced developers agree on one thing. Stale context files are worse than none, because the agent trusts them. One author deleted the rule files entirely and let the repository be the source of truth.

## Ledger Line Three: The Shape of the Tool Loop

Someone logged a simple task: rename a hook across several files. The trace was a glob, a grep, one read per file, one edit per file, then one more read per file to verify. More than ten API calls for something that structurally needs about two. And every call re-ingests the prior context.

Explanations from readers: the verification re-read is conservative behavior, possibly related to cache invalidation (reported in a thread, not verified). Suggested remedies: tools that return partial file reads.

Symbol-level retrieval is the natural fix, and a vendor reported eye-catching single-query numbers: tens of thousands of tokens to read a large source file to find one function, versus a few thousand with symbol lookup. One query, one vendor. Treat it as an existence proof, not an average.

A second angle from small-VRAM users: cloud agents "solve everything by brute force", and local setups need retrieval rather than dumps. A repo map built from a syntax tree is the usual recommendation, though a whole-repo map up front still hurts at 8 to 12 GB.

The cheapest prompt-level fix is almost embarrassing. Tell the agent which command-line tools exist and which to prefer (`rg` over `grep`, `fd` over `find`). But inventory is not enough without a selection rule, and one user reported a model assuming `fzf` existed and failing silently.

## The Audit Table: Claim Versus Rerun

| Source of savings | Claim | What holds up |
|---|---|---|
| Collapse CRUD tools into search plus execute | 55k to about 1k tokens | Reproducible; one fixture, discovery adds a step |
| Name-only skills | about 7.3k to about 0.9k per turn | Real, with recall around 0.79 |
| Skip instruction file for subagents | 226k to 26k input | Real, where subagents do not need rules |
| Generic "token saver" tools | 60 to 90 percent | Reruns found single digits to break-even |
| Whole-repo ratio math | 178x | Divides repository size by one retrieval |
| Code-graph and memory tools | 60 percent or more | See the next section |

## The Honest Codebase-Tool Benchmark

The most careful piece of work in the pile tested five codebase tools on fifteen questions from a well-known Python web framework, five question types chosen before running, the same agent, prompt and commit, a fresh index per tool, a no-tools baseline, ninety runs per harness. Preregistration and invalidated runs were published.

Output tokens per question against a baseline of about 2,900 (composite figures, keeping the shape):

- the best tool: about 16 percent lower, called on 15 of 15 questions, with a modest significance level and a six-minute index build,
- the second: about 12 percent lower, called 13 of 15, not significant,
- a third: about 11 percent, called only 4 of 15,
- two others: close to zero, called rarely or never.

"Nobody saved 60%". Two tools were statistically indistinguishable from plain grep.

Then the critiques, which are as instructive as the table:

1. **Adoption instability.** A tool called 15 of 15 on one run and 4 of 15 on the next means the real saving is the headline times the probability of being called.
2. **Cache-warming and run-order effects.** The author caught and discarded his own metric after noticing this, which is the behavior you want from a benchmarker.
3. **Noise floor.** One reader called the study "deeply flawed" while crediting the cache catch.
4. **Cold-start baseline.** In real sessions, context is warm by turn three, so the marginal value of retrieval decays.
5. **Conflict of interest.** Disclosed, which helps.

On knowledge graphs versus flat files, the consensus was practical: a well-structured markdown file wins until you have dense cross-entity relationships, such as a microservice mesh or a very large monorepo. Indexing upkeep is the hidden cost. Memory tools reporting figures like "up to 80%" belong on the unverified list, and one author invited others to run a full long-memory benchmark rather than trust the self-reported one.

## Measure the Right Unit

Even a perfect token count can answer the wrong question.

On verbosity: a post complained about polite filler in model output. The top rebuttal did the arithmetic. A 15-token preamble costs about $0.000375 at premium output pricing. The real costs are reasoning tokens and enormous input. Others suggested saving reasoning traces, or turning thinking off and effort down when the environment (decision records, established patterns) supplies the ground truth.

A local benchmark gave a data point: a mid-size model with thinking disabled was the most consistent shipper across twelve cells (about 96 percent, ten runs each) and halved a loop failure rate. Single author, specific hardware.

Lower token use is not lower task cost. When a new model release consumed fewer tokens, several users said depth and reasoning dropped. Token efficiency is not task efficiency.

Step limits are a cost knob too. Published agent-benchmark teams report that resolution versus cost depends heavily on the step cap, with some models needing at least a hundred steps for peak performance, and a premium model sometimes costing less than a mid-tier one at low caps.

At the organizational level, bragging about "billions of tokens in a week" aged badly, and big companies killing token leaderboards followed. Better metrics proposed: merged pull requests, or "tasks closed per dollar with an acceptable failure rate". And loops split opinion: "loop until tests pass" is either the only way or a way to "funnel money to the labs".

## The Other Lever: Cheaper Models and Hosted Drift

Cost per task, not per token, is the metric. A user spent a two-dollar test budget and went negative on a diagram task with one premium-priced reasoning model, while a cheaper model finished the same task for sixteen cents. Others called the first token-hungry and slow but top in intelligence.

Price ratios people cite are dramatic: a budget model at roughly five dollars a day versus a hundred for a flagship on the same ten-million-in, two-million-out workload. Pushback arrived at once. Budget models failed basic agentic tasks, were "terrible at tool calling" in one agent but decent as a grunt worker with a flagship reviewing. A mid-priced model that writes a plan document first and catches a rendering bug earns the comment "90% for a fraction of the price", and a quiet question: why execute plans with the expensive model at all?

Hosted behavior also drifts, and the ledger moves with it. A provider postmortem listed a default reasoning effort lowered, a bug clearing older thinking every turn after an idle hour, and a verbosity-trimming prompt, each later reverted. Some called these harness bugs avoidable with an open harness. Others called them a reason to self-host. Either way, you cannot audit costs on a moving baseline unless you log your own usage fields.

## The Deterministic Answer: Make the Ledger Boring

Every item above shares a root cause. A tool decided, on its own, what to load, what to re-read and what to call next. You then paid for the decisions.

The deterministic alternative starts at the other end. The developer picks the files that enter the prompt, using a tree view and fuzzy search. No schema is loaded, no skill description is injected, no subagent inherits a file it never needed. The model returns search-and-replace blocks, applied and committed as a standard Git diff, with no verification loop that re-reads what was just written. And because the key belongs to the developer, each request has a cost that can be read, summed and compared.

This is not free. Selecting files takes judgment and a few minutes of attention. For a sprawling refactor across hundreds of files, or an exploratory prototype, an agent's brute force can be the right call, and its overhead is the price of speed. But for targeted work on a complex codebase, a prompt that contains exactly what you chose is the cheapest retrieval system ever built, and it needs no index.

## A Five-Step Audit Before You Buy Anything

1. **Measure.** Log real usage fields (input, output, cache read and write) per task, with the same prompt and a clean state, before and after any change.
2. **Delete fixed overhead.** Count schema tokens per connected server, collapse endpoint tools into search plus execute, prune skills, trim instruction files, and skip them for subagents that do not need them.
3. **Steer.** List installed command-line tools with a preference rule, cap steps, and reduce thinking where grounded tools exist.
4. **Only then trial retrieval tools.** Check how often the agent calls them, whether indexing time pays off, whether the baseline is warm, and whether the claimed saving is output tokens, total tokens or money.
5. **Track tasks closed per dollar,** not tokens.

## FAQ

**If prompt caching makes repeated overhead cheap, why bother deleting it?**
Caching lowers price, not context pressure or latency. A quarter of the window spent on schemas still crowds out your code.

**Are all code-graph tools snake oil, then?**
No. Some showed real, modest gains where the agent actually called them. The honest claim is "somewhat better than grep on some questions", not "60 percent cheaper".

**Is manual file selection not just shifting work to the human?**
Yes, and that is the trade. It costs minutes of attention to save unbounded, invisible spend, and it keeps you in the loop.

**Should I switch to the cheapest model available?**
I would not, without measuring cost per finished task. A cheap model that loops costs more than a dear one that lands.

## Key Takeaways

- Fixed overhead (tool schemas, skills, duplicated instruction files, verify loops) is measurable and deletable, and deleting it delivers the reliable savings.
- Retrieval tools must be judged on adoption, warm baselines and total cost, which is where most 60 to 90 percent claims collapse.
- Choose the unit that matters: tasks closed per dollar, with the context you selected yourself as the cheapest index.

*A saving you cannot reproduce on your own invoice is not a saving, just a slide.*
