# Agents Are Config Files: Permissions, Not Prose, Keep a Multi-Agent Setup Honest

Most shared "agent workflows" in terminal coding harnesses turn out to be markdown files with frontmatter and a model string. What matters is which of those lines are enforced by the tool and which are only polite requests to the model.

> I spent a weekend building an eleven-role agent roster, and the first thing the "read-only" reviewer did was edit a file because my prompt said please don't. The permission block I added afterward took four lines and fixed it for good.

## The lens: least privilege

Security engineers have a boring rule that survives every fashion cycle: give each actor only the access it needs, and enforce it in the system, not in a memo.

Apply it to agents. An "orchestrator that never edits" is a sentence in a prompt, or it is a permission set that makes editing impossible. Those are different things. One of them depends on the model remembering. The other does not.

So this article reads agent setups as access-control design. For every role, ask what it can read, what it can write, what it can run, and who checks the result.

## A map of the design space

A typical shared setup looks like this, and it makes a good map. Three primary agents: a planner on a strong reasoning model, a builder and an "ask" agent on a cheap fast one, where ask is "answer-only, never modifies files". Eight subagents: explore, general, code reviewer, documenter and a scout for external dependencies on the cheap model; debugger, refactorer and test generator on a pricier one. Four tool servers, and a long skills list.

The replies are the skeleton of the whole debate:

- "Why would you ever need the file system tool server?" when read, write, edit and bash are already built in.
- "Why so many subagents? What do you really achieve?"
- "Just look up" the popular community orchestration plugin.
- One developer who tried the many-agent style and went back to a single instance under their own control, because "let opus work for a day and I have code to review for a week".

Four questions follow. What is a primary agent versus a subagent? What belongs in frontmatter versus the project instruction file? What do plugins add? What breaks?

## Anatomy: where each piece lives

General knowledge first, kept separate from what people reported. Agents are markdown files with frontmatter, in a user config directory or per project. Models are assigned in the main JSON config. A project instruction file (AGENTS.md) holds rules and routing. Skills, tool servers and plugins sit on top.

| Artifact | What it controls | Enforced by |
|---|---|---|
| Agent .md frontmatter | Mode (primary or subagent), tool and permission rules | The harness |
| Main JSON config | Model per agent, provider settings, blacklists | The harness |
| Project instruction file | Rules, routing, conventions | The model's compliance |
| Skills | Reusable instructions loaded on demand | The model's compliance |
| Tool servers (MCP) | Extra tools and their descriptions | The harness plus the model's judgment |
| Plugins | Hooks around tools, context, UI | Whatever the plugin author wrote |

The right-hand column is the whole article. The first two rows are hard guarantees. The next two are advice.

Primary agents are what you cycle through with a key press (plan, build, and any you add). Subagents are launched by a primary agent through a task tool and report back a summary.

Two gotchas people reported. Model assignments load once at startup, so you cannot swap a role's model mid-session without a restart, and there is talk of unmerged work to let the primary pick a subagent's model dynamically (a claim, not a confirmed fact). And surprises happen: one user on a cheap plan was silently moved from a fast model to its pricier sibling after a subagent switch, and burned the last few percent of quota. Config surprises are real, so read the effective config.

## Permissions are the real enforcement layer

Here is the strongest exhibit. A pattern called a sidekick, implemented as pure configuration. The main build agent has edit denied and search denied, bash allowlisted to verification and git commands, and task allowed. Its only way to change a file is to delegate a written spec to a sidekick agent that has full edit and bash. Optional read-only explore and research agents, plus design, review and vision specialists, sit beside it.

An illustrative frontmatter, not copied from anyone:

```
---
description: Orchestrator, delegates all edits
mode: primary
permission:
  edit: deny
  bash: { "git *": allow, "npm test": allow, "*": deny }
  task: allow
---
```

Look at what that buys. The orchestrator can run tests and read the diff, and it physically cannot patch a file "just this once". The cost of a bad plan is bounded by what the sidekick is told to do, and the sidekick's work arrives as something reviewable.

The author quoted a vendor's cost reduction for this style (somewhere in the thirties of percent at near-frontier quality). That is the vendor's number, not the author's, so do not treat it as established. The stated limitations are honest too: roles are fixed at startup, and loop protection is permission-based rather than a numeric budget.

The same idea works for money. After someone used an expensive model by mistake, a provider-level blacklist (a list of model names in the config) removed it from reach. That is the pattern again: constrain the system declaratively instead of by discipline.

Now the pushback, which deserves air.

- One reader asks why not just plan and build. The pattern inverts the builder into a plan-like role, which is a fair thing to question.
- Another defends subagents on context grounds: a single agent "starting to hallucinate at 100-150k tokens", while primary agents receive only summaries. That is a real mechanism. A subagent's long exploration stays in its own context.
- A third reports that two popular orchestration stacks "failed to delegate properly" with a spec-driven toolkit, while the sidekick pattern with the same skills delegated more of the coding after planning.

This is an access-control argument, not a quality proof. Nobody has shown rework rates.

## Roles that recur

The vocabularies converge.

- **Orchestrator** (planner and delegator), **oracle** (hard debugging and architecture review), **explorer** (codebase reconnaissance), **librarian** (docs and dependencies), **designer**. One community plugin ships these as a table, and people mix presets until they are "Frankensteining" ten of them.
- A roster with debugger, refactorer and test generator, including a "prove-it" pattern for bugs: write the failing test first.
- A three-way split: plan on one model, build on a second, review on a third.
- "Orchestrator plus quality assurer plus coder": a cheap model orchestrates and checks, a second codes. The author claimed the cleanest codebase they had seen from AI, while admitting it was "diluting" the better model.
- An **image reader**: a text-only model gets screenshots described by a vision model, through a skill or a vision tool server. OCR was rejected as "painting blindfolded".
- A review loop: fixer, then reviewer, then fixer, until the reviewer passes. That is what makes cheap implementers acceptable, "as long as a review is done".

Counterpoints worth keeping. Swapping models between plan and implement loses the cache, and implementation is where bugs get introduced. Another reader says the answer is an audit layer designed by the strong model, with rules the implementer cannot override. That one is again permissions, not prose. And nobody in the shown replies reported horror stories from parallel subagents editing the same files, which is an open question, not an all-clear.

## The project instruction file: advice, not enforcement

AGENTS.md is where people put what the harness cannot enforce. Reported contents:

- General codebase rules in the form "do X, Y, Z because working with A, B, C does this", written like a manager's detailed todos.
- A thorough analysis of every file and where it lives, and a specifications file for new projects.
- A loop limit: three correction attempts, abort on the fourth consecutive failure.
- Routing logic for each agent profile.
- "Save a lesson at the end of the session" as the simplest self-improvement loop.
- A plain memory folder with a decisions file and an active-context file, read and updated by instruction.

Then the catch. One model ignores half of the instruction file while another follows it, so compliance is model dependent. One reader finds premium models better at remembering to use provided skills than cheaper ones. This is why hard rules belong in permissions and soft preferences belong in prose.

Memory plugins exist, and some store memories in the system prompt so compaction cannot remove them, with reports of heavy RAM use. Whether plain files stop being enough remains unanswered; answer it with a concrete failure before adding a layer.

A skeleton for the file, synthesized from the replies:

1. Project purpose and layout.
2. Build, test and lint commands.
3. Conventions and what to avoid.
4. Routing: which agent does what.
5. Loop and stop rules.
6. Where decisions and todos are recorded.

## Workflow layers on top

One reported pipeline runs explore, propose, spec, design, tasks, apply and verify, each phase on a different model, with the takeaway that "workflow architecture matters more than model choice". The sharpest reply says failure happens at the handoff between phases, so write a contract per phase:

1. What input context is allowed.
2. What output artifact is expected.
3. What evidence is required before moving on.
4. What must not carry over to the next model.

Dissent in the same thread: stay away from spec-driven development, because it "consumes enormous amount of tokens" and people are bad at writing a good spec.

Skills help when they replace a vague sentence with a procedure, such as a SOLID-principles skill with four rigor levels. Readers shrug that they just say "use SOLID". Both are right on small tasks.

Then the bloat counterpoint. A plugin with "42 compression layers" reportedly broke file reading: the model tried to base64 or hex a file and copy it to a temp location. A tool-server variant made zero calls until a "MANDATORY" block went into the instruction file. Anything that sits between the agent and its tools can make files unreadable, and a compression layer can also disturb prompt caching.

## Plugins, forks and the major-version break

Community multi-agent plugins are recommended repeatedly, and some target background agents that sit behind an experimental flag, with the author waiting for it to become non-experimental. Whether background orchestration produces better results or merely faster ones is, so far, unanswered.

A fork exists for agent pipelines. The top skeptical reply says it exists because the main project is not merging the many requests for dynamic subagent model selection. That is a complaint, not a fact about the project.

The lesson from the 1.x to 2.0 move is plain: after the installer replaced the old binary, users reported it faster but "some plugins won't work since it's server mode based and runs in bun". Tabs broke and were fixed hours later. One wrapper UI did not support it, so a user rolled back. Pin your version, test your plugin set before upgrading, and keep a way to run the old one.

Account-level rules also affect third-party harnesses: tools using a provider's plan must send a session header, identify themselves and avoid abusive traffic, or risk being flagged. That is policy, not agent config, but it breaks setups all the same.

## When the agent file compensates for the model

A model praised as "a great subagent but a shit model" that "can't understand intent" is best paired with an orchestrator. Documented failures: eight rounds of review, a deferred refactor on a borrow-checker error, a 50-line Python script to edit two lines of C++, wandering outside the assigned folder. The prescription is an orchestrator that delegates and reviews, plus "rules, skill doctrines, memory, hooks and subagents".

Another model stops mid-task, fixed by a wrapper's goal feature that auto-reminds it. A symptom is being handled by config.

Be honest about the evidence. This is anecdote. Project type matters (unsafe Rust and assembly versus a frontend), and "skill issue" is unfalsifiable.

## The paradigm: the narrowest permissions are the ones you hold yourself

Roles in config files are a good idea when they reduce what the model can do. They are a worse idea when they multiply what the model can decide.

The deterministic version goes further. You pick the exact files that go into the prompt, so there is no explorer subagent hunting through the repository and no context bloat. The model returns search/replace blocks, you see them as a normal Git diff, and you commit or reject. There is no agent system to misconfigure because the only write path is your review. Keys are your own, so the cost of each request is on the meter.

That is not an argument against agents. Orchestrated agents are good at greenfield prototypes and at long, boring, well-specified chores, and the permission patterns above make them safer. But on a complex codebase, if a role cannot be made safe by a permission block, ask whether you need the role.

## Checklist: a restrained setup

- Start with plan and build. Add a subagent only for a measurable reason: context isolation, read-only exploration, independent review.
- Hard rules go in permissions: deny edit on orchestrators, allowlist bash, read-only explorers, a blacklist for expensive models.
- Routing and project rules go in the instruction file. Keep memory plain until a real problem appears.
- If you chain agents, write phase contracts.
- Treat plugins as dependencies: pin the version, test after upgrades, check for tool-interposing layers and cache effects.
- Put a loop limit in the instruction file: three attempts, abort on the fourth.
- Before upgrading, run the plugin set against a scratch project.

## FAQ

**Do many subagents actually produce better code, or just more activity?**
Nobody has shown rework rates either way; the clearest benefit is keeping the main context small, and the clearest cost is tokens spent on handoffs.

**If permissions are so good, why not allow everything and review the result?**
Because review catches what happened, while permissions prevent what should not happen; for destructive commands that difference matters.

**Isn't a single hand-driven session just slower?**
Often it is, and for greenfield work that cost is real. On a mature codebase the review time you save by constraining the model usually exceeds the typing time you lose.

## Key Takeaways

- An agent system is mostly config; enforce hard rules with permissions and treat prose in instruction files as advice that models follow unevenly.
- Add a subagent only when it isolates context, restricts access or provides independent review, and write a contract for every handoff.
- Pin versions and distrust plugins that sit between the agent and its tools, because the cheapest failure to debug is the one you never installed.

*Autonomy is a permission you grant, never a default you inherit.*
