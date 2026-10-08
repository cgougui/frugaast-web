# MCP, Skills, Raw APIs or Code Mode? Choosing How an Agent Reaches Its Tools

The argument over whether MCP is "dead" has quietly turned into a better question: which capabilities need a protocol, which need only a credential and a short markdown file, and which need a purpose-built query interface? Each answer has its own failure modes, and the tool contract itself turns out to be a design artifact worth testing.

> I spent a weekend wiring a dozen services into an agent, and the part that broke was never the model. It was a permission rule that covered one tool family and silently skipped another.

## The Architectural Lens

This article treats a tool interface the way an architect treats an API boundary: by asking what crosses it, who trusts whom, and what happens when one side drifts. It does not benchmark token savings (that is a separate topic) and it does not pick a winner. The decision is per capability, not a religion.

A little background first, since the vocabulary gets thrown around loosely. MCP is a protocol for listing and calling tools. A skill is a folder of instructions that an agent loads on demand. "Code mode" means the model writes and runs a small program against an API instead of making one tool call at a time. Three ways to give an agent access to a payments provider, for example: load a server, read a skill that says "call the REST API with this environment variable", or write code against the SDK.

## The Case Against the Adapter Layer

A developer posted that they had uninstalled all their MCP servers after hitting rate limits and reading about lazy loading and code-based tool use. Their replacement was dull on purpose: each credential lives in an environment variable, and a small skill describes how to call each API. The stack covered a database host, a deploy platform, a code host, a payment processor, a billing tool and about a dozen more.

The logic has two cases.

- **Famous APIs the model already knows.** The skill mostly hands over the credential. The model has seen the documentation a thousand times.
- **Obscure APIs.** Here the skill has to teach an unfamiliar service. The author admitted testing this case less.

The broader claim, from a thread on whether the abstraction is redundant: "having clean APIs and good docs is the MCP". The window where models needed hand-holding is closing, the argument goes, and businesses will become API-first anyway.

There is a solid engineering reason behind it. Command-line tools are incrementally discoverable. An agent can run `--help`, compose commands, and pick only the fields it needs, instead of swallowing everything a tool returns.

A minimal skill for this approach is tiny:

- a name and a one-line description,
- the name of the environment variable holding the token,
- three example calls,
- one hard rule: never print the token.

And the weak spots? Local, stateful servers with no public REST API (memory stores, note-taking bridges) have nothing to call directly. Plus there is the sharpest rebuttal in the thread: "you just rejected and then reimplemented MCP". If every user writes their own skill per service, the integration work has not vanished. It has been distributed.

## The Case for Keeping MCP

The replies listed what the protocol actually buys:

- standardized access control, and abstraction over schema changes,
- one tool layer shared across several agent products,
- built-in OAuth for services that need delegated login,
- deterministic guardrails, and fewer tokens spent on the model figuring out a call,
- a shared interface across different models.

Then the backends that are not REST at all, or that hold state: a reverse-engineering suite, a game engine, a browser driver. A thread about cloning websites with a browser-automation server made the limits visible. That server gives the agent a view of visual browser state. One experienced developer suggested adding a scraping server for backend-level detail, and another said responsive design still needed manual work. A protocol server is only as complete as the state it chooses to expose.

On security, the argument cuts both ways. Handing an agent a raw API key and letting it read arbitrary code each time it acts was called a "massive risk". But the skill-plus-env-var pattern puts the token somewhere the model can read too. Neither is magic. Scoped tokens are the real defense, whichever route carries them.

Here is where the threads disagree, plainly:

| Capability type | Sensible interface | Why |
|---|---|---|
| Stateless REST, good public docs | Env var plus thin skill, or CLI | Model already knows it; least moving parts |
| OAuth, shared team access | MCP | Auth flow and access control built in |
| Non-REST or stateful backend | MCP | Nothing else exposes the state |
| Many chained calls over large data | Code execution in a sandbox, read-only credentials | One program replaces many round trips |
| Whole-repo questions | Code index, with a freshness story | Grep alone gets expensive |

One participant wanted to auto-block anyone saying "MCP isn't necessary". Others agreed that MCP as a thin REST wrapper is "silly". Both can be right, on different rows of that table.

## Code Mode: Fewer Calls, More Blast Radius

A claim circulated that code mode cuts tokens by more than sixty percent for complex chaining. A single claim, so hold it loosely. The replies were more interesting than the number.

First, it does not replace MCP, because you still need a way to integrate external services. They can be used together. Second, sandboxed code execution and code-writing agent frameworks have existed for years, and one developer reported a customer prototype using such a framework with a read-only database role that "works well". Third, the skeptical read: the approach "saves some tokens by sacrificing security". And a halting-problem worry: what stops a generated loop from running forever?

The connection to the previous section is worth stating, as commentary rather than as anything the threads claimed. Calling the API directly and code mode both move composition into model-written code. So the guardrail must move too: read-only roles, scoped tokens, time limits, and no network beyond what the task needs. The model writes the program. The sandbox decides what the program may touch.

## Skills Are Not Free Either

Skills are described by practitioners as "premade prompt parts with progressive disclosure". At startup the agent scans each skill's name and description, and loads the full file only when relevant. The motivation is that a big instruction file loads on every single conversation.

A correction popped up repeatedly: "zero tokens when inactive" is wrong, because the frontmatter must be read. Small, yes. Free, no.

Confusion also recurs about how skills differ from projects with instructions, from subagents, and from memory. One data point on instruction files is useful. A project file that grew to 145 lines made compliance worse, and trimming it to 77 improved it. The author's progression went from raw prompting to instruction files to skills to hooks, and engineers in the trenches said people eventually realize they "need determinism".

Quality is uneven too. A popular persona-style skill drew the comment that its instructions were fluff, along with a request for a before-and-after review showing measurable impact. A skill-evolution tool trained on failure traces reported a held-out score, while admitting it depends on a good benchmark and burns many tokens. And one practical gotcha: switching a skill on in a web app does not make it available in a terminal agent.

Where skills clearly worked: removing repeated context. "Using agent skills made me realize how much time I was wasting repeating context." The reply is fair: skills cover structural patterns, not session state.

## The Permission Surface Is Part of the Interface

This is the section where a clean architecture gets embarrassing.

A post claimed that most of a hundred-thousand-token budget disappeared into a dependency folder, because a recursive `grep` or `find` run through the shell tool was not covered by the deny rules for the file-reading tool. Two permission systems, two tool families, one gap between them. The proposed fix was a pre-execution hook that inspects the shell command for blocked patterns and exits with an error code.

Several developers never saw the problem. They pointed to search tools that respect ignore files by default, to an ignore file of their own, and called the claim a red herring. Another noted that the built-in search prints the full relative path on every line. And the author conceded a caveat: hiding a path inside a variable bypasses the hook.

So treat the 85 percent figure as disputed. The generalizable point does not depend on it. **Whenever a capability is reachable through more than one tool, the rules must be checked per route, not per intent.** That is true for MCP, for the shell, and for built-in tools alike. The hook sketch is short: read the command, test it against a deny list, refuse if it matches. Hooks as enforcement is its own topic, so no need to repeat it.

## Testing the Contract: Weak Models Find Bad Tool Design

An unexpectedly useful idea: debug on the weakest model in the roster. Strong models silently repair malformed tool calls, strange error strings and missing tools, so the bugs hide. Running cheap models surfaced a dozen harness issues that a frontier model had learned to work around.

The specifics are practical:

1. Ambiguous descriptions are rescued by the tool name when the model is strong. Weak models guess wrong.
2. Under-documented parameters get filled in plausibly by big models, and wrongly by small ones.
3. Test against a strict parser, not a forgiving one.
4. Keep a cheap-model run in continuous integration for tool-call and error-path coverage.

A counterpoint deserves airtime: good observability that counts failed tool calls would catch many of these too. Fair. The two combine well.

A related case: a small local model went from under twenty percent to over forty-five percent on a coding benchmark with the same weights, purely from scaffold changes that were tool-shaped. A write guard that refuses to overwrite existing files, explicit workspace discovery, and small per-turn skill injections. The comparison across model sizes was questioned, so keep to the design lesson: a tool can encode a safety rule better than a prompt can.

And a baseline for "what is the least you need": a harness in thirty lines with three tools (run a command, read a file, write a file). One reply asked why not the command alone. Good question. Every tool you add is a contract to maintain.

## Code-Intelligence Tools: A Different Kind of Interface

Then comes a whole family that offers the agent a query interface over the repository instead of letting it grep and read entire files. Common shapes:

- an index of the syntax tree and call graph, exposed as an MCP server,
- a command that returns callers, callees and imports for a question like "trace the authentication flow",
- a typed query language over the repository, with hooks into several agents,
- hybrid keyword-plus-semantic search with SQL over the results,
- documentation retrieval delivered as a skill plus a CLI, instead of a server.

Their authors report striking numbers: a small model with the index beating a larger one without it on architecture docs, roughly ten times less returned context than top-three grep, perfect symbol recall on six tasks. All are self-reported, on small or self-chosen tasks, and none were independently replicated in the threads. The one honest author conceded their comparison "is not a proper benchmark".

The skeptical replies were sharper than the pitches. "Serena MCP but with more steps." "Better than an LSP MCP how?" "How do you know your benchmark is trustworthy?" A request for a with-and-without comparison. A licensing objection that a source-available license is not open source. A question about cross-language mapping, such as a Python backend with a TypeScript frontend. Against this, one user reported months of use without ever running out of context. Anecdote, but not nothing.

Design observations worth keeping: a typed query language beats free text for precision. Delivery as a skill and CLI avoids the schema tax of a server. A routing table with a bootstrap of about a hundred tokens costs almost nothing to load.

## Freshness: Why Indexes Rot

Every one of those tools faces the same question: how do you keep the index fresh when many people push daily?

One developer's post-mortem of a first version is instructive. Hooks inferred edits. Multiple processes wrote the graph. Under concurrent agents, files vanished during delete-then-insert, and two writers raced. The redesign was almost boringly classical: a level-triggered reconciler with a content-hash oracle, a single writer, exact path ownership, bounded staleness, and verdicts (strong, weak, stale) checked against disk before any hit reaches the model.

Other advice from the threads: snapshot memory at task boundaries, when tests are green, rather than embedding on every save. Regenerate a recursive file tree in continuous integration so it cannot rot. Run cheap drift checks for dead paths and deleted scripts.

Using Git as the substrate is attractive: commit canonical memory as files, keep per-checkout indexes local. The objection is real, though. Git catches mechanical conflicts, not semantic contradictions between two written decisions. As one comment put it, "memory is not awareness".

## Tool Results Are an Instruction Channel

Every tool you add is a capability and an ingress for text the model may treat as an order.

Picture a composite. A researcher files a fabricated crash report to a public error-tracking endpoint. The triage output reaches a coding agent as an ordinary message. The report suggests installing a phantom dependency. Several frontier models install it and run it, and attacker code executes with repository credentials. The proposed remedy: split triage (untrusted input, read-only snapshot, no network, no secrets) from a privileged fixer that only receives a verified reproduction artifact. And the line worth framing: "human reviews the PR is not a safety boundary".

A transport-layer version appeared in a study of API relay services, as reported in a thread, with its methodology criticized as incoherent: a small share of the relays injected code into tool calls, and many honeypot sessions ran in a no-prompt mode. Treat the figures as unverified. The principle stands. Whatever sits between the model and the executor can rewrite the call. Proposed defenses: a fail-closed policy gate, response anomaly screening, append-only logging.

## The Deterministic Answer

Look at how many problems above vanish when the model stops being the one who acts. No tool schemas to load. No permission systems to reconcile. No index to keep fresh. No tool result to be injected through.

That is the agentless position, and it is a legitimate engineering choice rather than a lack of ambition. The developer picks the exact files that enter the context, using a file tree and fuzzy search. The model returns search-and-replace blocks. Those get applied and committed as a standard Git diff. The key is the developer's own, so spend is a line in an invoice rather than a plan-limit mystery. The tool surface is exactly one thing: text in, text out.

Honesty requires the other half. For stateful backends, long chained workflows and prototypes on a greenfield app, an agent with the right tools is faster, and nobody should pretend otherwise. The deterministic approach wins where the codebase is complex, the stakes are real and the reviewer is a human who needs to understand the change.

## A Decision Checklist

1. Trim instruction files before adding any tool.
2. For each tool family, check which permission system covers it.
3. Run the toolset once on a weak model to find ambiguous schemas.
4. Record a with-and-without comparison on your own tasks before keeping any context engine.
5. Give graph and memory tools a single writer and a staleness verdict.
6. Treat every ingested report, log or ticket as untrusted input.

And the remaining disagreement: the threads do not settle whether skills plus APIs make MCP unnecessary, or just move the integration work onto every user.

## FAQ

**Is a skill plus an API key not just a worse MCP server?**
Often, yes, if the service needs OAuth or shared team access. For a well-documented REST service the model already knows, it is less machinery for the same result.

**Why not give the agent every tool and let it choose?**
Each tool adds schema cost, a permission surface and an injection path. I would add one only when a measured task justifies it.

**Do code indexes not pay for themselves on large repositories?**
They can, if they stay fresh and the agent actually calls them. Without your own with-and-without numbers, the claim is marketing.

**Does an agentless workflow not just push the integration work onto the human?**
It does, deliberately. The human is the one who knows which files matter, and that is the cheapest integration there is.

## Key Takeaways

- Choose the interface per capability: env var plus skill for simple REST, MCP for auth and state, sandboxed code for chains, and an index only with a freshness story.
- Permission rules are part of the interface; check them per route, and treat every tool result as potential instructions.
- Test tool contracts on weak models and verify every efficiency claim on your own tasks.

*Every interface you add is a promise you now have to keep.*
