Which of the tools running next to your coding agent can rewrite its notes? Which ones talk to the internet? If you've installed a monitor, a memory layer and an index builder because each promised to fix a real pain, you probably can't answer either question.

Most reviews of these tools ask whether they work. I think the better first question is what happens if the tool is wrong, hostile, or abandoned next month. A tool that draws a pretty chart of your sessions and gets it wrong wastes a glance. A tool that writes "facts" about your repository into every future prompt and gets them wrong wastes days, and nobody notices, because the damage happens before the model even sees the prompt.

By sidecars I mean tools that run next to the agent: monitors, session managers, memory layers, index builders, and tools that measure the vendor. Harnesses, models, sandboxes and routing are a different conversation.

## Five jobs, five failure modes

The feeds around coding agents are oddly symmetrical. On one side, people report quota draining faster than expected, models that seem to regress, and a vendor dashboard that says almost nothing. On the other side, people ship sidecars aimed at exactly those pains. Someone asks "is it just me?" about a sudden quota drop; one reply finds fast mode was still on, another saved usage by telling the agent to skip UI and regression tests until asked. Elsewhere, a developer running four sessions at once builds a terminal monitor because nothing told them how full each context was.

The tools fall into five groups (my grouping, but it holds up):

| Job | Typical tools | What you give up | How it fails |
|---|---|---|---|
| See what the agent is doing | Terminal session monitors, codebase canvas viewers, hook-event dashboards | A little attention and some local access | Misleading at scale; a canvas showing a million files shows nothing |
| Run many agents | Worktree-based session managers, orchestrators, review workspaces | Control over each task's state | Stale queued work; a subscription for a phone remote |
| Carry knowledge between sessions | Memory wikis, "Git for AI memory", tools that summarize past chats | Part of what your agent believes is now written by software | Outdated or wrong notes injected into every prompt |
| Shrink what the agent reads | Signature maps, dependency graphs, repo orientation CLIs | Whatever detail the summary dropped | Stale index; lost edge cases |
| Measure the vendor | Local usage trackers, daily pass-rate trackers, leaderboards built from PRs | Time to interpret the numbers | Mistaking API-dollar equivalents for quota |

The last column is rarely what the author's own benchmark tests.

## Monitors are the easiest to trust

The best argument for a monitor fits in one sentence from the threads: once you stop editing code yourself, "you really just need a good viewer."

Good monitors share a design. They read state the vendor's interface hides, they read it from local files, and they don't touch the agent. The cleanest example reads only local session data, has zero dependencies, makes no network calls, and shows how full each session's context is (input, cache, output, free), with a button to kill a runaway session. The worst it can do is show a wrong number.

What do people actually want to watch?

- **How full each session's context is.** How close is it to the wall?
- **Cache behavior.** In one quota thread, a user claimed cache retention was 30 minutes on one model and 24 hours on another. A skeptic doubted the 24-hour figure and said the logs came from a period when the policy was changing. A local tool logging the cached share per turn would settle this in an afternoon. As far as I could see, nobody has built a good one.
- **Idle versus waiting on you.** One hook-event dashboard exists because of "alt-tabbing twenty times a day."
- **What changed in the code.** A canvas viewer found "a large section of bloat" in someone's personal project. Another reader replied, "You ain't keeping track of anything with this," and a joke about repos with over a million source files raised the scaling question. Both fair.

One gap: a usage panel fed from an SDK payload works for API-based agents, but not for subscription CLIs, where the usage meter is exactly the part you can't see. That's why users ask the model to analyze its own logs, and why others reply that API-equivalent dollars aren't quota.

A homemade version is easy to sketch:

1. Find the directory where the agent writes session logs.
2. Tail the newest file.
3. For each turn, pull out input, cached input, output and reasoning tokens.
4. Print the cached share and a running total.

## Session managers: what do you get beyond worktrees and tmux?

The pitch is "a team of agents in parallel." The honest baseline is `git worktree` plus a terminal multiplexer. So what does a GUI add? From the posts: a task queue, automations, mobile remote control and an offline queue in one; a verification step per task and a supervisor over a dozen agent CLIs in another.

To be fair, running several agents safely does need isolation, and agents can leave orphaned tasks eating CPU and memory. A tool that tracks and kills them is useful.

But the questions engineers asked are the real evaluation criteria.

**Does it re-check state before acting?** One reader asked whether an agent queued offline still launches if the task was closed or reassigned while the laptop was disconnected. That's the stale-work question for every queue.

**What does the remote cost?** A remote costing "$12 a month" for sending phone messages got the reply "crazy." There's a first-party remote too, with its own rough edges: same network only for some users, "waiting for desktop" loops.

**What do downloads prove?** Under a claim of tens of thousands of downloads came the dry remark that "number of downloads has become a quality metric," plus a guess that most were bots. Nobody offered data either way. Only the skepticism is evidence.

Then there's survival. First-party agents are absorbing features fast: long-running objectives (users reported runs of 19 hours and more), side chats, annotations, worktree skills. When one thread introduced a fork that brought other models into a different agent, replies pointed out that an official plugin already existed and predicted "nobody's going to maintain these cc forks." Ask every sidecar: will it survive the next vendor release?

The harsher version is the loophole tool. Some users built tools to keep tasks running past 0% quota. Afterwards, tasks reportedly stopped at 0% and a "reserve" limit appeared in the client. Engineers blamed the loophole tools, though the vendor confirmed nothing. Either way, anything built on a vendor quirk has a short half-life.

## Memory and index tools: test the claims

This category gets the most hype, so it deserves the most scrutiny. Side by side, the self-reported claims look like this (all run by their authors, all against different baselines):

- A signature-map CLI: 97% fewer tokens, task success up from 10% to 59% across 18 repos.
- A code-graph tool: 10x less returned context than grep's top three results, perfect recall of the expected symbols on six retrieval tasks, five of five agent tasks passing. A reader joked that the next stage is "an agent said should work."
- A repository-intelligence tool with a five-layer index: about 31% fewer output tokens over 48 questions, and the best coverage against four competitors.
- A local memory layer: "up to 90% token savings after 100+ sessions."
- A memory project that announced itself as the highest-scoring in its category and collected tens of thousands of stars in two days, then drew a top comment linking an issue saying it didn't live up to the claims.

Read the numbers carefully. Bytes returned aren't task success. Retrieval recall isn't total cost. "Grep top-3" and "bare agent" are baselines no competent engineer would choose. Six retrieval tasks is an anecdote with a table.

The questions readers asked, mostly unanswered, make a better checklist than any benchmark:

- **Sync.** "How does it stay in sync with the codebase?" and "every time you work on something new you need to reindex... you find yourself with an outdated index." What triggers a rebuild?
- **Scale.** One engineer's indexer ran out of memory on the Linux kernel and had to be rewritten in a systems language.
- **Overlap.** "Any different than...?" shows up under half the posts. Nobody answered with a head-to-head comparison.
- **Why not Git?** Under a "Git for AI memory" post: "why git isn't the git for AI memory?" No answer.

There's a counter-camp worth hearing. A repo-orientation CLI with no AI calls and no API keys was praised for avoiding pipelines that expect the LLM to "get it right every time" on the hard part. Another tool's health score uses about 25 deterministic markers with no model involved. Compare that with tools where a model writes the wiki, so a stale or wrong page becomes part of every future context.

Compression has a price too. One engineer warned that aggressive summarizing can lose edge cases "which would lead to double the cost for fixing and looping." The same discussion had a cheaper alternative needing no tool at all: a rule telling the agent to hand big log reads to a small subagent that returns a summary.

## The sidecar sees everything the agent sees

This is where the blast radius becomes literal.

One user reported that using another company's model as a subagent uploaded repository state, including secret `.env` files, to that company's servers, and shared a log search to check for upload events. Replies were inconclusive: one said files had been sent before a certain release; another noted the check only showed start entries and asked whether the uploads completed. It's a single unverified report. But the sober reply stuck: "assume 100% of what these tools have access to was uploaded."

Smaller examples are more common: an update script that pulls the branch and then refreshes dependencies, leaving a half-updated install if that step fails; a browser-search tool that stores a profile; a tool that reads Windows UI structure; a maintainer reporting a low-effort fork of their project presented as independent work, complete with an offer of "co-founder" status.

Stars and downloads can be manufactured. "No network calls" and "100% offline" are the authors' words, not audits.

## Vetting in ten minutes

| Question | Why it matters | Ten-minute test |
|---|---|---|
| What does it read and send? | Secrets leaving the machine | Run it with networking off; watch outbound connections |
| What happens when the code changes? | Stale indexes | Switch branches, dirty the tree, see what updates and when |
| Is the savings number about the right thing? | Bytes aren't success | Ask for task success and total tokens per finished task |
| Does it lose information, and where? | Dropped edge cases | Feed it one of your own failing tasks, with and without it |
| Does the vendor already ship it? | Short half-life | Read the changelog before installing |
| Does it depend on a vendor quirk? | Breaks on the next release | Look for words like "bypass" or "loophole" |
| Is anyone maintaining it? | Dead tools stay starred | Recent commits, replies to issues, platform coverage |
| What does it cost to be wrong? | A viewer versus a memory layer | Ask what it writes into future prompts |

The order to adopt them follows from the last row: read-only local monitors first, session managers second, retrieval third, memory layers last. Only memory layers rewrite what the agent believes.

## The smallest blast radius

Look at what the memory and index tools compensate for: an agent that decides on its own what to read and remember. Each sidecar adds another system making decisions for you.

There's a simpler path. Pick the exact files for each request yourself, from a tree or a fuzzy search. The context is whatever you selected, and nothing stale can get injected, because nothing was stored. Apply changes as search/replace blocks and review them as ordinary Git diffs. Track the cost of each request through your own API key, so nobody has to guess a quota from a bar.

You do give something up: ambient memory, parallel fleets, the convenience of an agent that explores on its own. Those are real strengths, especially for prototypes and throwaway work. For a complex codebase, I'd usually pick fewer moving parts, because every sidecar is one more thing reading your repository.

## What's missing

Judging by the complaints, a few things don't exist yet in credible form: a local ledger across vendors that reconciles the vendor's meter with your logs; a per-turn view of cache hits; a detector for an agent sitting idle while it polls subagents or builds; and reproducible head-to-head benchmarks of the index tools.

The most credible measurement efforts I saw share a format: a daily pass-rate tracker, an Elo ranking built from real pull requests with its caveats stated (one week, mostly Node and TypeScript backends), and a telemetry experiment per run. Sidecar authors could copy that.

Open source lets you inspect a tool, but nobody has time to inspect all of them. A short test on a throwaway repo is cheap insurance. Self-reported benchmarks are still useful for what the author measured; they only mislead when readers assume the number covers success and cost, not just retrieval. Even read-only monitors cost maintenance and attention, so install the one that answers a question you can't answer today. And expect first-party features to make some of this obsolete soon, which is why anything that depends on a vendor quirk deserves the least trust.
