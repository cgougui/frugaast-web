# The 91% Nobody Can Verify: How to Judge Tools That Filter What Your Agent Sees

A new generation of tools promises to shrink what a coding agent reads: command output, search results, file contents. The savings are real on paper, but the question that matters is whether the model still trusts the reduced view and can still act on it.

> I installed a "token saver" on a Friday, watched a dashboard announce 90% savings, and spent Monday figuring out why the agent kept re-reading the same five files. The number on the dashboard was true. It just had nothing to do with whether my task got done.

## The headline that got called "sensationally inaccurate"

Picture a developer posting a report after two months of using a pluggable CLI filter. The table looks great:

| Command | Average raw output | Reported saving |
|---|---|---|
| `kubectl get` | ~14K tokens | ~94% |
| `grep` | ~13K tokens | ~96% |
| `docker` | large | ~96% |
| `find` | large | ~95% |
| `git diff` | medium | ~58% |
| `ls` | small | ~56% |

The title says "91% of my LLM tokens". The first reply says the title is "sensationally inaccurate".

And the critic has a point. The number is 91% of *raw CLI output*, on *one person's usage*. It is not 91% of the tokens in the session. Output from commands is only one slice of context. The rest is your prompts, the model's replies, file reads, and tool definitions. Caching changes the price of all of it again.

That is a measurement problem before it is an engineering problem. "Tokens removed" is not the same sentence as "task still solved at the same or lower total cost". Only the second one pays your bills.

This article takes the measurement lens on purpose. Rather than ranking tools, it builds the experiment you should run before trusting any of them.

## Four places to intervene on the input side

Every tool in this space attacks the same thing: what a tool call returns to the model. They differ in *where* they sit, and that decides what the model can see, and what it can work around. The descriptions below are the authors' own claims, not verified facts.

1. **Post-process command output.** A single binary sits in an agent hook or a shell wrapper, with a plugin per command. Several older projects do similar work, which tells you the idea is popular, not that it is proven.
2. **Replace search.** One example pairs cheap static embeddings with keyword ranking, runs on CPU and exposes itself over MCP. Its authors cite fast indexing, millisecond queries and a ranking-quality score measured on roughly a thousand query and document pairs across dozens of repos. Another predicts which files a bug will touch. Another builds tree-sitter project maps so a huge repo can be "mapped, then loaded".
3. **Change the protocol inside the harness.** One open agent reported topping a terminal-task leaderboard with a small model by using hash-anchored edits, syntax trees to decide what to fetch, and batched reads and edits. Another sells an "AST context firewall" with a claimed two-thirds cut in prompt tokens.
4. **Compress results in flight.** A proxy sits in front of the agent. A small fine-tuned model trims tool output before it goes back to the big one. The claim is about 30% fewer input tokens, and that the prompt cache is untouched because results are removed before they are sent.

Layers 1 and 4 are *lossy* by design. Layer 2 changes the model's habits. Layer 3 changes the contract between model and tool.

## Failure mode one: the filter deletes the evidence

The oldest question in every thread: how do you handle the risk of stripping out the exact stack trace the agent needed?

Experienced developers have seen this movie. A known filter in this family strips what the model *expects* to see, "causing more work". The agent gets a tidy summary, cannot find the failing line, and runs the command again. Or three more commands. The savings evaporate, and sometimes go negative.

The critical information in a bad build is often one or two lines. An error message. An exit code. A path. A filter tuned on average output will happily drop it, because on average it is noise.

One proposed alternative is nicely contrarian: do not filter silently. Refuse to pass large output, and tell the model to write its own filter first. That forces the model to think about what it needs. Untested, but it points at the right principle. A filter that cannot know the question should not answer it.

If you adopt any output filter, make it lossless by default. A sketch of a sane policy:

- Pass everything through untouched when the exit status is non-zero.
- Pass lines matching error, trace or failure patterns even on success.
- Write the raw output to a spill file every time.
- End the filtered text with a one-line hint: where the raw output lives and how to expand it.

The counterpoint deserves honesty. The biggest wins in that report came from structured dumps, such as cluster listings, container lists and directory walks, where the agent needs a *decision* and not the text. Small gains on `ls` and `git diff` show where the ceiling is. Filtering a 14K-token resource listing is nearly free of risk. Filtering a failing test run is not.

## Failure mode two: the model does not trust what does not look like grep

This one is stranger, and more human.

One practitioner who tried several alternatives, including LSP-based tools, reports that models are "so heavily RL'd with grep" that they do not trust other result formats. The agent gets a clean ranked list from a smarter search, shrugs, then runs grep anyway. Then reads the whole file. All the savings are gone, and you paid for both.

Another developer who tried a couple of context tools says they "confuse the agent more than helping". Their point is brutal and fair: savings are irrelevant if the agent routes around the tool and makes more calls. Their preference is subagents, which keep the main conversation clean by sending noisy work elsewhere.

A third reports that an LSP integration turned out underwhelming, because static analysis fires mid-edit and its caches go stale. The model asks a question about code that is already different.

There is a fair fight here, and it should be shown as one.

- **The optimists** say agents fall back to grep, full-file reads and subagents whenever they cannot find something, and that fallback is expensive and often wrong. Better search prevents the fallback.
- **The skeptics** say habit beats design. If the model is trained to trust grep, the alternative is moot.

A sharp comment cuts through the marketing: "grep doesn't need tokens, so what is 98% fewer than zero?" Of course grep costs tokens, because the model reads the results. But the quip exposes the real problem. The baseline is ambiguous. Is it grep alone? Grep plus the file reads that follow? Until a tool says what it is comparing against, the percentage is decoration.

Some ask whether such search should simply live inside the harness. Maybe: a tool inside the loop can adapt its output to what the model expects, and a bolt-on cannot.

## Failure mode three: the benchmark measures the filter, not the task

Retrieval benchmarks score whether the right document ranks high. Agents are judged on whether the bug got fixed. These are different questions, and the gap between them is where marketing lives.

Here is what developers keep asking for, in different words:

- Run the agent with grep *removed* and the new search installed, then show task accuracy.
- Compare against the established alternatives, not against nothing.
- Explain how the 30% saving was measured. Was task success compared before and after?
- Separate bytes of output from tokens of session. Output is only part of context, and caching changes the economics.

The harness author who topped the leaderboard was careful. They ran in leaderboard-compliant mode, with no agent instruction files, citing reports of cheating on that benchmark. Their own conclusion is worth repeating: "astounding how much the harness matters". A small model reached the top by changing the *tools around it*. That is a real result, but about one benchmark, one model and one setup. Developers rightly asked how it performs on everyday work and on frontier models.

A related benchmark found the best setup fixed under 5% of real bugs when nobody said what was wrong. Experienced developers asked for precision next to recall, because eager models will "fix" working code. Every retrieval metric needs a false-positive twin.

## The experiment you should run

Forget the vendor chart. Build this instead.

| Step | What to do |
|---|---|
| Tasks | 10 to 20 of your own, from your real backlog |
| Model | The same one, same settings, every run |
| Arms | Paired runs, with and without the tool |
| Metrics | Solve rate, total tokens including retries, tool-call count, wall time |
| Extras | Count re-reads of files after a search, and repeated commands |

Why paired? Run-to-run variance is huge, and unpaired averages tell you whatever you hoped for. Why count retries? Because failure modes one and two show up there: a filter that saves 10K tokens and causes three extra commands has lost. Why your own tasks? Because the tool authors' repos are not your repo.

## What the AST-aware tools do differently

It is worth separating the tools that *compress text* from the ones that *change the protocol*.

A hash-anchored edit does not shorten anything after the fact. It gives the model a short, stable handle on a line so that the edit is addressed precisely and cannot silently drift. Fetching by syntax tree means the model asks for a function, not a file. Batching means ten reads in one round trip. These change *what the conversation looks like*, which is a different category of idea.

The same logic shows up in a data-analysis toolkit that argues for a semantic layer: more compact than YAML, more deterministic than Markdown, queried in SQL. The design heuristic is lovely. Give the model an interface it already knows well. SQL is well in-distribution. A bespoke compressed format is not.

Dumping the whole repo into one Markdown file is the blunt baseline these tools react against, and developers who tried it report binary garbage where compressed files used to be.

Several of these projects have no independent discussion at all, so their self-reported numbers are hypotheses.

## The other side of the ledger: tool definitions

Every MCP tool you add to reduce read tokens has a fixed cost of its own. One thread asked whether 30-plus tools load on every request, noting that a popular agent's built-in tools already cost tens of thousands of characters in definitions before any server is attached.

Some harnesses load definitions on demand. Either way, count the definitions on the cost side before celebrating the savings side. The full overhead accounting lives elsewhere in this series.

## The deterministic alternative: be the filter

There is a quieter answer to all three failure modes, and it is boring.

Pick the files yourself.

When a developer chooses the exact files that go into a prompt, nothing needs to be stripped, because nothing noisy was fetched. There is no ranking to distrust, no proxy to audit, no summary that might have swallowed the one line that mattered. The model sees what you see. You can reproduce a bad answer, because the context is a list of paths, not the output of a retrieval model.

Agents are great for exploring a repo you have never opened, or building a greenfield prototype where wrong turns are cheap. But in a large codebase with real constraints, an agentless workflow with your own API key has properties that a filter cannot match:

- **Scoped by hand.** Context is exactly what you chose, so there is nothing hidden to verify.
- **Priced per call.** With your own key, cost is the actual usage, not a bundled number you cannot audit.
- **Reviewed as a diff.** Search/replace blocks land as ordinary Git diffs, so a wrong edit is visible and revertible in seconds.

The measurement lens is also kinder to this approach. There is nothing to benchmark except the model, because no layer sits between you and the context.

## Adopting an input-side tool without regretting it

If you do want one, a checklist:

1. **Measure first.** Log which commands and tool results dominate your sessions. Per-command accounting is the cheapest experiment there is.
2. **Start with structured dumps** (cluster listings, container lists, large Git logs), not output that carries stack traces, such as test runners and compilers.
3. **Keep raw output recoverable**, and tell the model how to get it.
4. **Compare end to end** on 10 to 20 of your own tasks. Count retries and re-reads.
5. **Watch for routing around.** More calls or repeated file reads after a search means the model does not trust the tool.
6. **Prefer tools you can switch off per session.** A single flag to bypass compression is worth more than a clever algorithm.
7. **Treat proxies as a data-handling decision.** A proxy that rewrites your agent's traffic sees your code. A claim of zero retention is a claim.

## FAQ

**If filters are lossy, why use any at all?**
Because on huge, structured outputs the loss is usually irrelevant, and the saving is real. The trick is to keep the raw output recoverable and avoid filtering anything that carries errors.

**Isn't hand-picking files slower than letting search find them?**
For a first look at an unfamiliar repo, yes. For a change you already understand, selecting three files takes seconds, and it removes an entire class of retries.

**Do the leaderboard results not prove these tools work?**
They prove that the harness matters, which is useful. They do not prove the same gains on your code, your model and your tasks, so run the paired test.

**What if my agent genuinely cannot work without search?**
Then a better search layer may earn its place. Just measure whether it replaced grep or merely joined it.

## Key Takeaways

- A saving measured on raw output is not a saving on the session. Judge tools by solve rate, total tokens including retries, and wall time.
- Filters fail when they delete evidence, when the model distrusts their format, or when the benchmark measures the filter and not the task.
- Choosing the exact files yourself removes the need for a filter, because nothing noisy was fetched in the first place.

*A tool that decides what you may see has quietly decided what you may know.*
