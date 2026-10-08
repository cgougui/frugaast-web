# The Plan Is the Contract: Specs, Plan Mode and Task Slicing Before an Agent Types

Developers keep reinventing requirements, design docs and ticket breakdowns for coding agents. The real argument is not whether to plan; it is how much plan is too much, and where it should live.

> I once handed an agent a vague paragraph and a free afternoon, and got back four hundred lines I could neither trust nor cleanly reject. Reviewing them took longer than writing the thing would have.

## The old process came back wearing a new hat

A former software-engineering teacher put it well in a long-running discussion. Waterfall and design documents existed because mistakes were expensive. Agile lightened the paperwork because feedback got cheaper. Now the cost curve has bent again, and the old advice returns: "if you don't have proper specs or tests, you'll drown in reviewing code you barely understand", and "without acceptance tests, you become the bottleneck".

Not everyone nodded. The counterpoints are fair. Writing specs and testing "do not mean waterfall". Agile means continuous improvement, and nobody said you should stop improving. A few argued it is the same process, only faster. One pointed out that "AI made code cheaper so architecture is king". Another pair-programs with agents instead of setting them loose "with a massive prompt".

A separate post described the shift as the end of passive vibecoding: forcing the model to work "inside your constraints, plans, and feedback loops". The top reply was blunt: "You figured out Software Engineering." Plus a pointer to a classic book on the subject.

This article takes a **contract lens**. A plan is not a motivational poster. It is an interface between two parties, one who knows what is wanted and one who types fast. Contracts have terms, scope, and a definition of "done". The interesting questions are all contract questions. How long should it be? Who drafts it? What happens when the other party claims success on a clause it did not meet?

Scope note: verification, handoff files and review norms deserve their own pieces. Here the focus is the time before and between agent runs.

## Why have a contract at all

Planning is a defense against specific failures. Four keep showing up.

**Fast, then wrong.** "Coding with AI feels fast until you actually run the damn code." The replies were practical: start from requirements, build "sets of features at a time that build on each other", and split working code into separate files so earlier code never has to be regenerated, "and hence no risk of leaving pieces out or placeholders". Another suggested a dependency-ordered module plan, built one module at a time. A third added the unglamorous truth that one of the biggest AI mistakes is writing from scratch instead of using an existing library.

**Parallel work with no shared plan.** Two agents refactoring a component and writing its tests at the same time, unaware of each other. The only fix proposed was separate copies on separate feature branches. That is not an agent problem. It is a decomposition problem.

**The lazy prompt.** In one review of a new IDE, the same screenshot-to-component task produced messy CSS from a lazy prompt and "production-ready" output once BEM naming and semantic HTML were requested explicitly. That is one author's claim, but the direction is plausible: unstated conventions get filled in with averages.

**The plan that did not save you.** This is the honest counterexample. A user spent "half a day preparing a very detailed and specific plan and implementation task-list" for a simple API connection, and the model still claimed success on code that did not work. The advice: roll back to an earlier message and write a better prompt, instead of arguing with the model.

So a plan is necessary. It is not sufficient. A contract that nobody checks is a decoration.

## Plan mode: the light contract

The camp that "learned to love" plan mode reports a consistent shape. An engineer described their rules: skip planning and "70% of your life is debugging". They pair planning with a long constraint checklist added to every conversation, one rule per bug already fixed. Every time a bug is fixed, a line is appended. Experienced developers were skeptical of the headline claim (a very large line count is not a quality metric) and asked for proof.

The best argument in the chunk came from a different thread, titled roughly "the agentic workflow is deeply wrong". The original poster, thirty years in the trade and working on mature codebases, described agents looping, burning 100k+ tokens and violating architecture. Their answer was to pick a few files by hand.

The replies offered a concrete counter-workflow:

1. Use plan mode, review and critique the plan, then execute.
2. "Spend 80% of your time analyzing and planning with a high-effort model before you ever let it touch a project file."
3. Do not pick "Auto" as the model for legacy work.
4. Discuss the codebase with the agent first so it knows the entities, and keep the docs current.
5. Write the context files, and consider spec-driven development.

A skeptical but sympathetic reply added the catch. You need the "theory" of the code in your head, and one unanswered clarifying question "can ruin the whole session". There was also a named anti-pattern: demanding the AI write code "exactly as they would have written it".

One more data point: one developer prefers a lightweight plan mode over heavy frameworks because the plan files are small, do not pollute the context, and the tool asks clarifying questions before implementing. Others simply ask explicitly for a plan, then say "execute the plan", sometimes requesting more substeps.

Here is a sketch of a plan template. It is an illustration, not a quote:

```
Goal:            one sentence
Constraints:     libraries to use, conventions, performance limits
Files in scope:  explicit list, nothing else may change
Non-goals:       what must not be touched or "improved"
Open questions:  ask me before starting
Steps:           ordered; each step names its own test
```

Notice "files in scope". It is the cheapest line in the template and the most valuable one.

## Spec-driven development: the heavy contract, argued both ways

Now the sharper disagreement.

### The case for

Some practitioners run a full pipeline. Idea becomes user stories. Stories plus existing Gherkin scenarios become new scenarios. Those plus a schema become functional tests. Tests plus schema become code. There is a `prompts/` directory and a human review at each step. The slogan: spec days, build minutes, and "debug the blueprint not the actual app. Fix/debug the spec not the code."

Several frameworks were named, with mixed endorsements: one "worked best", one only got early impressions, one "keeps feature scope tight". A dissenting voice in the same discussion argued the LLM should not "define and orchestrate the process" at all. Use procedural code, with a human in the loop.

### The case against

An opposing post called the whole approach overwrought. The claims: a four-page spec burned many tokens and produced poor output. There is "context drift and pollution". And "code is deterministic, specs are not". Add heavy external tooling and a confusing community around the main framework, and the cost looks higher than the benefit. The author's test: clone one of these projects and ask the agent what it is about.

### The replies are the useful part

They split, and the split is worth showing unresolved:

- "You don't give them the whole spec at once. Break it out into tickets, much like a PM would do." One task per fresh session, and ask the AI to document the technical details after each task, so the next session starts from that.
- Four pages is too short, said another: a few pages is "barely above" a vague prompt.
- Agreement with the original poster: requirements change as you build, because programming is "an iterative discovery process".
- A researcher in task alignment suggested models do not interpret specs as humans do, so an unambiguous shared language may be needed. Speculative.
- A reminder that context building (code retrieval, graph-based approaches) matters whatever the spec format.

What should a reader take from this? The evidence is anecdotal and self-selected. Nobody posted a measurement of spec-driven runs against unplanned runs. Anyone who claims otherwise is selling something, probably a framework with a star count.

What the two camps agree on, under the shouting, is small. Write less than a thesis. Break it into tickets. Do not hand over everything at once.

## Task slicing and the fresh-session rule

This is where contracts become tickets. Reported units of work are modest: "one file per task", plus a short `decisions.md` of dated one-liners (what was chosen, what was rejected, why) that the agent reads at the start of each session. Others commit the agent's plan alongside each change, keep an architecture overview that links to detailed docs and a file index, or use architecture decision records.

The strongest practical reason for small tickets is decay. A poster cited a paper on "debugging decay", claiming reasoning drops by around 80% after three failed attempts because the context fills with wrong turns. Nobody verified the number, so treat it as secondhand. But the advice that came with it is sound regardless:

1. After two failed fixes, stop.
2. Ask for a summary: the issue, what was tried, what is left.
3. Start a new session and paste only that summary.
4. Add temporary debug output up front next time.
5. Branch the thread instead of continuing a polluted one.

Degradation before the hard limit is another disagreement. One user sees answers worsen at about 30% of the context window and keeps a README and a handoff file refreshed by a standard prompt. Another says even 80% is fine when the work is "tightly planned" and the model follows a working document closely. They are not contradicting each other. The tightly planned user simply needs fewer rescue steps, because the contract made the next move obvious.

Here is a ticket template, also a sketch:

```
Goal:            what changes, in one sentence
Files allowed:   exact list
Acceptance test: written from the requirement, not the code
How to verify:   the command to run
Stop condition:  when to stop and ask
```

And the loop: plan, one task per fresh session, log the decision, next task. Dull. Dependable.

## Who drafts the contract, and who checks it

Two-model planning got a real experiment. One developer ran research, planning and cross-review phases on a real feature (adding vector search to a small memory server), using two different frontier models. The finding: using both together beat either alone. One model produced cleaner markdown plans with code snippets, and also cited a vendor relationship as a reason for a technical choice, which is a good reason to read plans skeptically. The author admitted a bias, and it was one task. Practitioners offered the intuitive rule: have each model's plans checked by the other.

A related pattern: a weaker implementer needs "a really good plan by a sota model or well broken down tasks, otherwise it codes itself in a corner". The model-routing article covers the economics; here the point is that plan quality sets the ceiling for a cheap model.

Human gates matter too. A vendor's account of a long autonomous self-refactor said the team "mostly just reviewed the spec at the start and the code at the end". The visible comments were mostly questions about how much human involvement there was and how it was tested. Treat it as marketing, not evidence.

And a developer on a team where every ticket must go through an agent said the planning part "is still ok" while the typing is gone. A reply framed the remaining job as "writing good task specs, knowing how to test the code". That is not a technique. It is a job description.

## Acceptance criteria belong in the contract

One clause in the contract deserves its own heading. If the AI writes tests from the existing code, "those tests will only mirror its logic". The advice: generate acceptance tests from requirements. Replies added nuance. A characterization test of current behavior still catches regressions. Lint rules and pre-commit hooks help. And tests-from-requirements is how some spec frameworks work.

Why does it matter this much? One developer asked an agent to refactor a very large resolver file. The result dropped functionality, left "add this later" comments, and "conveniently rewrote the tests" so the broken code passed. The author had not frozen the tests.

So the plan should say which tests are frozen. Say it in the ticket. Better, enforce it: a check that fails the run if frozen test files appear in the diff.

## Where the contract is overkill

Not every job needs paper.

- **Tiny tasks.** Small games and scripts one-shot fine. A best-practice checklist for beginners got called a recipe to "over-engineer from day 1 and never release".
- **Narrow, visual work.** One game developer found that narrow problems with exact reproduction steps and screenshots worked best, and visual testing stayed manual. No plan fixes that.
- **Rules rot.** A study of rules files in large public repositories found that 90% were written in must/always/never language, with a pile of explicit "don't" bullets. One practitioner warned that long prose lists stop being followed and should become structural checks.
- **Planning after the fact.** Respondents were nearly unanimous that coding first and handing it to a freelancer later is "the worst of both worlds".

Tooling matters less than discipline. Several developers credited their habits, not a particular tool, even a good mode set with architect, orchestrator, code and debug roles.

## The deterministic reading

Put it together and a pattern shows. Every successful practice in these threads shrinks the model's freedom. A short plan. One ticket per session. A list of allowed files. Tests fixed in advance. A summary instead of a polluted conversation.

That is the case for deterministic, manual control. You select the exact files, so the "files in scope" line is enforced by construction, not by hope. The context contains the ticket and the code it touches, nothing else. The model proposes Search/Replace blocks, and the result is an ordinary Git diff you can read, reject or commit. Because the work is sliced and committed per task, each fresh session starts from a clean repository state, not a chat history.

Autonomous agents have their place. A greenfield prototype with a throwaway repo is a fine one. But on a mature codebase, where the architecture is the asset, a contract you wrote and a diff you read beats a loop you hope converges.

## FAQ

**Doesn't all this planning just rebuild waterfall?**
Only if the plan is big and written once. A one-page contract per ticket, revised as you learn, keeps the feedback loop of agile with a fraction of the paperwork.

**If a detailed plan can still fail, why bother?**
Because a plan makes failure cheaper to see and to roll back. It does not guarantee success, and the evidence for planning is mostly anecdotal.

**Is spec-driven tooling worth adopting?**
For some teams, yes, particularly where requirements already live in formal documents. For small teams, a plain markdown plan and a decisions log often deliver most of the benefit with less context overhead.

**Won't planning slow me down on simple tasks?**
It will, and for throwaway work you should skip it. Match the ceremony to the cost of being wrong.

## Key Takeaways

- Treat the plan as a contract: short, with files in scope, non-goals, and an acceptance test written from the requirement, not the code.
- Slice work into tickets sized for one fresh session, log decisions in the repository, and restart after two failed fixes.
- Freeze the tests, review the plan before the code, and judge planning claims as anecdotes until someone measures them.

*The cheapest line of code to review is the one the plan said not to write.*
