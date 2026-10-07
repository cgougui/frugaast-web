# "5x", "2-3x", "99% written by the model": Reading AI Coding Productivity Claims Like a Reviewer

Developers keep posting numbers about AI coding speedups, and the comment threads under them work as an informal methods review. The same four objections come up every time.

> My manager asked me last week whether the assistant "actually makes us faster", and all I had was a feeling and a screenshot. A feeling is not an answer, and I knew it while I was saying it.

## The reviewer lens

Imagine you have been asked to referee a paper. The abstract says "5x". You do not read the conclusion first. You jump to the methods section and look for what was measured, on what, against what baseline.

That is the lens for this article. Treat every productivity claim as a submission, and write the referee report. The report has four sections, because experienced developers attack nearly every number on the same four grounds: the denominator, the task, the attribution and the metric.

One caveat first, stated plainly. Almost none of the material behind this piece is a controlled study. It is practitioner self-reports plus critique from readers. There is no randomised trial, no telemetry study, no before-and-after delivery metrics from a team. Everything below is how people argue about numbers, not a collection of data. Where real studies exist, they belong in their own section, read independently, and not attributed to forum threads.

## The claims inventory

Here are the sorts of numbers that circulate, drawn as composites. Each is a type of claim, with a type of speaker.

| The claim | Who tends to say it | What is missing |
|---|---|---|
| "Instead of doing 1x your normal work, you can do 5x while still maintaining quality" | A blogger describing their own routine | Scope, baseline, definition of quality |
| "Probably 2-3x more productive" | An engineer using only autocomplete | A "probably" is not a measurement |
| "99% of the code in this pull request was written by a reasoning model" | A maintainer of an open-source library | Who prompted, applied, tested and committed? |
| "250 hours" for a significant systems project | A developer logging their own time | The counterfactual: how long by hand? |
| "$0.18 per completed task versus $3.26, almost 20 times" | A hobbyist comparing model tiers | The task was "a well-formed question that already contains half the answer" |
| "75% reduction in tokens" from terse prompting | A tool author | Fewer tokens is not fewer corrections |
| "$0.46 per task" versus "$0.05" | A benchmark host | Cost per task is not time per task |

Look at what the table lacks. None of these is a measurement of calendar time to ship, defect rates or maintenance cost on a team.

One reader named the gap with the old Mythical Man-Month argument. For "three months of work in seven days" to be true, product ideation, story-point negotiation, bug fixing, review, deployment waits, testing and QA would all have to shrink, not just the typing.

So four questions. Ask them of any number, including your own.

## Question one: what is the denominator?

*Referee comment: is this a speedup or an expansion?*

A speedup means the scope was fixed and the time shrank. An expansion means the time stayed about the same and the output grew. They are different claims, and they deserve different numbers.

One developer made this distinction cleanly. They now build custom tooling, try several API designs, and reach 100% test coverage, so they "deliver more quickly, but can also deliver more overall". That is an honest report, and it is not "5x". It is "more". Another engineer who modernised an old driver observed that demand for the work "was nowhere close to being fully supplied", which reads the same way: output grew into available demand.

And then the part that is often left out of the denominator: "the micromanagement tax is heavy", with most of the day spent babysitting agents. Supervision time is working time. If it is not in the denominator, the multiplier is inflated.

**What to ask:** was the task fixed and the clock shorter, or did the output grow? Report them with different numbers.

## Question two: what kind of task was it?

*Referee comment: which sample was this drawn from?*

Speedups cluster on a recognisable task shape.

- **Translation with a reference.** A modernisation project for a very old kernel driver succeeded because, as one reader put it, "AI works better when it has an example. In this case, all the code needed for the driver to work was already there... It just had to update the code to reflect modern kernel development practices." Another noted that upgrades and "collateral evolution" are strong use cases because "no logic needs to change". A third pointed out there were "no tests whatsoever", so the result stays out of tree.
- **The 99% claim, examined.** A reader who followed the link found the task was converting one SIMD instruction set into another, with an example function placed in the prompt. A translation with a reference implementation. That is not feature work.
- **Greenfield demos.** Emulators and clone games are impressive, and one reader said it plainly: "greenfield, isolated, single-purpose projects are many orders of magnitude easier for LLMs... compared to plugging into" an existing codebase. Even the author of one such comparison conceded the result "is closer to recall than to engineering".
- **Verifiable domains.** A research system that evolves algorithms reported large kernel speedups and rediscovering state-of-the-art results in most cases. Readers noted it works "only in domains where validation can be scaled up". A machine-checkable score is a luxury ordinary application work does not have.

There is a counter-argument: that task shape is really a **skill** effect. The same tool makes a strong engineer faster and a weak one produce more bad code faster. This is argued, not measured.

**What to ask:** label every claim with its task shape: translation with reference, greenfield, bug fix in a mature repo, design. A 5x on the first says nothing about the last.

## Question three: who supplied the leverage?

*Referee comment: what does "written by" mean here?*

"99% written by a model" was qualified within minutes by readers: "There are still humans in the loop to do the prompt, apply the patch, verify, write tests, and commit."

Attribution is a spectrum, and the claim should say where on it.

The best artifact in this whole area is a public repository from a company that published its prompts alongside the code for an authentication library. The README said the model's output was "thoroughly reviewed" by engineers. Readers read the commit history and saw "a fair bit of manual intervention to fix bugs and remove unused code" and "a lot of handholding even in pretty basic situations". They also said "they probably saved a lot of time". Both can be true. And one reader asked the deepest question: could a non-expert write those prompts at all?

This is the right shape for evidence. Prompts and commits are public, so the claim can be audited.

The opposite sample is a public stream of agent-authored pull requests, each with failing tests, in a large open-source runtime. Readers drew conclusions from a visible sample. Nobody counted. The objection that the process is "stochastic... roll the dice until the answer pops up" is really about cost per **accepted** change, which a stream of open pull requests cannot show.

**What to ask:** for the commit history, the prompts and the human edits. Restate "written by the model" as "accepted with N human interventions".

## What a measured project looks like

*Referee comment: n equals one, no baseline, but it is the best available.*

A developer built a significant systems tool over three months and logged 250 hours. A reader said they believed it "because of the amount of elbow grease", and called it "a good model for what a significant AI-assisted systems programming project looks like".

What it gives you: recorded author time and calendar time for something wanted for eight years. What it does not: a counterfactual, and the author's own review of the codebase at one point is part of the story. Others report a similar experience: "astonishingly good at making awful slop which somehow works. My job has shifted from code writer to quality control officer."

A third remark deserves caution. One developer said time "wasted" on vibe coding "felt less painful" than time wasted on manual rabbit holes. That is a statement about **felt effort**, not elapsed time. More on that below.

Even the best single-project account is n=1 with no baseline. Use it to find which phases changed, not to estimate a multiplier.

## Question four: what metric?

*Referee comment: the instrument decides the result.*

Comparisons of models and agents are where the metric problem is loudest.

In a series of posts comparing a frontier model with a local 27-billion-parameter model on game-clone prompts, the author was open about the limits: one-shot first output, a hand-written local agent, and a local side that needed "two or three follow up rounds to get the polish right". Two readers offered better metrics.

- **Intervention rate.** "Intervention rate on the same repo tasks may be more useful than a simple pass/fail result", along with edit boundaries, rollback, test-loop behaviour, context compaction, and recovery from bad tool calls.
- **Quality per time box.** Not quality per token. A local model at around 100 tokens per second gets two refinement rounds in the wall-clock time a rate-capped cloud model needs for one. That is a testable claim: measure quality after a fixed time budget, not after one shot.

"Cost per task" has its own trap. A poster reported $0.18 per task for a mid-tier model against $3.26 for a top-tier one and no longer exhausting usage limits, but admitted the metric uses "a well-formed question that already contains half the answer". Another model at roughly $0.46 per task made one tester wait fifteen minutes and tens of thousands of tokens of reasoning on a small test. Cost and time per task can point in opposite directions. (Routing economics are a topic of their own; this section is only about the metric.)

Then the source. Skepticism about vendors is built into the vocabulary: "a company that hosts open models is telling us how good open models are". And a useful rule for any new release: wait a couple of weeks, because many models "suffer from hidden bugs when connected to an inference backend or bad configs".

**What to ask:** report interventions, wall-clock time to an accepted result, and cost to that result, on a task from your own repo.

## Felt productivity versus observed outcomes

*Referee comment: enthusiasm is not an endpoint.*

Subjective reports run in opposite directions. One developer described a coding agent as something like an accessibility tool. In the same thread, another described getting an A on a test while knowing you cheated, and learning nothing. One developer said they felt "not productive enough" although they understood their codebase well. Replies called it a phase; the fix was going back to reading code. It shows that feeling and output can diverge in **either** direction.

And there are outcome-level arguments with no measurement at all. "If coding has been solved, why does software keep getting worse?" The top replies blame incentives and ownership and say the decline predates AI; one blames "poorly checked, AI-written code". Nobody quantified anything.

Do not infer productivity from enthusiasm, usage logs, or the quality trend of software. None of them measures output per unit of effort.

## How to run your own measurement

A minimal team experiment, built from the objections above:

1. Pick real tasks from your own repository, ideally ten to twenty.
2. Label each with its shape: translation, greenfield, bug fix in a mature module, design.
3. Record time to first plan, time to accepted merge, and the number of human corrections.
4. Record test additions, and follow-up bug tickets opened within N weeks.
5. Compare **by shape**, never as one overall average.
6. Publish prompts and commits internally, so the work can be audited later.

A one-line-per-task log is enough:

```csv
task,shape,tool_model,min_to_first_plan,min_to_accepted,interventions,cost_usd
rename-retry-config,translation,model-a,4,22,1,0.31
fix-flaky-invoice-test,bugfix-mature,model-a,11,95,5,1.80
new-export-endpoint,greenfield,model-b,6,40,2,0.74
```

This is a suggestion assembled from the readers' criticisms, not something the discussions reported.

## Why the method matters to the workflow

This kind of measurement is much easier in some workflows than in others.

If an agent roams a repository, reads whatever it likes, and edits files freely, the "interventions" column is blurry, and cost per task is a guess. In a deterministic workflow, the developer picks the exact files that enter the prompt, the model returns search/replace blocks, and the change is committed as a normal Git diff. Each task has a clear boundary, a clean diff to count corrections against, and a precise API cost from your own key. The log above nearly fills itself.

Agents shine for prototypes and greenfield exploration, and that is fine. But claims about mature codebases need evidence that mature codebases can supply, and scoped, diff-based work produces it as a by-product.

## FAQ

**Surely a rough "2x" is good enough for planning?**
For a rough plan, maybe, but only if you know which task shapes it came from. A multiplier measured on translation tasks will mislead a roadmap full of design work.

**Isn't logging every task more overhead than the productivity gain?**
It is, if done forever; a few weeks of sampling on real tasks is enough to find which shapes benefit. The log pays for itself the first time it stops a bad purchasing decision.

**Why trust the readers' critiques more than the original authors?**
Do not trust either blindly. Critiques are useful because they point to what is checkable, such as the commit history or the prompt in the example.

**Doesn't "it feels faster" matter if developers are happier?**
Happiness is a legitimate outcome, and it should be reported as such. It just should not be sold as throughput.

## Key Takeaways

- Every productivity number should be read against four questions: denominator, task shape, attribution and metric.
- Prefer intervention rate, time to an accepted result and cost to that result, measured on tasks from your own repository.
- Enthusiasm, usage logs and software quality trends are not measurements of productivity.

*A multiplier without a baseline is just a mood with a decimal point.*
