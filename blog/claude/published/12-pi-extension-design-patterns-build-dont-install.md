# Build, Don't Install: Extension Design Patterns from People Writing Their Own Harness Features

A harness with a four-tool core and an extension API turns every user into a harness author. The features they write cluster into a few repeatable design patterns, and the same few pain points keep coming back.

> I installed nine "essential" extensions in one weekend, and by Monday two of them were fighting over the same edit tool while a third quietly added thousands of tokens to every request. I could not tell which one was helping, so I deleted all of them and started reading code.

## The harness you grow instead of configure

Engineers in the trenches describe a minimal harness the way they describe a good text editor: "the neovim of harnesses", "the Arch Linux of coding harnesses", "Lego for harness builders". The pitch is simple. The core runs a loop with a handful of tools. Everything else is yours to add.

That sounds like freedom. It is also a trap, because freedom without a pattern language is just a pile of scripts.

So here is the question this piece asks: if everyone is writing their own features, what do those features look like, and which ones deserve a copy?

The lens here is architectural. Forget the individual packages for a moment. Look at the hook each one grabs, the failure each one repeats, and what that says about the shape of the API underneath.

One framing keeps showing up in practitioner write-ups. You start with the minimal loop. You hit a failure. You ask why. Then you ask how to fix it, and you build the fix. The minimal design was motivated by control over context, not by a leaderboard score. A bare harness will score below the big agentic suites on a public benchmark, and that is fine, because the bare harness was never the product. The curated set of extensions is. Which means the real test is not "vanilla versus the competition" but "your setup versus your own tasks".

## The workflow that quietly replaced "install"

The unit of reuse is drifting from the package to the pattern. A common workflow looks like this:

1. Run the vanilla harness until you hit a real need. Web search is the usual first one.
2. Ask the agent to find or clone an existing implementation, then extract only the one behavior you want.
3. Have it rebuild that behavior as your own small extension.
4. Delete the dependency.

Take the over-packaging argument seriously. One author's whole search-and-fetch pipeline was about 100 lines: a search call that returns citations, then a fetch restricted to those citations. It was stable. Their conclusion: if something is simple enough to build in a short time, it may not need to be a package at all. Replies split in a predictable way. Some said to take inspiration and build your own, "Common Lisp macros as opposed to Java imports". Others said, fairly, that "some people just want to install a package and move on".

Both are right. But the honest accounting matters, because this approach has costs.

- Dissecting somebody else's extension into your own notes can burn a few million tokens each time. A team that does this for ten extensions has paid for a small refactor.
- Agent-modified extensions sometimes "always backfire or create new errors". The agent is a decent first-draft writer and a poor maintainer of code it does not understand.
- If someone else is paying your agent bill and the task is real work, a mature agentic tool may simply be the better choice. Building your own harness is a time investment, not a free win.

A decision rule that survives the arguments:

- **Build** when it is under roughly 100 lines, or when it touches permissions and guardrails. You want those highly customized, and you want to have read every line.
- **Install** when it is genuinely hard, such as a subagent runtime with process management and terminal panes.

## A pattern language for what people actually built

Read enough extension announcements and they collapse into six patterns. The table below is the whole map. The sections after it add the nuance.

| Pattern | What it hooks into | Typical examples | Typical failure |
|---|---|---|---|
| Gates | A tool call, before it runs | Rule files that block or prompt on dangerous shell commands and sensitive paths; confirm-before-edit tools | Pattern lists that the model walks around |
| Governors | The run, not the call | Loop and stuck-agent detectors; output trimmers; "max 200 lines per write" rules | Untested claims; trimming that breaks the cache |
| Context managers | Compaction | Observation or "ledger" strategies replacing built-in compaction | Two of them installed at once |
| Side channels | Work that must stay out of context | A side agent that reads the session but never writes to it; a scratchpad for thoughts | Hidden model calls that invalidate caches |
| Control flow | Loops the user owns | A `/for-each` prompt over files or directories; JSON-defined workflows | Over-engineering for rare cases |
| Adapters | New tools and surfaces | Web search, browser control, voice, chat bridges | Same feature rebuilt five ways, each with different trust boundaries |

### Gates

A gate intercepts a tool call before it runs. The simplest ones read a config file of patterns, each with an action of `prompt` or `block`. They sit in the middle ground between a tool that asks about everything and a harness that asks about nothing.

A nicer design comes from a tiny shell-script agent where every tool is one file with two functions: a pre-hook that validates the arguments and builds a real diff preview, and an exec function that does the work. Approval is per signature, not per tool. That is a good contrast with the usual "allow bash, yes or no" prompt, because it approves a specific action instead of a whole capability.

### Governors

Governors watch the run. They look for loops, repeated failures, and oversized tool output. The custom rules people post are blunt on purpose: cap writes at 200 lines and force a plan step, interrupt any thought over 3,000 tokens, force a written plan every five steps.

### Context and memory managers

These replace or wrap compaction. One approach swaps normal compaction for an observation log, and a later major version made compaction fully asynchronous, which also broke older sessions and changed settings. Breaking changes in something that owns your conversation history are not a small matter.

### Side channels

A side channel does work that must not enter the main context. A "by the way" agent that sees the conversation but never writes to its history, with read-only tools. A project scratchpad for thoughts you do not want to send to the model (someone called it "just a TODO list", which is correct and also fine). An external prompt composer so a half-written draft never becomes part of the live conversation.

The design rule hiding here is important. If your side channel calls a model, say so, and say where those calls land in the prompt prefix. For local models, extra requests that rewrite the front of the prompt "invalidate the KV cache" and the next real turn pays for full reprocessing. A feature that sounds free can be the most expensive thing in the session.

### Control flow

A loop that the user owns beats a loop that the user describes to the model. A `/for-each` command runs one prompt per directory child or per line of a file, and each iteration sees only its own prompt. That avoids "bias drift or context rot" and the classic "let me read all of them first" blow-up.

### Adapters

Web search is the most re-implemented feature of all, and a perfect case study: two plain command-line tools, a self-hosted metasearch engine, a provider's server-side search endpoint, hosted backends kept "discovery only", or an isolated research worker with a small model so page content never reaches the main context. Same feature, five architectures, five trust boundaries. The reader question that matters: if a fetched page contains a prompt injection, can that worker reach other tools?

## Subagents: the most built, least settled extension

The core ships none, so the threads show many independent designs and no consensus.

The first decision is in-process versus out-of-process. An in-process design uses the SDK to spin up a sub-session with async calls. An out-of-process design starts separate harness instances, usually in terminal multiplexer panes, and has them talk to the parent. Visibility is the selling point of the second. Reliability is the selling point of the first.

Reported failure modes are instructive. A three-level hierarchy where children "kept detaching, so the parent thinks the child has finished while it is still running". Implementer agents that ignore design instructions. One author cheerfully described their own subagent extension as "shitty", which is the most useful README sentence in the whole set.

The "why" argument is the real split. One side: "The only reason to use subagents is to keep context clean... If you are doing it to build some big org chart of agents... you are just playing dolls." The other: "subagents changed the game for me". Both can be true. Cleaning context is a genuine gain. An org chart with a CEO agent, middle managers and a ticketing integration, whose author notes "there is no security on this repo", mostly raises the question of who verifies the intent.

The advice that recurs is the best of the lot: start by telling the main agent to run the harness through bash for the side task. Note the friction. Then build the extension from the friction.

## Where the extension model pushes back

Here is the part that matters most for API designers.

**Conflict by construction.** Extensions collide "because of how the extension system is designed". A nice edit-rendering extension cannot coexist with an edit extension built on line hashes, because both re-register the same built-in tool. Proposed fixes: split the rendering layer from the execution layer, add request-and-response messaging between extensions instead of only an event bus, or let authors export functions instead of registering competing tools. The counter-reply is fair too: "that is the point, write your own".

**Missing API calls.** An extension can remove an expensive tool from the active set but cannot defer it, because nothing lets it change how a tool is presented to the model. One user patched the harness and measured a request falling from roughly 21,000 tokens to about 5,500. That is the clearest list of what an extension API must expose.

**Popularity is not quality.** "Don't install popular extensions, they aren't, just downloaded by bots through extensive updating." "The top 20 to 30 extensions are heavily opinionated and bloated." One popular context tool reportedly added around 12,000 tokens to every request, and removing it dropped a 30,000 baseline to 18,000. Download counts are not installs. They are not endorsements either.

## What a good API makes easy

## Measuring an extension

Nobody in this body of experience posted a clean before-and-after for an extension. A minimal protocol, offered here as a suggestion and not something the threads did:

1. Fix a task set of ten tasks you actually do.
2. Capture the on-the-wire request size and cache hit rate for each.
3. Count tool calls per task and edits you had to revert.
4. Run with and without the extension. Keep it only if the numbers move.

## The deterministic answer

Notice what every pattern above is trying to recover: control. A gate controls what runs. A governor controls how much comes back. A side channel controls what enters context. Control flow controls the loop. Every successful extension is a small, boring piece of determinism wrapped around a probabilistic core.

That points at the same philosophy from the other direction. Pick exactly which files go into the prompt. Bring your own key and watch the bill per call. Let the model propose a Search/Replace block, then apply it as a normal Git diff you can read, revert and commit. No hidden agent loop deciding what to read next, no memory layer rewriting history behind your back. When the harness is that explicit, there is far less to extend, and far less to conflict.

Agentic harnesses earn their keep on greenfield prototypes and on tasks that really do need exploration. Nobody serious disputes that. But on a mature codebase, the extension zoo is an admission that the loop needs supervising, and a supervised loop with explicit inputs is simply a tool you drive.

## A checklist for writing or adopting an extension

1. Have you actually hit the problem in real use? Only add what you miss and need.
2. Could it be a skill or a single prompt line? If yes, stop.
3. Use the smallest hook that works: a gate, a command, a widget. Do not re-register built-in tools.
4. State your footprint in the README: system-prompt tokens added, tool schemas added, extra model calls (and whether they break cache or KV reuse), what is stored and where, and what breaks next to another compaction or edit extension.
5. Namespace tool names and export functions for others to call.
6. Isolate anything that reads untrusted content, and say what the worker can reach.
7. Ship an off switch and lazy loading. Cost nothing until enabled.
8. Version deliberately: dry-run migrations, breaking-change notes, an upgrade path.
9. Say what it is in the first line, with a screenshot.
10. When adopting someone else's: read the source, pin the version, check who maintains it, and keep a copy you own.

## FAQ

**Doesn't building everything yourself just move the supply-chain risk to your own bugs?** Partly, yes. But you can read 100 lines in ten minutes, and you cannot read a dependency tree; the trade is a smaller attack surface for a larger maintenance duty.

**If extensions conflict this often, isn't the minimal-core idea a failure?** Not necessarily. Conflicts show where the API is too thin, and a core that stays small is easier to fix than a core that absorbs every feature, though users pay in the meantime.

**Why not let the agent write and maintain all its own extensions?** I have watched agents produce a clean first draft and then break it on the third edit. They are good at generating code and weaker at owning it, so a human should still review the diff.

**Is any of this worth it versus just paying for a mature tool?** If someone else covers the bill and the work is urgent, a mature tool wins. The build route pays off when control, auditability or cost matter more than the first week of convenience.

## Key Takeaways

- Extensions fall into six patterns (gates, governors, context managers, side channels, control flow, adapters), and each has a known failure mode worth designing against.
- Build small and security-sensitive features yourself; install only what is genuinely hard, and treat download counts as noise.
- Measure every extension against a fixed task set, because a feature that cannot show its before-and-after is a belief, not an improvement.

*The best harness feature is the one whose behavior you can explain in a sentence and revert with one command.*
