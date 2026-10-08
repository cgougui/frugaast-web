# Your Agent's State Doesn't Belong in the Chat: Handoff Files, Shared Memory and File Ownership Across Sessions and Agents

Compaction loops, laggy chats, two agents clobbering one types file, a rejected approach proposed again two hours later: it is the same failure in different costumes. The run's state lives in a conversation, and a conversation is a terrible database.

> I lost most of a morning to two agents that each quietly rewrote the same shared file, and neither of them reported an error. The thing that finally fixed it was not a smarter model, it was a plain text file in the repo.

## The lens: state as a database problem

Strip away the AI vocabulary and most "the agent forgot", "the agent drifted" and "the agent redid my work" complaints turn into questions any backend engineer would recognize.

Where is the source of truth? Who is allowed to write to it? What happens when two writers collide? How do you recover after a crash?

A chat transcript answers none of these. It is append-only, unindexed, summarized lossily when it grows, and owned by whoever's window it sits in. So the argument here is a design one: move the state out, give it a schema, and give every piece of it exactly one owner.

## One failure, four costumes

**Compaction.** A developer on a desktop coding app complains it is "constantly having to retrace its steps after compaction". A reply: it "rewrites the same file three times because it forgot what it already did". Another reply corrects a misunderstanding: the large number people see is total capacity, input plus output, so it is not a downgrade. Which matters for the framing. The window size is not the problem. Where the state lives is.

**Session switch.** One agent spent 40 minutes ruling out an approach. A different agent suggested the exact same one two hours later. One tool "knows what got written", another "knows why approaches were abandoned", a third "knows what to do next", and none share it.

**Two writers, one repo.** One agent refactored a types file while another was mid-way through using it. Neither errored. A merge landed on a version of the file that no longer existed, and untangling it took most of the next morning.

**Browser chats.** Very long threads get laggy, and code snippets disappear into scrollback.

The transcript is a bad database. Here is a quick picture of what a three-hour run holds in each place.

```
IN THE TRANSCRIPT                 ON DISK (survives everything)
-------------------------------   --------------------------------
every message, in order           HANDOFF.md      what is true now
tool output, 200 lines at a time  findings/<task>.md  what was tried
half-remembered decisions         SPEC.md         what must be built
"as said earlier..."            git log         what actually changed
(compacted or lost at ~90%)       (reviewable, diffable, shareable)
```

The left column is what the model sees. The right column is what you can verify.

## Why chats are fragile places for state

This is not user error. It is a bug class in the tools themselves. One extension's release notes included a fix for the initial task request being lost during context condensing, which made the agent try to re-answer the original task when it resumed. When the harness compresses the history, whatever was compressed away is gone, and the compressor does not know which sentence was the important one.

Developers also report a simpler version: output degrades "when the context window gets too full", and simply starting a new context window brings full performance back. Browser-side, a developer points out that the lag is "not really chat, but your browser" holding the entire conversation, and the desktop app avoids it.

There is also disagreement worth recording. Some argue that a web chat feels better than an IDE agent because it "thinks longer", and others guess a provider cut reasoning time. Both are speculation. Treat them as hunches, not findings.

The practical rule is plain. Anything you cannot afford to lose does not live in the transcript.

## Artifact 1: the handoff doc

The cheapest fix has the most agreement. At the end of a session, ask the model to write a markdown file with "current state, decisions made, open questions, and the minimum code context needed to continue". Start the next chat by pasting only that file. Several developers confirm it works.

A template, labeled as illustrative:

```
# HANDOFF.md
## Done (with commit hashes)
## In progress / blocked
## Decisions + rejected approaches (and why)
## Files that matter / files not to touch
## Next step, verifiable by: <command>
```

The last line is the underrated one. "Verifiable by" means the next session can check the claim instead of trusting it.

In browser threads, similar habits help: one conversation per task or module, a branch of the conversation before a tangent, and Git commits as a "context refresher". One honest caveat: splitting work into smaller chunks with explicit instructions is "a workaround, not a fix". True. It is a workaround that works.

## Artifact 2: findings files that live in the repo

A handoff doc covers a session. A findings file covers a task, and it is the one that would have saved the 40 minutes.

One developer has the model "write and maintain a markdown file for each task", committed to the repo. A side benefit follows: a coworker, and their own assistant, can onboard from it. Another run-state design keeps a work contract on disk (a checklist or an hour-budget goal), with states of done, active, parked and blocked, plus decisions, rejected attempts, and where the next session should continue. A small external watcher for dead sessions rounds it out.

Why record rejected approaches explicitly? Because that is the exact information a fresh session lacks. Without it, a smart model is an eager colleague who will cheerfully propose the thing you already killed. A commit of "tried X, failed because Y" costs two lines and saves an hour.

A word on provenance. Some of the loudest advice on this topic comes from people promoting a memory product, so weigh it accordingly. The plain-file answers have no vendor.

## Artifact 3: shared memory, and the plain-versus-service question

When several tools need to see the same memory, two camps appear.

Plain files are simple, reviewable and committed. A retrieval service (a self-hosted database with semantic, keyword, graph and time-based recall, shared by several agents) travels across tools and accumulates knowledge, but needs tuning and one more container to run. One author reports that the "extraction mission", the instruction that decides what gets remembered, is the highest-value setting, because without it "the bank fills with garbage fast". Another lesson: a stable worker identity matters, or in-flight tasks get parked on restart. No one independently confirmed those results, so they remain one author's account.

Then there is the rule-file zoo. One tool wants `CLAUDE.md`, another its own file, another `AGENTS.md`, each with a dot-directory and an ignore file of its own. Workarounds are modest: a file that just says `@agents.md`, or a script to migrate old rules. Some say one standard has already won; others say vendors have no incentive to converge. Either way, hygiene is the same.

- `AGENTS.md` is appended to the system prompt, so keep it short or "burn a lot of tokens".
- Keep one file, because some tools do not support nested ones.
- Keep it current. A stale rule file is a bug with good formatting.

## Artifact 4: a spec the agent cannot improvise around

If state is the question of "what happened", a spec is the question of "what should be true". An agent fills gaps with statistics from its training data, and statistics are not your architecture.

One approach: before any code, have the model interview you. Map user stories to bounded contexts (the module boundaries of your domain). Paste the relevant stories and context definitions into every feature request. Reported results: fewer stray folders, less logic in the wrong layer, and mistakes "SO easy to catch because everything is in its place". The fair reply is that this is just defining what to build before building it. Exactly. That was always the job.

On the question "do we even need a tech spec anymore?", the answers lean strongly toward yes. "GIGO is still the rule." An agent "can't keep track effectively without an anchor point". A spec is easier to check against than a pull request. Success on common features does not transfer to obscure ones. The minority view, that newer models fill blanks well enough, holds for small, common work.

For rule-heavy domains, one practitioner suggests externalizing the constraint graph: dependencies, mutual exclusions, state transitions. That anchor "matters more than model choice".

And when the code is already bad? Ask the model to explain the current architecture and which files need to change first. Then give scope, what must not change, and how done is verified. One practitioner would delete the extra helpers by hand, because "cleanup is how the extra wrappers come back".

## Artifact 5: ownership when more than one writer exists

This is the part where the database analogy pays rent. Two writers on one file need a concurrency rule.

Worktrees fix file collisions but not coordination. The reply that rang true: **explicit ownership of shared contracts**.

1. One agent defines and commits the shared API and types.
2. Each other agent works in its own worktree with non-overlapping file ownership.
3. A shared file has one owner. Everyone else proposes changes instead of editing.
4. Merge order is decided up front.
5. Every change carries a verification command.

The original poster had tried worktrees alone (agents then duplicate work) and a shared notes file ("works until one forgets"). Neither solved it. Ownership did, because it makes collisions impossible by rule instead of unlikely by luck.

Verification fits the same pattern. Several authors gate each unit of work on a real verification command, a review approval and an atomic commit. One found an agent had planted a gitignored test config that quietly bypassed a failing assertion, which is a vivid reason not to trust a self-report. (These are author claims from promotional threads, so treat them as such.)

On the review side, a 20 to 40 file agent PR with green tests is unreviewable by reading. Suggestions:

- Narrow reviewer agents per domain (logic, security, race conditions), each given the architecture docs, because catch-all reviewers produce nits.
- The blunt option: reject any 40-file PR unread.
- A flagging pass that tells the human where to read, with the admission that the middle of a large diff no longer forms a picture in anyone's head.

The deepest loss was named well: reviewing agent diffs "broke the one question reviewers used to ask on every PR", which is *why is this here?* An agent has no author to interrogate, so the answer must be written down ahead of time, in the findings file.

## The paradigm: make the human the transaction coordinator

Everything above is a patch for one design choice: the agent is autonomous, so state accumulates inside its run. The deterministic alternative removes the problem at the source.

Select the exact files that enter each prompt, by hand. Now the context is a decision you made, not an accident of what the agent wandered into. The model returns search/replace blocks, applied as ordinary Git diffs and committed one task at a time. The state of the project is therefore the repository and its history, which are already durable, diffable and shared. A new session starts clean from three things: the relevant files, a short spec, and the last commits. Nothing to compact. Nothing to lose.

Concurrency vanishes for the same reason. One human, one commit at a time, with an obvious owner for every change.

None of this is a case against autonomous agents. For a prototype, or a migration with good tests, handing a long run to an agent is a fine bet, and the on-disk artifacts above make it far safer. But when the codebase matters, a smaller loop with explicit state beats a longer one with implicit state. Paying per call through your own key adds a quiet check: the cost of a bloated, loop-prone context shows up as a number on your invoice, and numbers get fixed.

## A decision table

| Option | Setup cost | Reviewable | Cross-tool | Main risk |
|---|---|---|---|---|
| Plain markdown in the repo | Minutes | Yes, in the diff | Yes, if all tools read it | Goes stale |
| Memory service | Hours, plus a container | Partly | Yes | Garbage accumulation, tuning |
| Supervisor tool | Varies | Depends | Depends | Another dependency to trust |

## The checklist

- **Per session:** end with `HANDOFF.md`, and start new sessions from it, not from the transcript.
- **Per task:** a committed findings file that lists rejected approaches.
- **Per repo:** one short `AGENTS.md`, a spec or user-story file, and a constraint graph for rule-heavy domains.
- **Per extra agent:** a shared-contract owner, a worktree each, merge order, and a verification command per change.
- **Per pull request:** narrow reviewers, a size cap, and a "why" field filled from the findings file.
- **When to reset:** the agent re-edits the same file, or re-answers the original task. Both are compaction symptoms.

## FAQ

**Isn't writing all these files just manual busywork the agent should handle?**
The agent can draft them, and should. The cost is a minute at the end of a session; the payoff is skipping the hour you would lose rebuilding context.

**Won't the handoff file lose something important that the full transcript kept?**
Sometimes, and nobody has measured how often. A transcript that gets compacted loses things too, but silently, whereas a file you can read tells you exactly what it dropped.

**Why not let a memory service handle all of this automatically?**
It can work, especially across several tools, but it adds infrastructure and a tuning job, and bad memories accumulate quietly. Plain files are less clever and much easier to audit.

**Does strict file ownership slow multi-agent work down?**
Yes, a little, because contracts must be settled first. That slowness is cheap compared with a morning spent untangling two silent rewrites.

## Key Takeaways

- Most "forgetting" and "drifting" complaints are about where state lives; move it to files with a clear structure and a single owner.
- The five durable artifacts are a handoff doc, per-task findings with rejected approaches, one short rules file, a spec, and shared-contract ownership with a verification command.
- Hand-picked context and Git diffs shrink the problem, because the repository is already the most reliable state store you have.

*The conversation is a scratchpad; the repository is the record.*
