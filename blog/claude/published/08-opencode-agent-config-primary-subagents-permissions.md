I spent a weekend building an eleven-role agent roster. The first thing the "read-only" reviewer did was edit a file, because my prompt only asked it nicely not to. The permission block I added afterwards took four lines and fixed it for good.

Security engineers have an old rule that survives every trend: give each actor only the access it needs, and enforce that in the system, not in a memo. An "orchestrator that never edits" is either a sentence in a prompt or a permission set that makes editing impossible. Only the second one keeps working when the model forgets. So for every role in an agent setup, I now ask four questions: what can it read, what can it write, what can it run, and who checks the result?

## A typical shared setup

Here's a fairly typical setup someone shared. Three primary agents: a planner on a strong reasoning model, plus a builder and an "ask" agent on a cheap fast model, where ask is "answer-only, never modifies files". Eight subagents: explore, general, code reviewer, documenter and a scout for external dependencies on the cheap model; debugger, refactorer and test generator on a pricier one. Four tool servers, and a long list of skills.

The replies cover most of the debate:

- "Why would you ever need the file system tool server?" when read, write, edit and bash are already built in.
- "Why so many subagents? What do you really achieve?"
- "Just look up" the popular community orchestration plugin.
- One developer who tried the many-agent style and went back to a single instance they controlled, because "let opus work for a day and I have code to review for a week".

## Where each piece lives

Agents are markdown files with frontmatter, in a user config directory or per project. Models are assigned in the main JSON config. A project instruction file (AGENTS.md) holds rules and routing. Skills, tool servers and plugins sit on top.

| Piece | What it controls | Enforced by |
|---|---|---|
| Agent .md frontmatter | Mode (primary or subagent), tool and permission rules | The harness |
| Main JSON config | Model per agent, provider settings, blacklists | The harness |
| Project instruction file | Rules, routing, conventions | Whether the model complies |
| Skills | Reusable instructions loaded on demand | Whether the model complies |
| Tool servers (MCP) | Extra tools and their descriptions | The harness plus the model's judgment |
| Plugins | Hooks around tools, context, UI | Whatever the plugin author wrote |

The right-hand column is the important part. The first two rows are hard guarantees. The next two are advice.

Primary agents are the ones you cycle through with a key press (plan, build, and any you add). Subagents are launched by a primary agent through a task tool and report back a summary.

Two gotchas people reported. Model assignments load once at startup, so you can't change a role's model mid-session without restarting. There's reportedly unmerged work to let the primary agent pick a subagent's model on the fly, but that's a claim, not a confirmed fact. And surprises happen: one user on a cheap plan was silently moved from a fast model to its pricier sibling after a subagent switch, and burned the last few percent of their quota. Read the effective config, not just the one you wrote.

## Permissions do the real work

The strongest example is a pattern called a sidekick, built purely from configuration. The main build agent has edit and search denied, bash limited to verification and git commands, and task allowed. The only way it can change a file is to hand a written spec to a sidekick agent that has full edit and bash access. Optional read-only explore and research agents sit alongside it, plus design, review and vision specialists.

An illustrative frontmatter (mine, not copied from anyone):

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

The orchestrator can run tests and read the diff, and it physically can't patch a file "just this once". A bad plan can only do as much damage as the sidekick is told to do, and the sidekick's work comes back as something you can review.

The author quoted a vendor's cost reduction for this style (somewhere in the thirties of percent, at near-frontier quality). That's the vendor's number, not the author's, so I wouldn't lean on it. The author was also honest about the limits: roles are fixed at startup, and loop protection comes from permissions rather than a numeric budget.

The same idea works for money. After someone used an expensive model by mistake, a provider-level blacklist (a list of model names in the config) put it out of reach. Same pattern: constrain the system in config instead of relying on discipline.

There was pushback:

- One reader asked why not just plan and build. The pattern turns the builder into something like a planner, which is fair to question.
- Another defended subagents on context grounds: a single agent "starting to hallucinate at 100-150k tokens", while primary agents only get summaries. That's a real mechanism. A subagent's long exploration stays in its own context.
- A third reported that two popular orchestration stacks "failed to delegate properly" with a spec-driven toolkit, while the sidekick pattern with the same skills delegated more of the coding after planning.

This is an argument about access control, not proof of better code. Nobody has shown rework rates.

## Roles that keep coming back

People's vocabularies converge:

- **Orchestrator** (plans and delegates), **oracle** (hard debugging and architecture review), **explorer** (codebase reconnaissance), **librarian** (docs and dependencies), **designer**. One community plugin ships these as a table, and people mix presets until they're "Frankensteining" ten of them.
- A roster with debugger, refactorer and test generator, including a "prove-it" pattern for bugs: write the failing test first.
- A three-way split: plan on one model, build on a second, review on a third.
- "Orchestrator plus quality assurer plus coder": a cheap model orchestrates and checks, another codes. The author claimed it produced the cleanest codebase they'd seen from AI, while admitting it was "diluting" the better model.
- An **image reader**: a text-only model gets screenshots described by a vision model through a skill or a vision tool server. OCR was rejected as "painting blindfolded".
- A review loop: fixer, reviewer, fixer, until the reviewer passes. That's what makes cheap implementers acceptable, "as long as a review is done".

Some counterpoints worth keeping. Switching models between planning and implementing loses the cache, and implementation is where bugs get introduced. Another reader said the answer is an audit layer designed by the strong model, with rules the implementer can't override, which is permissions again rather than prose. And nobody in the replies reported horror stories from parallel subagents editing the same files. That's an open question, not an all-clear.

## The instruction file is advice

AGENTS.md is where people put what the harness can't enforce. What people put in it:

- General codebase rules in the form "do X, Y, Z because working with A, B, C does this", written like a manager's detailed to-dos.
- A thorough rundown of every file and where it lives, plus a specifications file for new projects.
- A loop limit: three correction attempts, abort on the fourth consecutive failure.
- Routing rules for each agent profile.
- "Save a lesson at the end of the session", the simplest possible self-improvement loop.
- A plain memory folder with a decisions file and an active-context file, read and updated by instruction.

The catch: one model ignores half the instruction file while another follows it, so compliance depends on the model. One reader found premium models better than cheap ones at remembering to use the skills they're given. That's why hard rules belong in permissions and soft preferences belong in prose.

Memory plugins exist. Some store memories in the system prompt so compaction can't remove them, and some reportedly use a lot of RAM. Nobody answered when plain files stop being enough. I'd wait for a concrete failure before adding a layer.

A skeleton for the file, put together from the replies:

1. Project purpose and layout.
2. Build, test and lint commands.
3. Conventions and things to avoid.
4. Routing: which agent does what.
5. Loop and stop rules.
6. Where decisions and to-dos are recorded.

## Pipelines on top

One reported pipeline runs explore, propose, spec, design, tasks, apply and verify, with each phase on a different model, and concludes that "workflow architecture matters more than model choice". The sharpest reply said things fail at the handoffs between phases, so write a contract for each phase:

1. What input context is allowed.
2. What output is expected.
3. What evidence is required before moving on.
4. What must not carry over to the next model.

Someone in the same thread disagreed: stay away from spec-driven development, because it "consumes enormous amount of tokens" and people are bad at writing good specs.

Skills help when they replace a vague sentence with a procedure, like a SOLID-principles skill with four levels of rigor. Other readers shrugged that they just say "use SOLID". On small tasks, both work.

Then the bloat. A plugin with "42 compression layers" reportedly broke file reading: the model tried to base64 or hex-encode a file and copy it to a temp location. A tool-server variant made zero calls until a "MANDATORY" block went into the instruction file. Anything sitting between the agent and its tools can make files unreadable, and a compression layer can also break prompt caching.

## Plugins, forks and the major-version break

Community multi-agent plugins get recommended over and over. Some target background agents that are still behind an experimental flag, and their authors are waiting for it to become stable. Whether background orchestration gives better results or just faster ones, nobody has shown yet.

There's a fork for agent pipelines. The top skeptical reply says it exists because the main project isn't merging the many requests for choosing subagent models dynamically. That's a complaint, not a fact about the project.

The move from 1.x to 2.0 has a plain lesson. After the installer replaced the old binary, users found it faster, but "some plugins won't work since it's server mode based and runs in bun". Tabs broke and were fixed hours later. One wrapper UI didn't support it, so a user rolled back. Pin your version, test your plugins before upgrading, and keep a way to run the old one.

Account-level rules affect third-party harnesses too: tools using a provider's plan must send a session header, identify themselves and avoid abusive traffic, or risk being flagged. That's policy, not agent config, but it breaks setups all the same.

## When the agent file is covering for the model

One model was described as "a great subagent but a shit model" that "can't understand intent", best paired with an orchestrator. The documented failures: eight rounds of review, a refactor deferred because of a borrow-checker error, a 50-line Python script to edit two lines of C++, and wandering outside the assigned folder. The prescribed fix was an orchestrator that delegates and reviews, plus "rules, skill doctrines, memory, hooks and subagents".

Another model kept stopping mid-task, fixed by a wrapper's goal feature that reminds it automatically. Config is being used to treat a symptom.

This is all anecdote. Project type matters (unsafe Rust and assembly versus a frontend), and "skill issue" can't be disproven.

## The narrowest permissions are the ones you keep

Roles in config files are a good idea when they reduce what the model can do. They're a worse idea when they multiply what the model gets to decide.

You can take this further. Pick the exact files that go into the prompt yourself, so there's no explorer subagent hunting through the repo and no context bloat. The model returns search/replace blocks, you see them as a normal Git diff, and you commit or reject. There's no agent system to misconfigure, because the only way to write is through your review. And the key is yours, so every request's cost shows on the meter.

That's not an argument against agents. Orchestrated agents are good at greenfield prototypes and long, boring, well-specified chores, and the permission patterns above make them safer. But on a complex codebase, if you can't make a role safe with a permission block, ask whether you need the role at all.

## A restrained setup

- Start with plan and build. Add a subagent only for a concrete reason: context isolation, read-only exploration, independent review.
- Put hard rules in permissions: deny edit on orchestrators, allowlist bash, make explorers read-only, blacklist expensive models.
- Put routing and project rules in the instruction file. Keep memory as plain files until a real problem shows up.
- If you chain agents, write a contract for each phase.
- Treat plugins like dependencies: pin the version, test after upgrades, watch for layers that sit between the agent and its tools and for cache effects.
- Put a loop limit in the instruction file: three attempts, abort on the fourth.
- Before upgrading, run your plugins against a scratch project.

Do lots of subagents produce better code, or just more activity? Nobody has shown rework rates either way. The clearest benefit is keeping the main context small, and the clearest cost is tokens spent on handoffs. And "allow everything and review the result" isn't a substitute: review catches what happened, while permissions prevent what shouldn't. For destructive commands, that difference is the whole point.
