# Comprehension Debt: Who Holds the Theory of Your Code When an Agent Writes It?

Code is now cheap to produce, but the shared understanding of why it looks the way it does is not. That gap has a name, comprehension debt, and it is the scarce resource that agent-heavy teams are quietly spending down.

This article follows one composite team through six months of agent-assisted work, using the lens of knowledge ownership: at each stage, who actually holds the theory of the program, and where does it live?

> I merged a feature last spring that I could not explain two weeks later, and when a teammate asked "why is it shaped like this?" the honest answer was "the model chose it." I had shipped code that nobody on my team understood, myself included.

## Month zero: the demo that looked like a product

Imagine a team maintaining a payments monorepo. A developer spends a weekend with an agent and produces a working prototype of a reconciliation service. It looks great. Everyone reacts the way people react to a cloned-an-app-in-a-weekend post: with a mix of awe and a nagging question. Who reviewed the hundreds of generated files?

The contrast is familiar. A popular reaction to cheap generated code was "images are cheap now, art isn't." Engineers with long memories add a sharper point from Brooks: everyone is producing 0-to-1 versions in minutes or hours, yet companies and teams are not shipping any faster. Accidental complexity got cheaper. Essential complexity did not move.

Be fair to the tools, though. One developer wrapped a small C++ library in Rust with an assistant and called it "amazing" for understanding the codebase and writing boilerplate. But on lifetime management they had to babysit it, and the model spent 10 to 15 seconds on a change that takes two seconds by hand. Code is cheap in some regions of the problem and expensive in others.

The term some engineers now use for the expensive region is comprehension debt: code that exists, works, and is understood by nobody.

## What Naur actually said

A short piece of background, general knowledge and not from any discussion. In 1985 Peter Naur argued that the real asset of a program is not its source text but the theory held in its developers' heads: why the design is shaped like this, how it maps onto the world, and how to extend it. The code is a by-product of that theory. Lose the people, and you lose the theory even if every file survives.

Why does this bite now? One engineer put it crisply: a model "can read every line of a codebase and still hallucinate the intent behind a design decision". It has the code but not the theory. "The 'why' was never committed." Their conclusion: context files and architecture decision records matter more, not less.

A caution, though. Another engineer warned that the essay gets used as a hammer. Sometimes it becomes "you can't replace seniors with juniors," sometimes "documentation is useless," and Naur said neither. A third described a practical corollary: do not fight the idioms of the system, because coherence is everything. Predictability is what makes a theory transmittable. And one reader noted that Naur's account is normative rather than descriptive, so take it as a lens and not as a law of physics.

## Month two: the symptoms

By month two, the team's velocity chart looks excellent and the team feels worse. The symptoms are specific.

**Review turns into skimming.** A public live demo of an assistant fixing a long-standing issue became a cautionary tale. The reviewer glanced at about two of ten changes and said "I'd ship this." An engineer who inspected the linked PR found wrong indentation and unrelated changes. Review by glance is not review.

**Untested code is not new, but it got faster.** Engineers pointed out that seniors shipped untested code long before AI, such as a dialog behind a button that was always disabled in the scenario being tested. Others replied that tests "cannot prove" code works, and that mock-heavy proof is barely better than none. Both are true. The point is that nobody knows, and agents made not knowing cheaper.

**Flow disappears.** A developer described prompting as "basically doing code review instead of coding", with the pride gone even on the same early-morning schedule. Waiting on the model "breaks flow the way long compile times used to". The workaround that people reported: write the code yourself and ask narrow, directed questions about one piece, the coworker-you-can-ask mode. Dissent came from those with a clear plan: explaining it to the model takes longer than doing it.

**The pipeline narrows.** If juniors are not hired, where do future seniors come from, the people who learned by debugging production at 3 AM? One engineer was moving toward a technical product-owner role because "the part I liked, solving problems with code, is disappearing".

**The determinism gap.** A natural comparison is that models are compilers for English. The objection is immediate: compilers give deterministic, inspectable output and models do not. FORTRAN abstracted the how. A model tries to abstract the what by guessing your intent, and guesses are where theory goes missing.

For open-source projects the same debt arrives as a policy question. A disclosure trailer such as `Assisted-by:` on commits, and a rule that a named human stays responsible, were adopted by a large compiler project. Engineers asked who volunteers to be the accountability sink, and some called it the bare minimum. Another argument: a maintainer who wanted model output could prompt it themselves with far more context than a drive-by contributor, so the PR adds only review load. A counterpoint said floods of low-quality PRs may be a solvable problem, the way DDoS protection became one.

## Month four: mechanisms people reach for

Now the team goes looking for fixes. The useful ones share a pattern: each externalizes something that used to live only in a head. They sort by what gets externalized.

### 1. Intent stored next to code

A hobbyist tool made the rounds: write pseudocode, sync it into real code on save, and keep the pseudocode as a stored record of intent. The layout is easy to picture: `foo.hz` beside `foo.ts`. Its author was "utterly exhausted" by writing full sentences to a model and reported a "complexity limit" beyond which the agent "confuses itself".

A low-tech cousin from the same discussion: pipe every assistant session through `tee` into a log directory checked into the repo, and make your own commits, not the agent's, with the reasoning in the message. No new tool, just Git.

Others treat architecture decision records and agent-instruction files as "not documentation, but the theory". One person described such a file as "a gold mine of useful tidbits... or completely useless", and said they use it as a teaching aid for newcomers.

Shared "knowledge units" for agents, reviewed by a human before other agents see them, are the fancy version. The caveats are sharp. Poisoning: imagine a stored tip saying the latest package version must be downloaded from some evil dynamic-DNS host. And the real problem is not the lack of a knowledge base, it is "having agents follow them reliably".

### 2. Inspect behavior, not just code

One engineer claimed that watching the queries an agent runs against the database teaches you more about the code than reviewing the code. The setup is simple: point the app at a proxy port, watch the queries, run `EXPLAIN` on the suspicious ones. Caveats: the database's general query log does the same, a proxy adds latency, and a wire-level tap is another option. Boundary observation, whether SQL, HTTP or logs, is a second pair of eyes that does not depend on the author's explanation.

### 3. Re-deriving a map

Tools that turn a repository into a tutorial or a diagram are tempting for an unfamiliar codebase. Reported failures: repositories above the model's token limit (one huge compiler monorepo was reported above 1.4 million tokens), diagrams that never generate, and tutorial text described as "code-written-in-human-language" below the top level. One suggestion was to mine unit tests for usage patterns instead. Another tool replays agent sessions on a 3D map. One reader said terminal lines like "Read file: xyz" are not followable and wanted to see where the model gets its information. Others asked who will spend the time watching.

### 4. Legibility through structure

A project-management scheme for agents breaks work into product requirements, epics and tasks, synced to an issue tracker. Engineers noted that decomposition is the most important design step and that too many tickets interfere. Another approach runs small single-purpose agents like Unix programs, for example `git diff | reviewer`, arguing these are more inspectable than a long-lived session with a huge context. The worry is unintended fan-out cost. A third approach encodes the human's theory as a fitness function: the verifier becomes the specification, which hardware designers have known for decades.

### 5. Policy

Make a human accountable, name them, and require disclosure. Cheap, enforceable and unglamorous.

## Month six: where the mechanisms fail

The team now has pseudocode files, an ADR folder, a SQL tap and a diagram. Does it hold up? Honest answers from the discussions:

| Mechanism | What it captures | Cost | Reported failure |
|---|---|---|---|
| ADRs and agent files | Why | Human writing time | Drift: nothing in view keeps them current |
| Stored pseudocode or prompts | Intent | Double authorship | Same drift, plus a "complexity limit" |
| Session logs in Git | How it was decided | Storage, noise | Nobody reads them |
| SQL or HTTP tap | Behavior | Setup, latency | Shows what, not why |
| Generated maps and tutorials | Structure | Cheap | A summary the reader did not have to build |
| Named human plus trailer | Accountability | Social | "The bare minimum" |

Three problems deserve emphasis.

First, drift. No example in the discussions showed a mechanism that keeps decision records or pseudocode current. That is a gap, not a solved problem.

Second, a generated explanation is not a theory. A reader who did not have to construct the summary does not own it. One engineer observed that you only really understand a system after "a year or two on a large project". No diagram shortcuts that.

Third, the human side is expensive. Everything produces more to read, which one engineer called an asymmetry of effort. And readers increasingly dismiss artifacts that carry the tells of generated text, which undercuts documentation-as-theory when the documentation itself is generated.

There is also an honest split on direction. Some say the answer is writing code by hand and asking narrow questions. Others describe scaling with parallel agents where the human only plans and reviews. Both exist in real teams. The second works best where theory-heavy infrastructure already exists, such as a mature fuzzing harness that makes agent output checkable.

## The work that stays human

An 18-year veteran asked the question that keeps coming back: are you even solving the right problems? The list one engineer posted of what building actually involves is worth keeping: operate, monetize, scale, support, secure, instrument, maintain, extend, verify, observe. None of those is typing.

One more fault line. Some argue that code can serve as a requirements-validation tool and that specs-first helps agents. The rebuttal arrives in four words: "bro just rediscovered Agile". Another camp says formal specs and proofs are the way to externalize theory, with a verification engineer countering that specs take more time than programming and you must still validate that the spec is what you want. Keep both in view.

## The deterministic way to keep the theory in the room

If the scarce resource is human understanding, the sensible architecture is one where understanding is part of the loop, not an afterthought.

That is the argument for agentless, manually scoped assistance. The developer chooses the exact files that go into the prompt, which forces a decision about what matters and keeps the context small enough to reason about. The assistant proposes Search/Replace blocks, not a rewritten tree. The result lands as an ordinary Git diff, so the change is a reviewable object with a human-written commit message that records the why. And since the developer brings their own key, the per-call cost is visible, which keeps "just ask again" from becoming a habit.

None of this makes the model understand the system. It guarantees that a person did, at the moment of the commit, because the workflow does not proceed without them. Autonomous loops are great for a weekend prototype, where nobody needs the theory yet. In a payments monorepo, the theory is the product.

## The comprehension-debt checklist

1. Before merging agent code, can someone explain it without opening the diff? If not, treat it as unreviewed.
2. Keep intent next to code: decision records, stored prompts or pseudocode, and commit messages written by a human. Name an owner for each.
3. Review behavior at a boundary (SQL, HTTP, logs) as well as source.
4. For large teams and open-source work, require disclosure trailers, a named responsible human and a rule on PR size.
5. Protect the junior path: keep some tasks hand-written and decide what juniors learn by doing.
6. Measure what none of the discussions did: time-to-explain, review time per PR, and bugs traced to "nobody knew why".

## FAQ

**Isn't comprehension debt just a fancy name for technical debt?**
Partly. Technical debt is code that is hard to change, while comprehension debt is code that nobody can explain, and the second can exist in a perfectly clean codebase.

**Can't the model just document its own work?**
It can summarize what the code does, but the why was never in the model's context unless a person supplied it. Generated documentation is a start, not a theory.

**Does hand-scoping files not slow me down compared to an agent?**
Often yes, by minutes per task, and for greenfield exploration an agent is the better trade. On a mature codebase those minutes buy a diff you can defend.

**Is there any evidence this debt is measurable?**
Not in anything I have seen. The metrics above are proposals, and anyone claiming precise numbers is guessing.

## Key Takeaways

- Agents produce code without acquiring or transferring the theory behind it, so the cost surfaces later as unreviewable PRs, lost flow and a thinner junior pipeline.
- The mechanisms that help all externalize intent, behavior or accountability, and all of them suffer from drift and human attention cost.
- Workflows that put a human on every diff, with hand-scoped context and written reasons, keep the theory inside the team.

*Code is what remains once the understanding has left the room.*
