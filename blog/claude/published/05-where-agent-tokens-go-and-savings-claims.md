Before your agent reads a single line of your code, it may already have spent 55,000 tokens describing tools it will never call. That's where the real savings are. The tools promising an 80% cut are mostly somewhere else.

Every turn, an agent pays for what it reads (input), what it writes (output), what it re-reads cheaply (cache reads) and what it stores for later (cache writes). Tool calls and subprocesses add their own lines. When you audit those lines, they split into two groups. One is overhead you can delete: costs charged before the agent does anything useful. The other is retrieval you're told to buy: tools that claim to shrink what the agent reads. In my experience, deleting overhead pays off reliably, and the retrieval pitch mostly doesn't.

## How a 178x claim gets made

The builder of a context tool once mocked the whole genre, which was refreshingly honest. Take a large public repository of about 14 million tokens. Retrieve around 80,000 for one query. Divide. Announce 178x.

Their objection was right. Real usage is input plus output plus cache reads plus cache writes plus tool calls plus subprocesses. And retrieval "isn't even the hard problem, memory is": what survives an automatic compaction, and what's needed again ten turns later. (The same post then pitched a product, and readers called it marketing.)

The pattern repeats. In a benchmark write-up from an author who disclosed a commercial interest, an independent rerun of two popular token-saver tools reportedly measured single-digit savings for one, against a claimed sixty-odd percent, and a slightly higher cost than doing nothing for the other. Another vendor's claimed saving of over 80% dropped to roughly half when someone else reran it. Anyone who has watched a vendor demo meet a real repository knows how this goes.

So my rule for the rest of this post: delete fixed overhead first, buy retrieval last.

## Tool schemas

Before the agent reads one line of your code, every connected tool has already billed you for its description.

One team had about forty one-tool-per-endpoint functions (create, get, list, update, delete, repeated for each resource) costing about 55,000 tokens up front. They replaced them with two tools: a documentation search, and a sandbox where the agent writes and runs code against the SDK. Context dropped to around 1,000 tokens. Multi-step flows got more reliable because the model writes the whole flow as one program. Arithmetic got correct because it happens in code. And API keys stay in the sandbox instead of passing through tool parameters.

A second report used a deliberately oversized test fixture: roughly 217 KB of schema, about 54,000 tokens at four characters per token. They cut it to a card of about 5 KB, around 1,300 tokens, using only `search` and `execute`. Search takes a plain-language intent, cards are capped at 1,800 bytes, and the full schema is rebound and validated on the server. The author listed the limits without being asked, which I appreciated: discovery adds a step, large tool outputs still cost, and it's one fixture.

The minimal shape:

- `search_tools(intent)` returns a small card per matching operation.
- `run_code(program)` runs in a sandbox with scoped credentials.
- Nothing else loads until it's needed.

A former backend lead at an agent company argued for the same direction from another angle: a single Unix-style `run(command="...")` tool with progressive `--help` discovery, instead of a catalog of typed functions. As readers pointed out, typed calls give you strict access boundaries, while a general `run` needs a command filter or full trust. A local-model user put the cost plainly: "tool schema size is a real tax" on small setups.

There were counterpoints. Some providers already ship a tool-search feature. Another reader said the major agents don't use the lazy loading the protocol allows, so "the whole MCP model needs a rework", and providers have little incentive to fix it. And the perennial question: "doesn't it cache?"

It does, but caching lowers the price of re-reading a schema. It doesn't reduce the latency of the prefix, and it doesn't free up context. A 54,000-token schema in a 200,000-token window takes a quarter of the room, cached or not.

## Skills and duplicated instruction files

One user counted 117 installed skills injecting about 7,300 tokens into every turn, around 3.6% of a 200,000-token window, growing with each skill added. Their fix was to reduce skills to names only and add a small retrieval server of about 900 tokens. They reported the catch themselves: retrieval recall of about 0.79 on their test set. Matching also leans on keyword overlap, so a skill named for accessibility debugging might not fire on "review my UI for accessibility".

The cheapest fix came from someone who disagreed: "Nobody needs 117 live skills". Having fewer skills beats clever retrieval over many.

Subagents are the second leak. A test with ten subagents found each one loaded the full project instruction file. Setting `omitClaudeMd` to true on those subagents cut input from about 226,000 tokens to about 26,000, roughly 88% less. That's one line of config. Check the option against the current docs for your version, and note that it only suits subagents whose tasks don't need the project rules.

On instruction files themselves, experienced developers agree on one thing: a stale context file is worse than none, because the agent trusts it. One author deleted their rule files entirely and let the repository be the source of truth.

## Too many calls for simple tasks

Someone logged a simple task: rename a hook across several files. The trace was a glob, a grep, one read per file, one edit per file, then another read per file to verify. More than ten API calls for something that needs about two, and every call re-reads the context before it.

Readers suggested the verifying re-read is conservative behavior, possibly tied to cache invalidation (reported in a thread, not verified). The suggested fix was tools that return partial file reads.

Symbol-level retrieval is the obvious answer, and one vendor reported eye-catching numbers for a single query: tens of thousands of tokens to read a large source file looking for one function, versus a few thousand with symbol lookup. One query, one vendor. It shows the thing is possible, not what it saves on average.

Users with little VRAM add another angle: cloud agents "solve everything by brute force", and local setups need retrieval instead of dumping files. A repo map built from a syntax tree is the usual recommendation, though even a whole-repo map up front hurts on 8 to 12 GB.

The cheapest fix is almost embarrassing. Tell the agent which command-line tools exist and which to prefer (`rg` over `grep`, `fd` over `find`). A list alone isn't enough without a rule for choosing, though. One user reported a model assuming `fzf` was installed and failing silently.

## Claims versus reruns

| Source of savings | Claim | What holds up |
|---|---|---|
| Collapse CRUD tools into search plus execute | 55k to about 1k tokens | Reproducible; one fixture, discovery adds a step |
| Name-only skills | About 7.3k to about 0.9k per turn | Real, with recall around 0.79 |
| Skip the instruction file for subagents | 226k to 26k input | Real, where subagents don't need the rules |
| Generic "token saver" tools | 60 to 90% | Reruns found single digits to break-even |
| Whole-repo ratio math | 178x | Divides repo size by one retrieval |
| Code-graph and memory tools | 60% or more | See below |

## The most careful benchmark I found

One write-up tested five codebase tools on fifteen questions about a well-known Python web framework. Five question types were chosen before running. Same agent, same prompt, same commit, a fresh index per tool, a no-tools baseline, ninety runs per harness. The author published the preregistration and the runs they threw out.

Output tokens per question, against a baseline of about 2,900:

- the best tool: about 16% lower, called on 15 of 15 questions, modest significance, six-minute index build,
- the second: about 12% lower, called on 13 of 15, not significant,
- a third: about 11%, called on only 4 of 15,
- two others: close to zero, called rarely or never.

"Nobody saved 60%". Two of the tools were statistically indistinguishable from plain grep.

The critiques taught as much as the table:

1. **The agent doesn't always use the tool.** A tool called on 15 of 15 questions in one run and 4 of 15 in the next saves the headline number times the chance of being called.
2. **Cache warming and run order.** The author caught this and threw out one of their own metrics, which is exactly what you want from someone running benchmarks.
3. **Noise.** One reader called the study "deeply flawed" while crediting the cache catch.
4. **Cold-start baseline.** In real sessions, context is warm by turn three, so retrieval adds less as the session goes on.
5. **Conflict of interest.** Disclosed, which helps.

On knowledge graphs versus flat files, the consensus was practical: a well-structured markdown file wins until you have dense relationships between entities, like a microservice mesh or a very large monorepo. Keeping the index up to date is the hidden cost. Memory tools reporting "up to 80%" go on the unverified list, and one author invited others to run a full long-memory benchmark instead of trusting the self-reported one.

## Count the right thing

Even a perfect token count can answer the wrong question.

Someone complained about polite filler in model output. The top reply did the arithmetic: a 15-token preamble costs about $0.000375 at premium output prices. The real costs are reasoning tokens and huge inputs. Others suggested saving reasoning traces, or turning thinking off and effort down when the environment (decision records, established patterns) already supplies the answer.

A local benchmark gave one data point: a mid-size model with thinking disabled was the most consistent at shipping across twelve configurations (about 96%, ten runs each) and halved a loop failure rate. One author, specific hardware.

Fewer tokens isn't the same as a cheaper task. When one new model release used fewer tokens, several users said depth and reasoning dropped with it.

Step limits matter too. Teams publishing agent benchmarks report that resolution rate versus cost depends heavily on the step cap. Some models need at least a hundred steps to reach their best, and at low caps a premium model sometimes costs less than a mid-tier one.

At the company level, bragging about "billions of tokens in a week" aged badly, and big companies scrapping token leaderboards followed. Better metrics people proposed: merged pull requests, or "tasks closed per dollar with an acceptable failure rate". Loops split opinion: "loop until tests pass" is either the only way to work or a way to "funnel money to the labs".

## Cheaper models, and providers that drift

What matters is cost per task, not per token. One user burned through a two-dollar test budget and went negative on a diagram task with a premium-priced reasoning model, while a cheaper model finished the same task for sixteen cents. Others called the first one token-hungry and slow, but the smartest.

The price ratios people cite are dramatic: a budget model at roughly five dollars a day against a hundred for a flagship, on the same workload of ten million tokens in and two million out. Pushback came immediately. Budget models failed basic agentic tasks and were "terrible at tool calling" in one agent, but decent as a grunt worker with a flagship reviewing. A mid-priced model that wrote a plan document first and caught a rendering bug got the comment "90% for a fraction of the price", and a quiet question: why run the plan with the expensive model at all?

Hosted behavior also drifts, and your costs drift with it. One provider's postmortem listed a lowered default reasoning effort, a bug that cleared older thinking every turn after an idle hour, and a prompt that trimmed verbosity, each later reverted. Some said an open harness would have avoided these bugs. Others said they were a reason to self-host. Either way, you can't audit costs against a moving baseline unless you log your own usage numbers.

## Or decide what gets loaded yourself

Every item above has the same root cause. A tool decided on its own what to load, what to re-read and what to call next, and you paid for its decisions.

The deterministic alternative starts from the other end. The developer picks the files that go into the prompt, using a tree view and fuzzy search. No schema loads, no skill descriptions get injected, no subagent inherits a file it didn't need. The model returns search/replace blocks, applied and committed as a normal Git diff, with no verification loop re-reading what it just wrote. And because it's the developer's own key, every request has a cost you can read, add up and compare.

Picking files takes judgment and a few minutes of attention. For a sprawling refactor across hundreds of files, or an exploratory prototype, an agent's brute force may be the right call, and its overhead is the price of speed. But for targeted work in a complex codebase, a prompt containing exactly what you chose is the cheapest retrieval system there is, and it needs no index.

## Before you buy a token saver

1. **Measure.** Log real usage fields (input, output, cache read and write) per task, with the same prompt and a clean state, before and after any change.
2. **Delete fixed overhead.** Count schema tokens per connected server, collapse endpoint tools into search plus execute, prune skills, trim instruction files, and skip them for subagents that don't need them.
3. **Steer.** List installed command-line tools with a preference rule, cap steps, and reduce thinking where grounded tools exist.
4. **Only then try retrieval tools.** Check how often the agent actually calls them, whether the indexing time pays off, whether your baseline is warm, and whether the claimed saving is in output tokens, total tokens or money.
5. **Track tasks closed per dollar,** not tokens.

Not every code-graph tool is snake oil. Some showed real, modest gains when the agent actually called them. But the honest claim is "somewhat better than grep on some questions", not "60% cheaper". And before switching to the cheapest model available, measure cost per finished task. A cheap model that loops costs more than an expensive one that gets it right.
