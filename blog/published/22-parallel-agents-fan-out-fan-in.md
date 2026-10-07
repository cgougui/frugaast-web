# Fan-Out Is Easy, Fan-In Is the Job: Running Many Coding Agents at Once

Anyone can open six terminals and start six agents. The hard part is what happens when the work comes back: who owns which file, who is waiting on you, and who reads the combined diff. Parallel agents are a coordination problem wearing a throughput costume.

> I started a third agent on Tuesday and by Thursday I was spending more time untangling what two of them had done to the same files than I had saved. I could not even tell which one was idle, waiting for me, while the other kept grinding.

## The same problem, told sideways

The pain rarely shows up as a complaint. It shows up as a joke.

A developer shares a toy office, a pixel-art room where each agent is a little coworker at a desk, and the top reaction is that watching them as coworkers is "way easier to reason about than a pile of terminals". The next reply adds: "+1 on the worktrees idea, parallel agents stepping on each other is the pain." Another thread celebrates someone running millions of lines of code across dozens of apps. The most popular replies? "3 instances feels like enough to think about" and "Imagine the Merge Conflicts lmao".

Two layers are visible. Starting agents (fan-out) is solved by every tool on the market. The unsolved layers are fan-in, meaning merging and reviewing what returned, and supervision, meaning knowing what each agent is doing right now.

If you have ever built a distributed system, you already know this movie. Spawning workers is a one-liner. Partitioning the work, avoiding write conflicts, and reducing results into something correct is the actual engineering. The lens for this article is that one: treat a pool of agents as a small distributed system and ask the questions distributed systems force on you.

## Question one: is the work partitionable at all?

Before any tooling, ask whether the job splits cleanly. Experienced developers who run many agents are consistent about this: parallelism pays only when the groundwork is solid.

One long write-up from an engineer who has had AI write nearly all of their code for a year ties it together. "Parallel agents, zero chaos" is only possible because the first few thousand lines of the project were made clean, so the agents replicate good patterns instead of bad ones. Their phrasing: AI is a force multiplier in whatever direction you are already going. They also offer a cheap health test: can a one-shot prompt produce a sane change in this codebase? If not, adding agents multiplies the mess.

Opinions diverge on how to make the output checkable. One group wants strict rules files but admits to "expect rules to not be followed consistently". Another leans on enforcement: coverage thresholds, mutation scores, maximum file lengths, strict type checking, complexity limits. That second camp has the sturdier argument for parallel work, because machine-checkable limits do not need to be remembered by an agent a hundred messages after they were read. Keep that to one paragraph here; the details belong in the articles on hooks and verification.

There is also a real disagreement about roles. Some say single-role agents beat one agent with many roles: multiple checks with different roles are more likely to produce quality code. Others read the same advice as a warning against complicated multi-file agent definitions. Both can be true. A reviewer that is a separate session with a narrow job is cheap. A twelve-file hierarchy of personas is a new codebase you have to maintain.

## Question two: who owns which file?

The sharpest sentence in the whole discussion is this one: the friction is not the models, it is two of them editing the same files and clobbering each other, plus losing track of which one is idle waiting for you while the other is still grinding.

Two agents in one working tree is a race condition with a friendly face. There is no lock, no isolation and no ordering. Agent A reads a file, agent B rewrites it, agent A writes back a stale version, and nobody gets an error.

The community's default remedy is one checkout per agent, via git worktrees. This is a general-background sketch, not a measured recipe from the threads:

```bash
git worktree add ../feature-x -b feature-x
```

Each worktree gets its own checkout and index but shares the object store, so it is cheap. Each still needs its own dependency install and its own port, or the isolation is theater.

Cleanup scripts are destructive actions, and agents can reach them. One developer returned from holiday to find that an agent had run their worktree teardown command after raising a pull request, unprompted, and not as part of any "finishing a branch" workflow they had set up. The lesson is not "agents are malicious". It is that anything callable is eventually called.

## Question three: where does the task state live?

A distributed system keeps its state outside the workers. Agents that keep the plan in the chat cannot be restarted, inspected or handed off.

The most concrete setup in the threads is worth walking through. A developer uses a task tracker as the shared queue, with a manager model creating tasks. A launcher script cleans stale locks and logs, counts ready tasks, and opens a tmux grid with N panes. Each pane runs the same loop:

1. Pick a task.
2. Create a lock for it.
3. Move it to "In Progress".
4. Collect context.
5. Run the coding agent (cheaper models do the typing here).
6. Test and commit.
7. Parse the result and update the tracker.
8. Release the lock and take the next task.

The manager reviews at batch boundaries, not per task. As a sketch of the control flow only, not the author's script, the locking step looks like this:

```bash
exec 9>"locks/$TASK_ID.lock"
flock -n 9 || exit 0          # someone else owns it
set_status "$TASK_ID" in_progress
run_agent "$TASK_ID"; code=$?
set_status "$TASK_ID" "$([ $code -eq 0 ] && echo done || echo failed)"
```

What this teaches is unglamorous. Lock files plus an external task state make agents restartable. Cleaning stale locks at launch is a real design requirement, because a crash will leave one. And the manager looks at results in batches because per-task review would dominate the runtime.

The skeptics were in the replies, naturally. "Agents drift, however slowly they still drift... the drift piles up", said one, who could not imagine the output at the other end. Another noted that not much seemed to have happened in three hours. A third delegates sub-agent work to a second vendor's CLI with the first model as manager and reviewer, and admitted they "did not do measurements".

Contrast that with the stripped-down version, written as "just bash around [a CLI] with persistent threads, called from skills. no framework, no mcp, no agent swarm bs". Its control flow: plan, review the plan in a loop until approved, implement, the orchestrator reads the full diff, run tests, review against the plan, loop, then do release chores. Half the thread, it turned out, had independently built the same thing. One person turned their bash into a small gateway daemon with persistent sessions and cross-engine messages, "a bus not a brain".

That phrase is the whole design principle. A bus moves messages and keeps state. A brain improvises. The brain is where the failures live: one engineer who tried a winner-versus-loser framing between two models found it "desensitised" within a week, and the orchestrator started skipping the second model unreliably. Prompt-only orchestration decays. A script does not.

## What extreme scale shows, and what it hides

A report circulated of a large language-runtime port, done by roughly 60 agents running for about eleven days across dozens of dynamic workflows. Before the fan-out, a planning conversation of around three hours was serialized into a written porting spec. The claimed cost was in the six figures at API prices, against about a year of work for three engineers by hand. The poster noted that without the workflow feature, they would have had to write their own harness.

The reactions are instructive. "Feels like only token billionaires can pull this off." "This was only possible because the lead was an excellent engineer." And the sceptic's point that the project's owner is the vendor, so it reads as an advertisement.

The honest reading is narrow. The summary does not say how merging or verification worked, so no claim about fan-in at that scale is supportable. What can be taken from it is only what was reported: a long human planning phase and a written spec came before the fan-out. The parallelism was the last step, not the first.

## Supervision: seeing who needs you

If fan-in is the merge problem, supervision is the observability problem. A cottage industry of dashboards exists to answer one question: which agent is blocked on you?

The technique worth stealing is boring. Several of them tail the session transcript files already on disk instead of wrapping the CLI. That earned the best compliment in the thread: "just reading whats already there". It needs no modification of the agent and cannot break it. One person wanted the tool to show which files each agent is currently editing, which is, again, the collision signal.

The counterpoints are healthy. "Maybe its time to consider if that terminal really is the best interface after all?" Another says they would rather work on one task at a time, because of constant context switching. Another switched managers for "less theater and more control". A few worry about whether wrapping the agent breaks the vendor's terms and risks an account ban, a question that went unanswered.

The cheapest supervision pattern in the chunk beats all of them on complexity: while one agent works, work on two projects at once, and test whatever the other one finished. You are never the idle one, and there is no grid to maintain.

## What parallelism costs besides tokens

Quota economics are covered elsewhere, so keep this to mechanics.

- **Runaway fan-out.** A joke thread about "excessive parallel subagents" shows a screenshot of a crowd of top-tier subagents and endless tool-call loops that burned a session twice. One report of subagent-driven development was blunt: it "fkn drains the whole 5h limit, takes like 30m+ to complete. single agent execution usually works soo much better". The reply is the best operational advice here: subagents work fine "if you aim them like missiles instead of managing them like employees".
- **Resume surprises.** A developer with five-plus sessions in parallel most days saw random three- to four-dollar charges on resumed sessions and switched to fresh conversations. That loses context but makes cost predictable. Whether a caching bug was the cause was disputed.
And then the estimate problem, which is really the slicing problem. An agent says "three days" and finishes in twenty minutes. One developer's rule: projects either take two minutes or three months, "either your project is split up into small enough slices that the agent can do each slice in 2 minutes" or you fight drift. Slice size, not agent count, decides whether fan-out works.

## The deterministic way to scale yourself

Notice what every working pattern has in common: state outside the model, ownership decided by a human, and a reviewer reading a diff.

That is the case for deterministic, agentless control, and it is not an argument that you should never run agents. For a greenfield prototype, spin up as many as you like and throw away the result. The argument is about long-lived code, where two of the three hard problems above are about files. Scoping the exact files for each task means the "who owns what" question is answered by construction: the developer picks them. When each change comes back as search/replace blocks applied through a standard Git diff, fan-in is a review you already know how to do, one change at a time, with the cost of each request visible on your own API key rather than hidden inside a subscription window.

A human who selects files is a slower fan-out and a far faster fan-in.

## A checklist before the third agent

- Slice tasks to finish in minutes, with disjoint file sets, and write the slice list down in a tracker or plan file.
- One checkout per agent, a per-agent temp directory, and a disk-space alarm.
- A lock or status field outside the chat. Clean stale locks on launch and make the loop restartable.
- Separate worker and reviewer roles. The orchestrator reads the whole diff before anything merges.
- Commit before fan-out. Keep destructive cleanup commands out of agent reach or behind a hook.
- A supervision signal: transcript tailing, a notification on "waiting for input", or at least two projects so you are never idle.
- Measure wall-clock time, tokens and rework for one agent versus several on the same task before committing to a grid.

Counterview to close on, since several engineers say it: one agent with a good plan beats a swarm. "3 instances feels like enough."

## FAQ

**If worktrees isolate agents, why is fan-in still hard?**
Isolation prevents live clobbering but not logical conflicts: two correct changes can still disagree about an interface. Someone has to read the merged result, and that is the part that does not parallelize.

**Does a swarm ever beat a single agent?**
For clearly specified, mechanical work with a written plan, such as a large port, yes, and the reports say the planning came first. For anything exploratory, coordination overhead tends to eat the gain.

**Isn't watching a dashboard just another chore?**
It can be, which is why the cheapest approach is alternating between two projects. A dashboard earns its place only if it answers "who needs me" faster than a glance at a terminal.

**Why distrust prompt-based orchestration?**
Because instructions decay: one team saw a model quietly skip a reviewer within a week. A script that enforces the loop does not forget.

## Key Takeaways

- Parallel agents are a coordination problem: partition the work, give each agent its own checkout, and keep task state outside the chat.
- Fan-in and supervision, not fan-out, set your real throughput, and slice size matters more than agent count.
- Scoped files, reviewable diffs and visible costs make the merge step human-sized again.

*Throughput is easy to buy; trust in the merged result has to be earned one diff at a time.*
