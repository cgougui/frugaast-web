When a local model stops halfway through tasks and mangles file names, the weights are usually the last thing to blame. The chat template, the sampler, the quant format and a default token limit all get there first.

Some harnesses are upfront about who they were built for. The minimal ones tell you to "trust the model", on the theory that frontier models have been RL-trained "up the wazoo" on exactly this kind of tool loop: fewer guardrails, fewer prompts, less overhead. That's a fine bet if you're renting a frontier model. It's a different bet if you're running a quantized 35B on a 24GB card at home.

People do run that, with mixed results. Some say a mid-size local model is "absolutely" a great fit. Others hit a wall: one model "tried to use tools in unsupported ways and was not able to recover". Both are true. The difference is rarely the model's raw intelligence. It's almost always what sits between the weights and the harness.

So when the patient walks in saying "it stops mid-task", don't operate. Run the cheap tests first, in order, and only escalate when they come back clean. Everything below comes from practitioner reports, not controlled experiments, and nobody in these threads isolated a single cause. Treat it as a debugging order, not a diagnosis.

## Step 1: the serving stack

The cheapest test is also the most embarrassing one: change the server.

A typical report: a quantized model on a high-end laptop is "fast and clever" at planning, then falls apart on edits. It loops on whitespace and indentation. It even writes little scripts to count spaces so it can avoid calling the write tool. One setup measured about 14 tokens per second on a 27B and 74 on a 35B mixture-of-experts model through one server, and neither could edit. Switching to llama.cpp cost some speed and the tool calls started working.

The community's diagnosis was specific: the 8-bit floating-point quantization format was the culprit, and a plain q8_0 quant got rid of the indentation problem. The same model ran with "no issues" on llama.cpp. Another runtime showed the same symptom.

Why would a quant break edits in particular? A search/replace edit needs an exact whitespace match. A model whose logits are slightly off will happily write four spaces where the file has a tab. In prose, nobody notices. In an exact-match edit, the whole call fails. (That's my hypothesis; no thread tested it.)

Then the second classic: the agent that "stops midway on every run". The same task finished fine on a hosted frontier model, so people blamed the model. The causes people found were boring:

- a bug in the chat template (Jinja), with the advice to use llama.cpp and a community-fixed template;
- the model's thinking not being kept between turns (`preserve_thinking`);
- the harness default for `maxTokens` (16384) cutting off long outputs; it's configurable in the model config, and the harness does print an error when it happens;
- a context that was "almost full" most of the time, so the answer was a new session or a compaction.

One practitioner fixed the annoyance with a tiny extension that automatically replies "continue" on error. A band-aid, yes, but a cheap one.

Here's the kind of llama.cpp line that circulates in these threads:

```
llama-server -fa on -c 262144 -ctk q8_0 -ctv q8_0 \
  --temp 0.1 --top_p 0.95 --top_k 20
```

You don't have to copy it. You need a baseline written down, so when something breaks you can diff against a setup that worked.

## Step 2: the sampler

A stranger symptom. A team running a home-lab setup (llama.cpp on ROCm, behind a LiteLLM proxy, a Q6_K quant of a 27B model) saw the harness corrupt paths it had built itself. A directory name gained a letter. An uppercase file name ended with the wrong character. A `.md` extension became `.dmd`. A long constant-style name got cut short.

The telling detail: another agent, and a raw `curl` against the same model and backend, were clean.

The poster's hypothesis was that low-confidence tokens flip when the model regenerates text character by character. When the model copies a long identifier it saw earlier, there's a tug-of-war between "repeat what's in context" and "sample something plausible". Tilt the sampler against repetition and the copy fails.

That's where experienced developers in the thread pointed. Someone using the DRY sampler (which penalizes repeated sequences) had seen the same corruption. Removing DRY fixed the paths. Then the model got stuck in a loop.

That's the trade-off in one sentence: the setting that stops loops also corrupts what agents do most, which is copying exact strings.

Other suspects came up, like the KV cache quantization type and how full the context was. None were confirmed.

### A guard in ten lines

This is where the harness earns its keep. Instead of fighting the sampler, add a pre-tool hook:

1. Intercept every read, edit or write call.
2. Check that the path exists (or, for a new file, that its parent directory does).
3. If not, find the closest known path by edit distance.
4. Reject the call with a corrective message: "that path does not exist; did you mean X?"

A model that flips one token now costs you a single extra turn, instead of a silently created `hommelab/` directory. As one developer put it, it's not the harness's fault, but the harness's hooks make it easy to enforce path conventions.

You're not trying to make the model perfect. You're making its mistakes cheap.

## Step 3: malformed tool calls

Small models also emit tool calls in formats the harness doesn't expect. Fenced `json` blocks. XML like `<tool_call>` or `<function_calls><invoke>`. Bare JSON objects. Python-list syntax like `[Read(path='./foo.ts')]`. Even the argument key changes between `parameters`, `input` and `arguments`.

One standalone extension hooks the end of each message and repairs the call. Its safety rules are the part worth copying:

- it only fires when the message has no native tool-use blocks;
- it checks the tool name against the harness's registered tools before converting anything.

Another package does something similar. One summary of the approach stuck with me: "adapting the tool to the hallucination" instead of "fighting the weights". Changing weights costs a GPU-month. A parser costs an afternoon.

A related idea sidesteps the problem: remove the individual tools and expose them as functions in a TypeScript or Python sandbox, on the theory that small models call functions correctly more often in an environment they were trained on. That's one practitioner's claim, without numbers. Interesting, not proven.

The edit format matters too. Some people recommend line-addressed ("hashline") edit tools as a real "nuts and bolts" improvement, because they avoid exact whitespace matching. That fits the indentation story above, though again nobody tested it directly.

## Step 4: the small orchestrator that does everything itself

Another repeatable failure: give a 27B model the orchestrator role with subagents available, and it spends 20+ turns reading and grepping files itself. Delegation, the whole point of the setup, never happens.

One practitioner fixed it with a turn counter: three grace turns, then seven working turns without a subagent call. After that, every tool except "spawn subagent" and "execute task" is blocked.

The pseudocode is almost insultingly simple:

```
on tool_call(name):
    if name in DELEGATION_TOOLS: counter = 0; allow
    counter += 1
    if counter > GRACE + WORK and name not in DELEGATION_TOOLS:
        block("Delegate now.")
```

Two fair objections came up. Why not block the tools outright and always force delegation? And does every handoff from orchestrator to subagent lose information, with the loss compounding for small models? Nobody answered the second one.

Subagents in general split opinion. One camp doubts they have "much value, and quite possibly they cause harm". Another says they "heavily improve the output" and clean up noisy web search results. A third avoids them and branches the session tree instead, which keeps the same cache prefix. All reasonable. Autonomy and delegation do well on greenfield work with a strong model. With a small model on a mature codebase, every extra hop is another place to lose the thread.

## Step 5: compaction on slow hardware

A user running a 27B at about 160k context on a 16GB card found automatic compaction painfully slow. The explanation offered: the harness uses its own system prompt for the summarization call, so llama.cpp sees a different prefix and has to reprocess the entire context before writing anything. Then the harness passes along the summary, about 20k tokens of recent history, and the normal prompt on top. (The summary of that explanation was cut off, so check the source before relying on it.)

The suggested fixes all came down to one idea: stop using the model to summarize itself. A deterministic compactor that needs no second model got the word "incredible" from the person who tried it. Cache-friendly rewinds, where the agent discards the last turn and the server keeps the unchanged prefix, reportedly saved about 20k tokens of reprocessing.

Some cache questions stayed open: does putting editor state in the system prompt break the cache? Does switching models per prompt? Nobody answered.

## The order, as a table

| Step | Check | Symptom it explains |
|---|---|---|
| 1 | Server: try llama.cpp if edits fail elsewhere | Edit loops, unusable tool calls |
| 2 | Quant: q8_0 before exotic formats | Whitespace and indentation loops |
| 3 | Chat template, `preserve_thinking` | Stops mid-task |
| 4 | `maxTokens` | Truncated output, silent stops |
| 5 | Sampler: turn off DRY if paths get corrupted | Corrupted identifiers, then loops |
| 6 | KV cache type, how full the context is | Degradation late in a session |
| 7 | Harness hooks: path guard, call repair, turn limiter | Whatever's left |

Change one thing per run. Keep your baseline. Note whether each finding was measured or anecdotal.

## Cheap hosted models fail the same way

Cheap hosted models fail in the same spirit. One model ignored project instruction files that a different model on the identical setup obeyed. It turned out to need compatibility flags: no "developer" role, a different thinking format, streamed tool arguments, a specific name for the max-tokens field. Same harness, different dialect.

Reports on which cheap model is "marginally better" contradict each other, and prices keep changing. One user burned a double-digit dollar sum in two days on the slower option; another uses a bigger model for planning, a smaller one to implement, and a third for hard tasks. Keep that in mind when a benchmark says one harness "passed in 90 turns" while another needed 187. Turns are API calls, and a smaller system prompt may be doing most of the work.

## Small models make mistakes more expensive

A weaker model makes more mistakes, so the blast radius matters more. People layer sandboxes (process-level, a container with a proxy sidecar, restricted shells, since scripts can escape the project directory), per-edit approval loops, and undo through version control. One point worth repeating: rewinding the conversation doesn't rewind the files. Only Git does that.

## Shrink what the model is trusted with

None of these fixes make the model smarter. They shrink what it's trusted to do.

That's the case for deterministic control. You choose the files that go into the prompt, so the context stays small enough for a 16GB card. The model proposes a search/replace block, and a normal Git diff shows exactly what changed. With your own key or your own local endpoint, every call's cost is a number you can read. No loop wandering off for twenty turns, no orchestrator forgetting to delegate, because there's no orchestrator.

Autonomy has its place, and prototyping a greenfield app with a strong model is a perfectly good use of it. But a mid-size model on a codebase you care about is exactly where "trust the model" should become "check the diff".

None of this means small local models can't do real work. Plenty of people use them productively. But most of the work is in the setup, and it's fair to count that time as part of the cost. If your time is the expensive part, paying for a frontier model is often the right call. Local wins when privacy, offline use or per-token cost dominates.

Two cautions about the fixes themselves. A hook that quietly repairs malformed calls can hide a regression, so log every repair and watch the count. And to know a fix worked rather than got lucky, run the same task several times with one thing changed. A single run on a single repo proves very little, including the ones above.
