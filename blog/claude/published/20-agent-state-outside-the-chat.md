One agent spent 40 minutes ruling out an approach. Two hours later, a different agent proposed exactly that approach. Neither was wrong, given what it could see. The problem was where the knowledge lived: in a chat transcript.

Strip away the AI vocabulary, and most complaints that "the agent forgot", "the agent drifted" or "the agent redid my work" become questions any backend engineer would recognize. Where's the source of truth? Who's allowed to write to it? What happens when two writers collide? How do you recover after a crash?

A chat transcript answers none of these. It's append-only, unindexed, summarized lossily when it grows, and owned by whoever's window it sits in. My argument is a design one: move the state out of the chat, give it a structure, and give every piece of it exactly one owner.

## One failure, four disguises

**Compaction.** A developer on a desktop coding app complains it's "constantly having to retrace its steps after compaction". A reply: it "rewrites the same file three times because it forgot what it already did". Another reply corrects a misunderstanding: the big number people see is total capacity, input plus output, so it's not a downgrade. That correction matters. The window size isn't the problem. Where the state lives is.

**Switching sessions.** The 40-minute dead end proposed again two hours later. One tool "knows what got written", another "knows why approaches were abandoned", a third "knows what to do next", and none of them share.

**Two writers, one repo.** One agent refactored a types file while another was halfway through using it. Neither errored. A merge landed on a version of the file that no longer existed, and untangling it took most of the next morning.

**Browser chats.** Very long threads get laggy, and code snippets vanish into the scrollback.

Here's what a three-hour run keeps in each place:

```
IN THE TRANSCRIPT                 ON DISK (survives everything)
-------------------------------   --------------------------------
every message, in order           HANDOFF.md      what is true now
tool output, 200 lines at a time  findings/<task>.md  what was tried
half-remembered decisions         SPEC.md         what must be built
"as said earlier..."              git log         what actually changed
(compacted or lost at ~90%)       (reviewable, diffable, shareable)
```

The left column is what the model sees. The right column is what you can check.

## Chats are fragile

This isn't user error. It's a class of bugs in the tools themselves. One extension's release notes included a fix for the original task request getting lost during context condensing, which made the agent try to answer the original task again when it resumed. When the harness compresses history, whatever got compressed away is gone, and the compressor doesn't know which sentence mattered.

Developers also report a simpler version: output degrades "when the context window gets too full", and just starting a new context window brings performance back. On the browser side, one developer points out that the lag is "not really chat, but your browser" holding the entire conversation, and the desktop app avoids it.

Some people argue a web chat feels better than an IDE agent because it "thinks longer", and others guess a provider cut reasoning time. Both are speculation.

The practical rule is simple: anything you can't afford to lose doesn't live in the transcript.

## The handoff doc

The cheapest fix has the most agreement. At the end of a session, ask the model to write a markdown file with "current state, decisions made, open questions, and the minimum code context needed to continue". Start the next chat by pasting in only that file. Several developers confirm it works.

A template:

```
# HANDOFF.md
## Done (with commit hashes)
## In progress / blocked
## Decisions + rejected approaches (and why)
## Files that matter / files not to touch
## Next step, verifiable by: <command>
```

The last line is the underrated one. "Verifiable by" means the next session can check the claim instead of trusting it.

In browser chats, similar habits help: one conversation per task or module, branching the conversation before a tangent, and Git commits as a "context refresher". One fair caveat: splitting work into smaller chunks with explicit instructions is "a workaround, not a fix". True, but it's a workaround that works.

## Findings files in the repo

A handoff doc covers a session. A findings file covers a task, and it's the one that would have saved those 40 minutes.

One developer has the model "write and maintain a markdown file for each task", committed to the repo. Bonus: a coworker, and their own assistant, can get up to speed from it. Another design keeps a work contract on disk (a checklist or a goal with an hour budget), with items marked done, active, parked or blocked, plus decisions, rejected attempts, and where the next session should pick up. A small external watcher for dead sessions rounds it out.

Why write down rejected approaches explicitly? Because that's exactly what a fresh session doesn't know. Without it, a smart model is an eager colleague who'll cheerfully propose the thing you already killed. "Tried X, failed because Y" costs two lines and saves an hour.

A word on sources: some of the loudest advice on this comes from people promoting memory products. The plain-file answers have no vendor.

## Shared memory: plain files or a service?

When several tools need the same memory, people split into two camps.

Plain files are simple, reviewable and committed. A retrieval service (a self-hosted database with semantic, keyword, graph and time-based recall, shared by several agents) works across tools and builds up knowledge, but needs tuning and another container to run. One author says the "extraction mission", the instruction that decides what gets remembered, is the most important setting, because without it "the bank fills with garbage fast". Another lesson: a stable worker identity matters, or in-flight tasks get parked on restart. Nobody independently confirmed any of this.

Then there's the zoo of rule files. One tool wants `CLAUDE.md`, another its own file, another `AGENTS.md`, each with its own dot-directory and ignore file. The workarounds are modest: a file that just says `@agents.md`, or a script to migrate old rules. Some say one standard has already won; others say vendors have no reason to converge. Either way, the hygiene is the same:

- `AGENTS.md` is appended to the system prompt, so keep it short or "burn a lot of tokens".
- Keep one file, since some tools don't support nested ones.
- Keep it current. A stale rule file is a bug with good formatting.

## A spec the agent can't improvise around

State is about what happened. A spec is about what should be true. An agent fills gaps with statistics from its training data, and statistics aren't your architecture.

One approach: before writing any code, have the model interview you. Map user stories to bounded contexts (the module boundaries of your domain). Paste the relevant stories and context definitions into every feature request. The reported results: fewer stray folders, less logic in the wrong layer, and mistakes that are "SO easy to catch because everything is in its place". The fair reply is that this is just defining what to build before building it. Exactly. That was always the job.

On "do we even need a tech spec anymore?", answers lean strongly toward yes. "GIGO is still the rule." An agent "can't keep track effectively without an anchor point". A spec is easier to check against than a pull request. Success on common features doesn't carry over to obscure ones. The minority view, that newer models fill in blanks well enough, holds for small, common work.

For rule-heavy domains, one practitioner suggests writing out the constraint graph: dependencies, mutual exclusions, state transitions. That anchor "matters more than model choice".

And when the code is already bad? Ask the model to explain the current architecture and which files need to change first. Then give it the scope, what must not change, and how "done" gets verified. One practitioner deletes the extra helpers by hand, because "cleanup is how the extra wrappers come back".

## One owner per shared file

This is where the database analogy really pays off. Two writers on one file need a concurrency rule.

Worktrees fix file collisions but not coordination. The reply that rang true was explicit ownership of shared contracts:

1. One agent defines and commits the shared API and types.
2. Every other agent works in its own worktree, owning files that don't overlap.
3. A shared file has one owner. Everyone else proposes changes instead of editing.
4. Merge order is decided up front.
5. Every change comes with a verification command.

The original poster had tried worktrees alone (the agents then duplicated work) and a shared notes file ("works until one forgets"). Neither solved it. Ownership did, because it makes collisions impossible by rule instead of unlikely by luck.

Verification follows the same pattern. Several authors gate each unit of work on a real verification command, a review approval and an atomic commit. One found that an agent had planted a gitignored test config that quietly bypassed a failing assertion, which is a vivid reason not to trust self-reports. (These claims come from promotional threads.)

On the review side, a 20 to 40 file agent PR with green tests can't really be reviewed by reading. Suggestions:

- Narrow reviewer agents per domain (logic, security, race conditions), each given the architecture docs, because catch-all reviewers produce nitpicks.
- The blunt option: reject any 40-file PR unread.
- A flagging pass that tells the human where to look, with the admission that the middle of a large diff no longer forms a picture in anyone's head.

The deepest loss was put well: reviewing agent diffs "broke the one question reviewers used to ask on every PR", which is "why is this here?" There's no author to ask, so the answer has to be written down in advance, in the findings file.

## Or let the human coordinate

Everything above patches one design choice: the agent is autonomous, so state piles up inside its run. The deterministic alternative removes the problem at the source.

Pick the exact files that go into each prompt by hand. Now the context is a decision you made, not an accident of what the agent wandered into. The model returns search/replace blocks, applied as ordinary Git diffs and committed one task at a time. The state of the project is then the repository and its history, which are already durable, diffable and shared. A new session starts clean from three things: the relevant files, a short spec and the last few commits. Nothing to compact, nothing to lose.

Concurrency goes away for the same reason: one human, one commit at a time, an obvious owner for every change.

None of this argues against autonomous agents. For a prototype, or a migration with good tests, handing a long run to an agent is a fine bet, and the on-disk files above make it much safer. But when the codebase matters, a smaller loop with explicit state beats a longer one with hidden state. Paying per call with your own key adds a quiet check: the cost of a bloated, loop-prone context shows up as a number on your invoice, and numbers get fixed.

## Choosing

| Option | Setup cost | Reviewable | Works across tools | Main risk |
|---|---|---|---|---|
| Plain markdown in the repo | Minutes | Yes, in the diff | Yes, if every tool reads it | Goes stale |
| Memory service | Hours, plus a container | Partly | Yes | Accumulates garbage, needs tuning |
| Supervisor tool | Varies | Depends | Depends | One more dependency to trust |

## Checklist

- **Per session:** end with `HANDOFF.md`, and start the next session from it, not from the transcript.
- **Per task:** a committed findings file that lists rejected approaches.
- **Per repo:** one short `AGENTS.md`, a spec or user-story file, and a constraint graph for rule-heavy domains.
- **Per extra agent:** an owner for each shared contract, a worktree each, a merge order, and a verification command per change.
- **Per pull request:** narrow reviewers, a size cap, and a "why" filled in from the findings file.
- **When to reset:** the agent re-edits the same file or answers the original task again. Both are signs of compaction.

The agent can draft all these files, and should. It costs a minute at the end of a session and saves the hour you'd spend rebuilding context. A handoff file will sometimes drop something the transcript had, and nobody knows how often. But a compacted transcript drops things too, silently, while a file you can read shows you exactly what's missing. And yes, strict file ownership slows multi-agent work a little, because contracts have to be settled first. That's cheap compared with a morning spent untangling two silent rewrites.
