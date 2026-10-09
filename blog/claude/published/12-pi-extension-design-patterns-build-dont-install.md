"The neovim of harnesses." "The Arch Linux of coding harnesses." "Lego for harness builders." That's how people describe minimal coding harnesses: the core runs a loop with a handful of tools, and everything else is yours to add.

It's also how you end up with nine "essential" extensions installed in a weekend, two of them fighting over the same edit tool, and a third quietly adding thousands of tokens to every request.

A minimal core is freedom, and also a trap, because freedom without shared patterns is just a pile of scripts. So I went through what people actually build, looking at which hook each extension grabs, how it tends to fail, and what that says about the API underneath.

One framing comes up again and again in practitioner write-ups. Start with the minimal loop. Hit a failure. Ask why, figure out a fix, build it. The minimal design is about controlling context, not about leaderboard scores. A bare harness will score below the big agentic suites on a public benchmark, and that's fine, because the bare harness was never the product. Your curated set of extensions is. So the real test isn't vanilla versus the competition. It's your setup against your own tasks.

## The workflow that replaced "install"

What people reuse is shifting from packages to patterns. A common workflow:

1. Run the vanilla harness until you hit a real need. Web search is usually the first.
2. Ask the agent to find or clone an existing implementation and pull out only the behavior you want.
3. Have it rebuild that behavior as your own small extension.
4. Delete the dependency.

The argument against over-packaging is worth taking seriously. One author's entire search-and-fetch pipeline was about 100 lines: a search call that returns citations, then a fetch restricted to those citations. It was stable. Their conclusion: if something is simple enough to build quickly, it might not need to be a package. Replies split predictably. Some said take inspiration and build your own, "Common Lisp macros as opposed to Java imports". Others said, fairly, that "some people just want to install a package and move on".

Both are right, but this approach has real costs:

- Having the agent take apart someone else's extension can burn a few million tokens each time. Do it for ten extensions and you've paid for a small refactor.
- Extensions modified by agents sometimes "always backfire or create new errors". The agent writes a decent first draft and maintains code it doesn't understand badly.
- If someone else pays your agent bill and the task is real work, a mature agentic tool may just be the better choice. Building your own harness costs time.

The decision rule that survives the arguments:

- **Build** when it's under roughly 100 lines, or when it touches permissions and guardrails. You want those customized, and you want to have read every line.
- **Install** when it's genuinely hard, like a subagent runtime with process management and terminal panes.

## Six patterns

Read enough extension announcements and they fall into six patterns:

| Pattern | Hooks into | Examples | Typical failure |
|---|---|---|---|
| Gates | A tool call, before it runs | Rule files that block or prompt on dangerous shell commands and sensitive paths; confirm-before-edit tools | Pattern lists the model walks around |
| Governors | The whole run | Loop and stuck-agent detectors; output trimmers; "max 200 lines per write" rules | Untested claims; trimming that breaks the cache |
| Context managers | Compaction | Observation or "ledger" strategies replacing the built-in compaction | Two of them installed at once |
| Side channels | Work that has to stay out of context | A side agent that reads the session but never writes to it; a scratchpad | Hidden model calls that invalidate caches |
| Control flow | Loops the user owns | A `/for-each` prompt over files or directories; workflows defined in JSON | Over-engineering for rare cases |
| Adapters | New tools and surfaces | Web search, browser control, voice, chat bridges | The same feature built five ways, each with different trust boundaries |

### Gates

A gate intercepts a tool call before it runs. The simplest ones read a config file of patterns, each with a `prompt` or `block` action. They sit between a tool that asks about everything and a harness that asks about nothing.

A nicer design comes from a tiny shell-script agent where every tool is one file with two functions: a pre-hook that validates the arguments and builds a real diff preview, and an exec function that does the work. You approve a specific call, not a whole tool. Compare that with the usual "allow bash, yes or no" prompt, which approves an entire capability.

### Governors

Governors watch the whole run, looking for loops, repeated failures and oversized tool output. The rules people post are blunt on purpose: cap writes at 200 lines and force a planning step, interrupt any thought over 3,000 tokens, force a written plan every five steps.

### Context managers

These replace or wrap compaction. One swaps normal compaction for an observation log. A later major version made compaction fully asynchronous, which also broke older sessions and changed settings. Breaking changes in something that owns your conversation history aren't a small thing.

### Side channels

A side channel does work that mustn't enter the main context. A "by the way" agent that sees the conversation but never writes to its history, with read-only tools. A project scratchpad for thoughts you don't want to send to the model (someone called it "just a TODO list", which is correct and also fine). An external prompt composer, so a half-written draft never ends up in the live conversation.

There's an important rule hidden here. If your side channel calls a model, say so, and say where those calls land in the prompt prefix. With local models, extra requests that rewrite the start of the prompt "invalidate the KV cache", and the next real turn pays for full reprocessing. A feature that sounds free can be the most expensive thing in the session.

### Control flow

A loop you own beats a loop you describe to the model. A `/for-each` command runs one prompt per directory entry or per line of a file, and each iteration only sees its own prompt. That avoids "bias drift or context rot" and the classic "let me read all of them first" blowup.

### Adapters

Web search is the most reimplemented feature of all, and a good case study: two plain command-line tools, a self-hosted metasearch engine, a provider's server-side search endpoint, hosted backends kept "discovery only", or an isolated research worker on a small model so page content never reaches the main context. Same feature, five architectures, five trust boundaries. The question that matters: if a fetched page contains a prompt injection, can that worker reach other tools?

## Subagents: built the most, settled the least

The core ships no subagents, so people have built many designs and agreed on none.

The first choice is in-process or out-of-process. An in-process design uses the SDK to start a sub-session with async calls. An out-of-process design starts separate harness instances, usually in terminal multiplexer panes, which report back to the parent. The second one gives you visibility. The first gives you reliability.

The reported failures are instructive. A three-level hierarchy where children "kept detaching, so the parent thinks the child has finished while it is still running". Implementer agents ignoring design instructions. One author cheerfully called their own subagent extension "shitty", which is the most useful README sentence in the whole set.

The real split is over why you'd want subagents at all. One side: "The only reason to use subagents is to keep context clean... If you are doing it to build some big org chart of agents... you are just playing dolls." The other: "subagents changed the game for me". Both can be true. Keeping context clean is a real gain. An org chart with a CEO agent, middle managers and a ticketing integration, whose author notes "there is no security on this repo", mostly raises the question of who checks what the agents meant to do.

The best advice: start by telling the main agent to run the harness through bash for the side task. Notice where it's awkward. Then build the extension around that.

## Where the extension model pushes back

This part matters most if you design APIs.

**Conflicts are built in.** Extensions collide "because of how the extension system is designed". A nice edit-rendering extension can't coexist with an edit extension based on line hashes, because both re-register the same built-in tool. Proposed fixes: separate rendering from execution, add request-and-response messaging between extensions instead of only an event bus, or let authors export functions instead of registering competing tools. The counter-reply is fair too: "that is the point, write your own".

**Missing API calls.** An extension can remove an expensive tool from the active set, but it can't defer it, because nothing lets it change how a tool is presented to the model. One user patched the harness and measured a request dropping from about 21,000 tokens to about 5,500. That's the clearest example of what an extension API needs to expose.

**Popular doesn't mean good.** "Don't install popular extensions, they aren't, just downloaded by bots through extensive updating." "The top 20 to 30 extensions are heavily opinionated and bloated." One popular context tool reportedly added about 12,000 tokens to every request; removing it dropped a 30,000-token baseline to 18,000. Download counts aren't installs, and they aren't endorsements.

## Measure before you keep it

Nobody I read posted a clean before-and-after for an extension. Here's a minimal way to do it (my suggestion, not something from the threads):

1. Pick ten tasks you actually do.
2. Record the request size on the wire and the cache hit rate for each.
3. Count tool calls per task and edits you had to revert.
4. Run with and without the extension. Keep it only if the numbers move.

## What all six patterns are after

Every pattern above is trying to win back control. A gate controls what runs. A governor controls how much comes back. A side channel controls what enters context. Control flow controls the loop. Every successful extension is a small, boring piece of determinism wrapped around a probabilistic core.

You can approach that from the other direction. Pick exactly which files go into the prompt. Use your own key and watch the cost of each call. Let the model propose a search/replace block, then apply it as a normal Git diff you can read, revert and commit. No hidden agent loop deciding what to read next, no memory layer rewriting history behind your back. When the harness is that explicit, there's much less to extend and much less to conflict.

Agentic harnesses earn their keep on greenfield prototypes and tasks that really need exploration. Nobody serious disputes that. But on a mature codebase, a zoo of extensions is an admission that the loop needs supervising, and a supervised loop with explicit inputs is just a tool you drive.

## Before you write or adopt an extension

1. Have you actually hit the problem in real use? Only add what you miss.
2. Could it be a skill or a single line in the prompt? Then stop there.
3. Use the smallest hook that works: a gate, a command, a widget. Don't re-register built-in tools.
4. Document the footprint in the README: system-prompt tokens added, tool schemas added, extra model calls (and whether they break cache or KV reuse), what's stored and where, and what breaks alongside another compaction or edit extension.
5. Namespace tool names, and export functions others can call.
6. Isolate anything that reads untrusted content, and say what that worker can reach.
7. Ship an off switch and lazy loading, so it costs nothing until enabled.
8. Version deliberately: dry-run migrations, notes on breaking changes, an upgrade path.
9. Say what it does in the first line, with a screenshot.
10. When adopting someone else's: read the source, pin the version, check who maintains it, and keep a copy you own.

Building everything yourself does trade supply-chain risk for your own bugs. But you can read 100 lines in ten minutes, and you can't read a dependency tree. I've also watched agents write a clean first draft of an extension and break it on the third edit. They're good at generating code and weaker at owning it, so a human still needs to review the diff. And if someone else is paying and the work is urgent, a mature tool wins. Building your own pays off when control, auditability or cost matter more than convenience in the first week.
