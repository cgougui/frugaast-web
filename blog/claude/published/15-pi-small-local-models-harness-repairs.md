# When the Local Model Misbehaves, Debug the Stack Before the Weights

Most "the local model is broken in the agent" reports turn out to be serving-stack, chat-template or sampler bugs, not bad weights. The fixes that last are small guards and repair hooks wrapped around the model, not another round of prompt tweaks.

> I spent a weekend convinced my 27B model had gone stupid, because it kept stopping halfway through a task and mangling file names. The model was fine; I had changed three settings at once and blamed the wrong one.

## The setup: a harness built for frontier models

Some harnesses are honest about who they were built for. The minimal ones tell you to "trust the model", on the theory that frontier models have been RL-trained "up the wazoo" on exactly this kind of tool loop. Fewer guardrails, fewer prompts, less overhead.

That is a fine bet if you rent a frontier model. It is a different bet if you run a quantized 35B on a 24GB card at home.

And people do exactly that. Some report that a mid-size local model is "absolutely" a great fit. Others hit a wall: one model "tried to use tools in unsupported ways and was not able to recover". Both reports are true. The difference is rarely the model's raw intelligence. It is almost always what sits between the weights and the harness.

So this article takes a **triage lens**. Think of a hospital, not a debate club. A patient walks in with "it stops mid-task". You do not operate. You run the cheap tests first, in order, and only escalate when the cheap tests come back clean.

A note on evidence. Everything below is practitioner reports, not controlled experiments. Nobody in these threads isolated a single cause. Treat the order as a debugging order, not a diagnosis.

## Triage level 1: the serving stack

The cheapest test is also the most embarrassing one. Change the server.

A typical report: a quantized model on a high-end laptop is "fast and clever" in planning, then falls apart on edits. It loops on whitespace and indentation. It even writes little scripts to count spaces so that it can avoid calling the write tool. One setup measured roughly 14 tokens per second on a 27B and 74 on a 35B mixture-of-experts model through one server, and neither could edit. Switching to llama.cpp cost some speed and made the tool calls work.

The community diagnosis was specific. The 8-bit floating-point quantization format was the culprit, and a plain q8_0 quant removed the indentation problem. The same model ran with "no issues" on llama.cpp. Another runtime showed the same symptom.

Why would a quant break edits in particular? A Search/Replace edit needs an exact match on whitespace. A model whose logits are slightly off will happily produce `    ` four spaces where the file has a tab. For prose, nobody notices. For an exact-match edit, the whole call fails. (That whitespace link is a hypothesis; no thread tested it.)

Then there is the second classic: the agent that "stops midway on every run". The same task finished fine on a hosted frontier model, so the model was blamed. The reported causes were boring:

- a chat template (Jinja) bug, with the advice to use llama.cpp and a community-fixed template;
- the model's thinking content not being preserved between turns (`preserve_thinking`);
- the harness default for `maxTokens` (16384) truncating long outputs, which is configurable in the model config, and the harness does print an error when it happens;
- a context that was "almost full" most of the time, so the answer was a new session or a compaction.

One practitioner solved the annoyance with a tiny extension that auto-replies "continue" on error. A band-aid, yes. A cheap one, also yes.

Here is a reproducible baseline, the kind of llama.cpp line that circulates in these threads:

```
llama-server -fa on -c 262144 -ctk q8_0 -ctv q8_0 \
  --temp 0.1 --top_p 0.95 --top_k 20
```

You do not have to copy it. You need *a* baseline, written down, so that when something breaks you can diff against a state that worked.

## Triage level 2: the sampler

Now a stranger symptom. A team running a home-lab setup (llama.cpp on ROCm, behind a LiteLLM proxy, a Q6_K quant of a 27B model) saw the harness corrupt paths it constructed. A directory name gained a letter. An uppercase file name ended in the wrong final character. A `.md` extension became `.dmd`. A long constant-style name was cut short.

The telling detail: another agent and a raw `curl` against the same model and backend were clean.

The poster's hypothesis was character-level regeneration where low-margin tokens flip. When the model copies a long identifier it has seen earlier, there is a probability tug-of-war between "repeat what is in context" and "sample something plausible". Tilt the sampler against repetition and the copy fails.

Which is where the experienced developers in the thread pointed. A user of the DRY sampler (the one that penalizes repeated sequences) had seen the same corruption. Removing DRY fixed the paths. And then the model got stuck in a loop.

That is the trade-off in one sentence: the setting that stops loops also corrupts the thing agents do most, which is copying exact strings.

Other suspects raised: the KV cache quantization type, and how full the context was. None confirmed.

### A guard you can write in ten lines

Here the harness earns its keep. Instead of arguing with the sampler, add a pre-tool hook:

1. Intercept any read, edit or write call.
2. Check that the path exists (or, for a new file, that its parent directory exists).
3. If not, find the closest known path by edit distance.
4. Reject the call with a corrective message: "that path does not exist; did you mean X?"

A model that flips one token gets a one-turn round trip instead of a silently created `hommelab/` directory. Experienced developers put it neatly: it is not the harness's fault, but the harness's hooks make it easy to enforce path conventions.

Notice the philosophy. You are not trying to make the model perfect. You are making its imperfection cheap.

## Triage level 3: malformed tool calls

Small models also emit tool calls in formats the harness does not expect. Fenced `json` blocks. XML such as `<tool_call>` or `<function_calls><invoke>`. Bare JSON objects. Python-list syntax like `[Read(path='./foo.ts')]`. Even the argument key changes between `parameters`, `input` and `arguments`.

One standalone extension handles this by hooking the end of each message and repairing the call. Its safety rules are the part worth copying:

- it only fires when there are no native tool-use blocks in the message;
- it validates the tool name against the harness's registered tool list before converting anything.

Another package does something similar. One summary of the whole approach has stuck: **"adapting the tool to the hallucination"** instead of "fighting the weights". Weights cost a GPU-month to change. A parser costs an afternoon.

A related idea moves the problem sideways. Remove the individual tools and expose them as functions in a TypeScript or Python sandbox, on the theory that small models call functions correctly more often in an environment they were trained on. One practitioner's claim, no numbers. Interesting, not proven.

And the edit format matters too. Line-addressed ("hashline") edit tools are recommended by some as real "nuts and bolts" improvements, because they avoid exact-whitespace matching. That fits the indentation story above, though again no thread tested it directly.

## Triage level 4: the small orchestrator that does everything itself

Another repeatable failure: you give a 27B model the role of orchestrator, with subagents available, and it spends 20+ turns reading and grepping files itself. Delegation, the point of the setup, never happens.

The fix one practitioner reported was a turn counter. Three grace turns, then seven working turns without a subagent call. After that, every tool except "spawn subagent" and "execute task" is blocked.

The pseudo-code is almost insulting in its simplicity:

```
on tool_call(name):
    if name in DELEGATION_TOOLS: counter = 0; allow
    counter += 1
    if counter > GRACE + WORK and name not in DELEGATION_TOOLS:
        block("Delegate now.")
```

Two honest objections surfaced. One: why not block the tools outright and force delegation always? Two: is every orchestrator-to-subagent handoff lossy, and does the loss compound for low-parameter models? Nobody answered the second one.

And subagents in general split opinion. One camp doubts they have "much value, and quite possibly they cause harm". Another says they "heavily improve the output" and clean up noisy web search results. A third avoids them entirely and branches the session tree instead, which keeps the same cache prefix. It is a fair fight. Autonomy and delegation do well on greenfield work with a strong model. With a small one on a mature codebase, every extra hop is another place to lose the thread.

## Triage level 5: compaction on slow hardware

A user running a 27B at about 160k context on a 16GB card found automatic compaction painfully slow. The explanation offered: the harness uses a custom system prompt for the summarization call, so llama.cpp sees a different prefix and has to reprocess the entire context before it writes a word. Then the harness passes the summary, roughly 20k tokens of recent history and the normal prompt on top. (The digest of that explanation was truncated; verify against the source before relying on it.)

Suggested remedies were all variations on one idea: stop using the model to summarize itself. A deterministic compactor that needs no second model got the word "incredible" from the person who tried it. Cache-friendly rewinds, where the agent discards the last turn and the server keeps the unchanged prefix, were reported to save around 20k tokens of reprocessing.

Cache caveats were raised and left open: does putting editor state in the system prompt bust the cache? Does per-prompt model switching? Same question, no answer.

## The checklist, as a table

Here is the order in which to check things, cheapest first:

| Step | Check | Symptom it explains |
|---|---|---|
| 1 | Server: try llama.cpp if edits fail elsewhere | Edit loops, unusable tool calls |
| 2 | Quant: q8_0 before exotic formats | Whitespace and indentation loops |
| 3 | Chat template, `preserve_thinking` | Stops mid-task |
| 4 | `maxTokens` | Truncated outputs, silent stops |
| 5 | Sampler: disable DRY if paths corrupt | Corrupted identifiers, then loops |
| 6 | KV cache type, context fullness | Late-session degradation |
| 7 | Harness hooks: path guard, parser repair, turn limiter | What is left |

Change one variable per run. Keep the baseline line. Mark each finding as measured or anecdotal.

## The cheap hosted cousins

Cheap hosted models fail in the same spirit. A model that ignored project instruction files while a different model on the identical setup obeyed them turned out to need compatibility flags: no "developer" role, a different thinking format, streamed tool arguments, a specific max-tokens field name. Same harness, different dialect.

Reports about which cheap model is "marginally better" are contradictory, and prices shift. One user burned a double-digit dollar sum in two days on the slower option; another uses a bigger model for planning, a smaller one for implementation, and a third for hard tasks. Keep that in mind when reading any benchmark claiming one harness "passed in 90 turns" while another needed 187: turns are API calls, and a smaller system prompt may be doing most of the work.

## Small models raise the price of mistakes

A weaker model makes more mistakes, so the blast radius matters more. People layer sandboxes (process-level, container with a proxy sidecar, restricted shells, since scripts can escape the project directory), per-edit approval loops, and undo through version control. One point worth repeating: rewinding the conversation does not rewind the files. Only Git does that.

## The deterministic answer

Notice what all these fixes have in common. None of them make the model smarter. They shrink what the model is trusted to do.

That is the case for deterministic control. You choose the files that go into the prompt, so the context stays small enough for a 16GB card. The model proposes a Search/Replace block, and a standard Git diff shows exactly what changed. Bring your own key or your own local endpoint, and the cost of every call is a number you can read. No loop that might wander off for twenty turns, no orchestrator that forgets to delegate, because there is no orchestrator.

Autonomy has its place. Prototyping a greenfield app with a strong model is a perfectly good use. But a mid-size model on a codebase you care about is exactly where "trust the model" should become "verify the diff".

## FAQ

**Is all this just an admission that small local models cannot do real work?**
I do not think so; many people run them productively. But I would say the work is mostly in the setup, and it is fair to count that setup time as part of the cost.

**Why not just pay for a frontier model and skip the debugging?**
Often that is the right call, especially when your time is the expensive part. Local models win when privacy, offline use or per-token cost dominates, and they lose when you value your weekend.

**Do repair hooks hide real model problems?**
They can. A hook that quietly fixes malformed calls will mask a regression, so log every repair and look at the count.

**How do I know a fix worked and was not luck?**
Run the same task several times with one variable changed. Single runs on a single repo prove very little, including the ones above.

## Key Takeaways

- Debug in order: server, quant, template, `maxTokens`, sampler, KV cache, and only then blame the weights.
- Adapt the tool to the failure: path guards, output-format repair and turn limiters are cheap, testable and reversible.
- Keep context small, edits as exact diffs and changes in Git, so a weaker model costs less when it is wrong.

*A model you cannot trust completely is not a problem to solve. It is a budget to manage.*
