"Having clean APIs and good docs is the MCP." That line, from a thread about uninstalling every MCP server, is half right, and the half that's wrong is where most of the interesting failures live.

"Is MCP dead?" isn't a very interesting question. "How should the agent reach this particular capability?" is. Some capabilities need a protocol. Some need nothing more than an API key and a short doc. Some need a real query interface. I don't think there's a winner, only a choice per capability.

Quick definitions, since the terms get used loosely. MCP is a protocol for listing and calling tools. A skill is a folder of instructions the agent loads when it needs it. "Code mode" means the model writes and runs a small program against an API instead of making one tool call at a time. So there are three ways to give an agent access to, say, a payments provider: load a server, read a skill that says "call the REST API with this environment variable", or write code against the SDK.

## The case for dropping the adapter

A developer posted that they'd uninstalled all their MCP servers after hitting rate limits and reading about lazy loading and code-based tool use. The replacement was deliberately dull: each credential in an environment variable, and a small skill describing how to call each API. It covered a database host, a deploy platform, a code host, a payment processor, a billing tool and about a dozen more.

The reasoning splits in two:

- **Well-known APIs.** The skill mostly hands over the credential. The model has seen the documentation a thousand times.
- **Obscure APIs.** Here the skill has to teach an unfamiliar service. The author admitted testing this case less.

A broader version of the claim came up in a thread about whether the abstraction is redundant: "having clean APIs and good docs is the MCP". The argument is that models no longer need hand-holding and businesses will become API-first anyway.

There's a solid engineering reason behind it. Command-line tools can be discovered a bit at a time. An agent can run `--help`, compose commands, and pick only the fields it needs instead of swallowing everything a tool returns.

A skill for this is tiny:

- a name and a one-line description,
- the name of the environment variable holding the token,
- three example calls,
- one hard rule: never print the token.

It has weak spots. Local, stateful servers with no public REST API (memory stores, note-taking bridges) have nothing to call directly. And the sharpest reply in the thread: "you just rejected and then reimplemented MCP". If every user writes their own skill per service, the integration work hasn't gone away. It's been spread out.

## The case for keeping MCP

The replies listed what the protocol actually buys you:

- standard access control, and a buffer against schema changes,
- one tool layer shared across several agent products,
- built-in OAuth for services that need delegated login,
- deterministic guardrails, and fewer tokens spent on the model figuring out how to make a call,
- one interface across different models.

Then there are backends that aren't REST at all, or that hold state: a reverse-engineering suite, a game engine, a browser driver. A thread about cloning websites with a browser-automation server showed the limits. That server shows the agent the visual state of the browser. One developer suggested adding a scraping server for backend-level detail, and another said responsive design still needed manual work. A protocol server is only as complete as the state it chooses to expose.

Security cuts both ways. Handing an agent a raw API key and letting it read arbitrary code each time it acts was called a "massive risk". But the skill-plus-env-var pattern puts the token somewhere the model can read too. Neither is magic. Scoped tokens are the real defense, whichever route carries them.

Here's how I'd split it:

| Capability | Sensible interface | Why |
|---|---|---|
| Stateless REST with good public docs | Env var plus a thin skill, or a CLI | The model already knows it; fewest moving parts |
| OAuth, shared team access | MCP | Auth flow and access control built in |
| Non-REST or stateful backend | MCP | Nothing else exposes the state |
| Many chained calls over large data | Code in a sandbox, read-only credentials | One program replaces many round trips |
| Questions about the whole repo | A code index that stays fresh | Grep alone gets expensive |

One participant wanted to auto-block anyone saying "MCP isn't necessary". Others agreed that MCP as a thin REST wrapper is "silly". Both can be right, on different rows of that table.

## Code mode: fewer calls, bigger blast radius

A claim went around that code mode cuts tokens by more than 60% for complex chains. It's one claim, so hold it loosely. The replies were more interesting than the number.

First, it doesn't replace MCP, because you still need some way to integrate external services; the two work together. Second, sandboxed code execution and code-writing agent frameworks have been around for years, and one developer reported a customer prototype using one with a read-only database role that "works well". Third, the skeptical take: the approach "saves some tokens by sacrificing security". And a practical worry: what stops a generated loop from running forever?

Here's my own observation, not something from the threads. Calling the API directly and code mode both move composition into code the model writes. So the guardrails have to move too: read-only roles, scoped tokens, time limits, and no network beyond what the task needs. The model writes the program. The sandbox decides what the program can touch.

## Skills aren't free either

Practitioners describe skills as "premade prompt parts with progressive disclosure". At startup the agent scans each skill's name and description and loads the full file only when it's relevant. The point is to avoid a big instruction file that loads into every conversation.

One correction kept coming up: "zero tokens when inactive" is wrong, because the frontmatter has to be read. Small, yes. Free, no.

People are also confused about how skills differ from projects with instructions, from subagents, and from memory. One data point on instruction files is useful: a project file that grew to 145 lines made compliance worse, and trimming it to 77 improved it. The author went from raw prompting to instruction files to skills to hooks, and others said people eventually realize they "need determinism".

Quality varies. A popular persona-style skill got the comment that its instructions were fluff, plus a request for a before-and-after review showing a measurable effect. A skill-evolution tool trained on failure traces reported a held-out score, while admitting it depends on a good benchmark and burns a lot of tokens. And one practical gotcha: turning a skill on in a web app doesn't make it available in a terminal agent.

Where skills clearly worked was removing repeated context. "Using agent skills made me realize how much time I was wasting repeating context." The fair reply: skills cover structural patterns, not session state.

## Permissions are part of the interface

This is where a clean architecture gets embarrassing.

One post claimed that most of a 100,000-token budget disappeared into a dependency folder, because a recursive `grep` or `find` run through the shell tool wasn't covered by the deny rules for the file-reading tool. Two permission systems, two tool families, one gap between them. The proposed fix was a pre-execution hook that inspects shell commands for blocked patterns and exits with an error.

Several developers never saw the problem. They pointed to search tools that respect ignore files by default, or to their own ignore file, and called the claim a red herring. Another noted that the built-in search prints the full relative path on every line. The author also conceded that hiding a path in a variable gets around the hook.

So the 85% figure is disputed. The general point holds anyway: when a capability can be reached through more than one tool, check the rules for each route, not for each intent. That's true for MCP, the shell and built-in tools alike.

## Weak models find bad tool design

A surprisingly useful idea: debug your tools on the weakest model you have. Strong models quietly repair malformed tool calls, strange error strings and missing tools, so the bugs stay hidden. Running cheap models surfaced a dozen harness issues that a frontier model had learned to work around.

The specifics:

1. Strong models rescue an ambiguous description by reading the tool name. Weak models guess wrong.
2. Big models fill in under-documented parameters plausibly. Small ones fill them in wrong.
3. Test against a strict parser, not a forgiving one.
4. Keep a cheap-model run in CI to cover tool calls and error paths.

The counterpoint is fair: good observability that counts failed tool calls would catch many of these too. The two go well together.

In a related case, a small local model went from under 20% to over 45% on a coding benchmark with the same weights, purely from changes to its tools: a write guard that refuses to overwrite existing files, explicit workspace discovery, and small per-turn skill injections. The comparison across model sizes was questioned, so I'd keep only the design lesson: a tool can enforce a safety rule better than a prompt can.

And as a baseline for the minimum you need: a harness in thirty lines with three tools (run a command, read a file, write a file). One reply asked why not just the command. Good question. Every tool you add is a contract you have to maintain.

## Code-intelligence tools

A whole family of tools gives the agent a query interface over the repository instead of letting it grep and read entire files. Common shapes:

- an index of the syntax tree and call graph, exposed as an MCP server,
- a command that returns callers, callees and imports for a question like "trace the authentication flow",
- a typed query language over the repo, with hooks into several agents,
- hybrid keyword and semantic search, with SQL over the results,
- documentation retrieval delivered as a skill plus a CLI instead of a server.

Their authors report striking numbers: a small model with the index beating a larger one without it on architecture docs, roughly ten times less returned context than top-three grep, perfect symbol recall on six tasks. All self-reported, on small or self-chosen tasks, and none replicated in the threads. One honest author admitted their comparison "is not a proper benchmark".

The skeptical replies were sharper than the pitches. "Serena MCP but with more steps." "Better than an LSP MCP how?" "How do you know your benchmark is trustworthy?" Requests for a with-and-without comparison. An objection that a source-available license isn't open source. A question about mapping across languages, like a Python backend with a TypeScript frontend. On the other side, one user reported months of use without ever running out of context. An anecdote, but not nothing.

A few design points worth keeping: a typed query language is more precise than free text. Shipping as a skill and CLI avoids the schema cost of a server. A routing table that loads with about a hundred tokens costs almost nothing.

## Indexes go stale

Every one of these tools has the same problem: how do you keep the index fresh when many people push every day?

One developer's post-mortem of their first version is worth reading. Hooks inferred edits. Several processes wrote to the graph. With concurrent agents, files vanished during delete-then-insert and two writers raced each other. The redesign was almost boringly classic: a level-triggered reconciler checking content hashes, a single writer, exact path ownership, bounded staleness, and a verdict for each hit (strong, weak, stale) checked against disk before anything reaches the model.

Other advice from the threads: snapshot memory at task boundaries, when tests are green, rather than re-embedding on every save. Regenerate a recursive file tree in CI so it can't rot. Run cheap drift checks for dead paths and deleted scripts.

Using Git as the storage layer is attractive: commit the canonical memory as files and keep per-checkout indexes local. The objection is real, though. Git catches mechanical conflicts, not two written decisions that contradict each other. As one comment put it, "memory is not awareness".

## Tool results can give orders

Every tool you add is a capability, and also a way in for text the model might treat as an instruction.

In one case, a researcher filed a fabricated crash report to a public error-tracking endpoint. The triage output reached a coding agent as an ordinary message, and the report suggested installing a dependency that didn't exist. Several frontier models installed it and ran it, and the attacker's code ran with repository credentials. The proposed fix splits the work: triage handles untrusted input with a read-only snapshot, no network and no secrets, and a separate privileged fixer only receives a verified reproduction. And the line worth remembering: "human reviews the PR is not a safety boundary".

A transport-layer version showed up in a study of API relay services, as reported in a thread, with a methodology others called incoherent: a small share of relays injected code into tool calls, and many honeypot sessions ran in a mode with no prompts. I'd treat the figures as unverified. The principle holds, though: anything sitting between the model and the executor can rewrite the call. Suggested defenses were a policy gate that fails closed, screening responses for anomalies, and append-only logging.

## Or skip the tool surface entirely

Notice how many of these problems disappear when the model stops being the one that acts. No tool schemas to load. No permission systems to reconcile. No index to keep fresh. No tool result to inject through.

That's the agentless approach, and I think it's a legitimate engineering choice, not a lack of ambition. The developer picks the exact files that go into context, using a file tree and fuzzy search. The model returns search/replace blocks. Those get applied and committed as a normal Git diff. The API key is the developer's own, so spend is a line on an invoice instead of a plan-limit mystery. The tool surface is exactly one thing: text in, text out.

For stateful backends, long chained workflows and greenfield prototypes, an agent with the right tools is faster, and I won't pretend otherwise. The deterministic approach wins when the codebase is complex, the stakes are real, and the reviewer is a human who has to understand the change.

## Before you add the next tool

1. Trim your instruction files first.
2. For each tool family, check which permission system covers it.
3. Run your tools once on a weak model to find ambiguous schemas.
4. Do a with-and-without comparison on your own tasks before keeping any context engine.
5. Give graph and memory tools a single writer and a staleness check.
6. Treat every report, log or ticket the agent reads as untrusted input.

A skill plus an API key often is a worse MCP server, when the service needs OAuth or shared team access. For a well-documented REST service the model already knows, it's less machinery for the same result. Whether that makes MCP unnecessary, or just moves the integration work onto every user, the threads didn't settle.
