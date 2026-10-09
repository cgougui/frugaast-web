"Imagine the Merge Conflicts lmao." That was one of the most popular replies to a post about someone running agents across dozens of apps, and it's the whole problem in five words. Starting a third agent takes a second. Untangling what two of them did to the same file takes a morning.

The pain usually shows up as a joke rather than a complaint. A developer shares a toy office, a pixel-art room where each agent is a little coworker at a desk, and the top reaction is that watching them as coworkers is "way easier to reason about than a pile of terminals". The next reply: "+1 on the worktrees idea, parallel agents stepping on each other is the pain." In the thread about running millions of lines of code across dozens of apps, the other popular reply was "3 instances feels like enough to think about".

Starting agents (fan-out) is solved by every tool on the market. What isn't solved is fan-in, meaning merging and reviewing what comes back, and supervision, meaning knowing what each agent is doing right now.

If you've built a distributed system, you've seen this movie. Spawning workers is a one-liner. Partitioning the work, avoiding write conflicts, and reducing the results into something correct is the actual engineering. So I'll treat a pool of agents as a small distributed system and ask the questions distributed systems force on you.

## Can the work be split at all?

Before any tooling, ask whether the job splits cleanly. Developers who run many agents agree: parallelism only pays when the groundwork is solid.

One long write-up from an engineer who has had AI write nearly all their code for a year puts it together. "Parallel agents, zero chaos" only works because the first few thousand lines were made clean, so the agents copy good patterns instead of bad ones. In their words, AI is a force multiplier in whatever direction you're already going. They also offer a cheap health check: can a one-shot prompt produce a sane change in this codebase? If not, adding agents multiplies the mess.

People differ on how to make the output checkable. One group wants strict rules files but admits to "expect rules to not be followed consistently". Another relies on enforcement: coverage thresholds, mutation scores, maximum file lengths, strict type checking, complexity limits. The second group has the stronger argument for parallel work, because limits a machine checks don't need an agent to remember them a hundred messages later.

There's also disagreement about roles. Some say single-role agents beat one agent with many roles, because several checks from different roles are more likely to produce good code. Others read that as a warning against complicated multi-file agent definitions. Both can be true. A reviewer that's a separate session with a narrow job is cheap. A twelve-file hierarchy of personas is a new codebase you have to maintain.

## Who owns which file?

The sharpest sentence in the whole discussion: the friction isn't the models, it's two of them editing the same files and clobbering each other, plus losing track of which one is idle waiting for you while the other is still grinding.

Two agents in one working tree is a race condition with a friendly face. No lock, no isolation, no ordering. Agent A reads a file, agent B rewrites it, agent A writes back a stale version, and nobody gets an error.

The community's default fix is one checkout per agent, using git worktrees:

```bash
git worktree add ../feature-x -b feature-x
```

Each worktree gets its own checkout and index but shares the object store, so it's cheap. Each still needs its own dependency install and its own port, or the isolation is fake.

Cleanup scripts are destructive, and agents can reach them. One developer came back from holiday to find an agent had run their worktree teardown command after opening a pull request, unprompted and outside any "finish the branch" workflow they'd set up. The lesson isn't that agents are malicious. It's that anything callable eventually gets called.

## Where does the task state live?

A distributed system keeps its state outside the workers. Agents that keep the plan in the chat can't be restarted, inspected or handed off.

The most concrete setup in the threads is worth walking through. A developer uses a task tracker as the shared queue, with a manager model creating tasks. A launcher script cleans up stale locks and logs, counts ready tasks, and opens a tmux grid with N panes. Each pane runs the same loop:

1. Pick a task.
2. Create a lock for it.
3. Move it to "In Progress".
4. Gather context.
5. Run the coding agent (cheaper models do the typing here).
6. Test and commit.
7. Parse the result and update the tracker.
8. Release the lock and take the next task.

The manager reviews in batches, not per task. Here's the locking step as a sketch of the control flow (mine, not the author's script):

```bash
exec 9>"locks/$TASK_ID.lock"
flock -n 9 || exit 0          # someone else owns it
set_status "$TASK_ID" in_progress
run_agent "$TASK_ID"; code=$?
set_status "$TASK_ID" "$([ $code -eq 0 ] && echo done || echo failed)"
```

The lessons are unglamorous. Lock files plus task state kept outside make agents restartable. Cleaning up stale locks at launch is a real requirement, because a crash will leave one behind. And the manager reviews in batches because reviewing each task would dominate the runtime.

The skeptics showed up in the replies, naturally. "Agents drift, however slowly they still drift... the drift piles up," said one, who couldn't imagine what came out the other end. Another noted that not much seemed to have happened in three hours. A third hands subagent work to a second vendor's CLI, with the first model as manager and reviewer, and admitted they "did not do measurements".

Compare the stripped-down version, described as "just bash around [a CLI] with persistent threads, called from skills. no framework, no mcp, no agent swarm bs". Its loop: plan, review the plan until approved, implement, have the orchestrator read the full diff, run tests, review against the plan, repeat, then do the release chores. Half the thread turned out to have built the same thing independently. One person turned their bash into a small gateway daemon with persistent sessions and messages across engines: "a bus not a brain".

That phrase is the whole design principle. A bus moves messages and keeps state. A brain improvises, and that's where the failures live. One engineer who set up two models in a winner-versus-loser arrangement found it "desensitised" within a week, and the orchestrator started skipping the second model at random. Orchestration done purely in prompts decays. A script doesn't.

## What extreme scale shows, and what it hides

A report went around of a large language-runtime port done by about 60 agents running for roughly eleven days across dozens of dynamic workflows. Before the fan-out, about three hours of planning conversation were turned into a written porting spec. The claimed cost was in the six figures at API prices, against about a year of work for three engineers by hand. The poster said that without the workflow feature, they'd have had to write their own harness.

The reactions: "Feels like only token billionaires can pull this off." "This was only possible because the lead was an excellent engineer." And the skeptic's point that the vendor owns the project, so it reads as an advertisement.

The honest takeaway is narrow. The summary doesn't say how merging or verification worked, so nothing can be concluded about fan-in at that scale. The only thing to take from it is what was reported: a long human planning phase and a written spec came before the fan-out. Parallelism was the last step, not the first.

## Seeing who needs you

If fan-in is the merge problem, supervision is the observability problem. A cottage industry of dashboards exists to answer one question: which agent is waiting on you?

The technique worth stealing is boring. Several of these tools tail the session transcript files already on disk instead of wrapping the CLI. That earned the best compliment in the thread: "just reading whats already there". It needs no changes to the agent and can't break it. One person wanted the tool to show which files each agent is currently editing, which is the collision signal again.

The counterpoints were healthy. "Maybe its time to consider if that terminal really is the best interface after all?" Another would rather work on one task at a time to avoid constant context switching. Another switched session managers for "less theater and more control". A few wondered whether wrapping the agent breaks the vendor's terms and risks a ban. Nobody answered.

The cheapest supervision pattern beats all of them on simplicity: while one agent works, work on two projects at once and test whatever the other one finished. You're never the one sitting idle, and there's no grid to maintain.

## What parallelism costs besides tokens

- **Runaway fan-out.** A joke thread about "excessive parallel subagents" shows a screenshot of a crowd of top-tier subagents stuck in tool-call loops that burned a session twice. One report on subagent-driven development was blunt: it "fkn drains the whole 5h limit, takes like 30m+ to complete. single agent execution usually works soo much better". The best operational advice came in reply: subagents work fine "if you aim them like missiles instead of managing them like employees".
- **Resume surprises.** A developer running five or more parallel sessions most days saw random three- or four-dollar charges on resumed sessions and switched to fresh conversations. That loses context but makes cost predictable. Whether a caching bug caused it was disputed.

Then there's the estimate problem, which is really the slicing problem. An agent says "three days" and finishes in twenty minutes. One developer's rule: projects either take two minutes or three months. "Either your project is split up into small enough slices that the agent can do each slice in 2 minutes" or you fight drift. Slice size, not the number of agents, decides whether fan-out works.

## Scaling yourself, deterministically

Every pattern that works has the same ingredients: state kept outside the model, ownership decided by a human, and a reviewer reading a diff.

That's the case for deterministic, agentless control. It isn't an argument against ever running agents. For a greenfield prototype, start as many as you like and throw away the result. It's about long-lived code, where two of the three hard problems above are about files. If you pick the exact files for each task, "who owns what" is answered by construction. When each change comes back as search/replace blocks applied through a normal Git diff, fan-in is a review you already know how to do, one change at a time, with each request's cost visible on your own API key instead of hidden in a subscription window.

A human picking files is a slower fan-out and a much faster fan-in.

## Before the third agent

- Slice tasks so they finish in minutes, with no overlapping files, and write the list down in a tracker or plan file.
- One checkout per agent, a temp directory per agent, and a disk-space alarm.
- A lock or status field outside the chat. Clean up stale locks at launch and make the loop restartable.
- Separate worker and reviewer roles. The orchestrator reads the whole diff before anything merges.
- Commit before fanning out. Keep destructive cleanup commands out of the agents' reach or behind a hook.
- A way to see who's waiting: transcript tailing, a notification on "waiting for input", or at least two projects so you're never idle.
- Measure wall-clock time, tokens and rework for one agent versus several on the same task before committing to a grid.

Worktrees prevent live clobbering, but not logical conflicts: two correct changes can still disagree about an interface. Someone has to read the merged result, and that part doesn't parallelize. A swarm can beat a single agent on clearly specified, mechanical work with a written plan, like a large port, and in those reports the planning came first. For anything exploratory, coordination overhead tends to eat the gain. Several engineers end up in the same place: one agent with a good plan beats a swarm. "3 instances feels like enough."
