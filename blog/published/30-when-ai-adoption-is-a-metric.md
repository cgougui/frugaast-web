# When "Use AI" Becomes a KPI: What Mandates and Output Metrics Do to Engineering Teams

Once a company measures AI use instead of AI results, people optimise for the measure. Throughput goes up on the dashboard, review and rework quietly absorb it, and the pressure lands on the people who were already the bottleneck.

> I once sat through a quarterly review where my "AI usage" was a line item, and my reverted changes were not. Nobody asked what shipped; they asked how often I had pressed accept.

## The ledger lens

Every metric is an entry in a ledger. Something gets booked as income, something else gets booked as cost, and the interesting question is always which entries never make it onto the page.

That is the lens for this article. Not "is AI good?" (it is, for some things), but "what does the ledger of a mandated rollout actually record?" Experienced developers who live under these policies keep describing the same bookkeeping error. The credit side is full: lines, pull requests, points, acceptance rates. The debit side is empty: review hours, rework, incidents, the colleague who no longer understands the module.

An accountant would call that cooking the books. A manager would call it a productivity gain. Both are looking at the same spreadsheet.

## Three kinds of mandate, one pattern

Mandates run from soft to hard. The soft one answers "is AI use required?" with "no, but yes", while the director is a "massive advocate for vibe code everything" and the fastest adopters get the interesting projects. The tool mandate announces that a small agency is "fully embracing" one editor and agent from January, with a forecast of halved development cost. The hard one reads "mandated to use AI and not manually code", or tells engineering managers to submit pull requests "to lead AI adoption by example".

Experienced developers rarely argue that the tools are useless. They argue about something narrower: what happens when the use of the tool, rather than its result, is what gets rewarded.

## What is actually being counted

Here is the catalog of metrics that engineers in the trenches describe, with the failure each one tends to produce. Treat these as reports from individual workplaces, not as industry statistics. They skew negative, because people who are happy with their setup do not write long posts about it.

| What is counted | What it rewards | The failure reported |
|---|---|---|
| AI usage and acceptance rate | Pressing accept without editing | A senior engineer at a very large enterprise says usage is "heavily tracked and reported in your year end review", and that accepting responses "without modifying" is what counts as "AI native" |
| Story points as per-person targets | Inflating estimates | Targets scaled by seniority (x, 1.5x, 2x), justified by the tool already being paid for. Points were meant for capacity planning; as quotas they breed inflation, burnout and less teamwork |
| Lines of code | Volume | A manager who expects "5000 lines per day" and asks the developer to commit "what they have so far" |
| Percent of code written by AI | Line-level autocomplete | If tab completion "of any degree" counts, the number says more about the editor than the work |
| "Use AI for everything" | Using it where a script would do | A 30-minute script for CSV parsing or a regression check gets replaced by a large model bill that nobody feels responsible for |

The warning signs in that first row travel together. Tracking lines of code, counting merged pull requests and rank-ordering engineers by how many they merged are, in the words of one veteran, signs of a bad company. Add AI acceptance rate and the list gets a new member, not a new idea.

The replies to the "5000 lines" story split between quit, escalate, and ask for evidence. Nobody agrees on the fix. They all agree on the number being absurd.

The pattern across the whole table: every one of these metrics measures activity at the **generation** step. That is precisely the step where AI is cheap. Counting what a machine produces at nearly zero marginal cost is like measuring a bakery by how much flour it opens.

## Speed expectations get rebased to the best-case demo

The second ledger entry is time. Once a mandate exists, timelines are quietly rewritten around the best demo anyone has seen.

An engineer reports that "a few months" of planned work is now expected from one developer in under a week. A CEO, impatient with a five-person team that is "taking too long", spins up a parallel deployment of their own using a coding agent. Nobody was asked whether the demo resembled the project.

There is a confound worth naming. In a study of several hundred developers across a handful of organisations that was discussed in these threads, the poster summarised the result as moderate adoption, a gain in the number of pull requests, lower code quality and more pressure to deliver. (The exact figures were not given in the thread, so check the source before repeating them.) One experienced reader made a sharp observation: if you pressure engineers to go faster, "they will go faster", with or without AI. Some of the speedup in any rollout may simply be pressure.

That is hard to disentangle, and honest teams should say so.

And to be fair to the other side: some practitioners in the same threads report real wins. A week of background-service work done in a couple of hours from a clear spec. A throwaway script that would have taken a month. These are not lies. But those same people add the caveat that the gain does not carry across the whole system.

## Why the numbers do not show up: the bottleneck argument

If generation got that much faster, delivery should have, too. Mostly it did not. Why?

Because of a rule older than any language model. Speeding up a step that is not the bottleneck does not raise throughput. This is Goldratt's constraint theory, and its cousin Amdahl's law: if a step is 20% of the process, even making it infinitely fast gives you a 25% improvement at best.

Engineers in these discussions list the real constraints as requirements, verification and validation. Generation was never first on that list.

The reader disagreement is useful here, so it is worth showing.

- One camp says writing code often **is** the bottleneck: there are design flaws everyone knew how to fix and nobody had time to rewrite.
- Another says faster implementation should free time for design and review. "10 days to 3, now 5 for design, 2 for review", with quality rising as a result.
- A third notes that extra capacity at a non-bottleneck is not useless; it adds protective capacity, a buffer.

All three can be right on different teams. The disagreement is about whether the saved time is reinvested or immediately spent on a bigger queue.

### A replacement metric: "diff exists to safe merge"

One practitioner proposed what may be the best single number in the discussion: the time from "diff exists" to "safe merge". Not lines. Not pull requests opened. The span includes review cycles, rework, test failures, on-call follow-up, and whether someone other than the author can explain the change.

You can sketch it with data you already have. A spreadsheet or a query is enough:

1. Take every merged pull request in the period.
2. Record time from opened to merged, and the number of review rounds.
3. Flag any revert within, say, 14 days.
4. Count follow-up fix pull requests that touch the same files within the same window.
5. Sample a few and ask: can a reviewer who is not the author explain this change out loud?

Run it before and after the mandate. If the "AI usage" line went up and this number did not move, the ledger is telling you something.

When engineers asked "by what real metrics has AI improved software?", most replies were some version of "none that I can see". A minority say gains exist but are uneven: good for boilerplate, scaffolding and unfamiliar code. And a few note that long-term data simply does not exist yet. That last point is the honest one.

## Where the pressure lands: reviewers, juniors and the people who care

Now to the debit side nobody booked.

Reviewers absorb the throughput. Reports are painfully similar: a 5,000-line pull request, and a reviewer told that taking a reasonable amount of time is "slowing the team down". A +2000/-700 change, where management is "harping on velocity" if review takes more than ten minutes. A new project described as "99% AI generated" whose enormous pull requests get approved by someone who admits they do not understand them.

The norms belong in another article. The point here is that the mandate makes them unenforceable: the reviewer ends up "essentially doing the ticket".

### Incentives change individuals

People are not stupid. They read the scoreboard.

- **Rewarded versus penalised.** "These people get rewarded by C suite for using AI." A developer who is reluctant says their last performance review "wasn't bright", and that teams race each other to adopt.
- **Malicious compliance and retreat.** One engineer will comply "until it blows up" in the executives' faces. Others: "approve everything, collect paycheck".
- **Deliberate self-limiting.** A developer who does not want to raise their own velocity, because it means more expectations for the whole team and "nothing in return". The reply was dry: salaries did not rise 500% when output rose 5x.

Counter-reports exist: teams that committed shared skills and context files into the repository talked **more** about workflow. "AI amplifies whatever culture already exists" is probably the most defensible sentence in the debate.

## Mandates that leak outside engineering

The bookkeeping error gets worse once non-engineers get the same tools and the same scoreboard. One manager's AI-written change arrived with tests that "boil down to `assert 3 == 3`"; advice ranged from reviewing it like any other pull request (and naming the tautology) to going over the manager's head. In another company, a tool let sales and operations build apps with access to production data, with developers and security "overruled", and replies ran from "send a CYA email" to "you break it, you fix it" to "quit".

The sharpest suggestion on engineering managers: if they must lead adoption, let them own review standards and tooling decisions rather than add to the pull request pile. And a "paved path" (recommend a small set of tools, enforce what matters in CI and review) beats a blanket product mandate; regulated companies have legitimate security reasons for stricter sets.

## Designs that people say would work

Label these clearly as suggestions, not results.

1. **Keep ownership explicit.** "When you present this as your work it IS your work." "You PR it, you own it." For large changes, a walk-through in person.
2. **Constrain the unit of work, not the tool.** A pull request size cap, framed as "management has requested PRs that can be reviewed faster". Small prompts per task. Review by commit.
3. **Pilot instead of mandate.** One proposal: all subscriptions on for a quarter, with quotas, a bi-weekly 30-minute sharing session, and success criteria defined **before** picking a vendor.
4. **Measure outcomes with a lag.** Feature velocity "would have to be long term", so that bugs from a rushed process have time to show up.
5. **Make the shortcut's cost visible.** Nothing changes until there are consequences. And since a human will take the blame for the outage, reviewers who care are protecting themselves.

The cynical reply: this is a leadership problem you cannot fix from below, so send a written risk note once, then move on or leave. For low-stakes work such as agency websites, the mandate may even be economically rational.

## The deterministic answer to a measurement problem

There is a design philosophy hiding in all of this, and it is the opposite of an adoption quota.

Do not measure whether a tool was used. Measure whether a reviewable change landed safely. That implies a workflow where the human decides what the model sees, selects the exact files that belong in the prompt, and receives the result as search/replace blocks that become an ordinary Git diff. Nothing is accepted by default, because there is no "accept all" button hiding in the loop; every change arrives in the same format the reviewer already knows how to read.

An agentless, bring-your-own-key setup has a side benefit for the ledger: every call has a price, and the price is visible. The cost of a thrown-away branch is no longer an anecdote. It is a line item.

Autonomous agents have their place. For a greenfield prototype, an internal tool, or a low-stakes agency site, the speed is real and the review burden is small. But in a mature codebase, where the bottleneck is verification, the better trade is precision: small scoped changes, standard diffs, and a human who can say what the change does.

## A practical checklist

- **Managers:** replace "AI usage" and "acceptance rate" with a lagged outcomes set; cap pull request size; no per-person point targets; separate "try the tool" from "must use the tool"; give reviewers explicit time.
- **Engineers under a mandate:** document the risk once, in writing; keep pull requests small and self-reviewed; track your own diff-to-merge and rework numbers so a velocity question gets a data answer.

The repeated observation: the mandate is rarely the problem on its own. What hurts is a mandate paired with a throughput measure and no extra review capacity.

## FAQ

**Isn't measuring AI usage a reasonable way to make sure expensive licences are not wasted?**
Usage tracking is fine as a licensing and cost signal, as long as it never feeds performance reviews. The moment it does, it stops measuring adoption and starts measuring compliance.

**If review is the bottleneck, why not just have the AI review the AI's code?**
A second model can catch real mistakes and is worth using, but it shares blind spots with the first and cannot take responsibility. Someone who can explain the change still has to sign it.

**Won't teams that refuse mandates fall behind?**
Possibly, on low-stakes work where speed is the whole game. For systems where outages cost money, falling behind on typing speed matters far less than falling behind on understanding.

**Is "diff exists to safe merge" not just another vanity metric?**
Any metric can be gamed, but this one is expensive to fake because it includes reverts, follow-up fixes and incident load, all of which arrive later and are hard to hide.

## Key Takeaways

- Metrics that count generation (usage, acceptance, lines, points) reward the cheap step and hide the costly one.
- The bill for faster output arrives as review load, rework and eroded trust, so measure from "diff exists" to "safe merge" with a lag.
- Mandate the guardrails (small diffs, explicit ownership, visible costs), not the tool.

*A team that is rewarded for what the machine writes will eventually forget to ask what the machine meant.*
