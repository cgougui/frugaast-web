"You figured out Software Engineering." That was the top reply to a post announcing the end of passive vibe coding, and it stung because it was true. Hand an agent a vague paragraph and you get back four hundred lines you can neither trust nor cleanly reject.

A former software-engineering teacher put the history well in a long-running discussion. Waterfall and design documents existed because mistakes were expensive. Agile cut the paperwork because feedback got cheaper. Now the cost curve has bent again, and the old advice is back: "if you don't have proper specs or tests, you'll drown in reviewing code you barely understand", and "without acceptance tests, you become the bottleneck".

Not everyone agreed, and the counterpoints were fair. Writing specs and tests "do not mean waterfall". Agile means continuous improvement, and nobody said to stop improving. Some argued it's the same process, just faster. One said "AI made code cheaper so architecture is king". Another pair-programs with agents instead of setting them loose "with a massive prompt".

The post behind that blunt reply had described the new approach as making the model work "inside your constraints, plans, and feedback loops". The reply came with a pointer to a classic book on the subject.

I think of a plan as a contract between two parties: one who knows what's wanted, and one who types fast. Contracts have terms, a scope, and a definition of done. The interesting questions are contract questions. How long should it be? Who drafts it? What happens when the other side claims it met a clause it didn't?

## Why bother with a contract

Planning defends against specific failures, and four keep showing up.

**Fast, then wrong.** "Coding with AI feels fast until you actually run the damn code." The replies were practical: start from requirements, build "sets of features at a time that build on each other", and split working code into separate files so earlier code never has to be regenerated, "and hence no risk of leaving pieces out or placeholders". Another suggested planning modules in dependency order and building them one at a time. A third added an unglamorous truth: one of the biggest AI mistakes is writing something from scratch instead of using an existing library.

**Parallel work with no shared plan.** Two agents refactoring a component and writing its tests at the same time, unaware of each other. The only fix offered was separate copies on separate feature branches. That's not an agent problem. It's a decomposition problem.

**The lazy prompt.** In one review of a new IDE, the same screenshot-to-component task produced messy CSS from a lazy prompt, and "production-ready" output once BEM naming and semantic HTML were explicitly requested. That's one author's claim, but the direction makes sense: conventions you don't state get filled in with averages.

**The plan that didn't save you.** The honest counterexample. A user spent "half a day preparing a very detailed and specific plan and implementation task-list" for a simple API connection, and the model still claimed success on code that didn't work. The advice: roll back to an earlier message and write a better prompt, instead of arguing with the model.

So a plan is necessary, but not enough. A contract nobody checks is decoration.

## Plan mode: the light contract

People who "learned to love" plan mode describe a consistent approach. One engineer's rule: skip planning and "70% of your life is debugging". They pair planning with a long constraint checklist added to every conversation, one rule per bug already fixed. Every fixed bug adds a line. Others were skeptical of their headline claim (a huge line count isn't a quality metric) and asked for proof.

The best argument came from a different thread, titled roughly "the agentic workflow is deeply wrong". The poster, thirty years in the trade and working on mature codebases, described agents looping, burning 100k+ tokens and violating the architecture. Their answer was to pick a few files by hand.

The replies offered a concrete alternative:

1. Use plan mode, review and critique the plan, then execute.
2. "Spend 80% of your time analyzing and planning with a high-effort model before you ever let it touch a project file."
3. Don't pick "Auto" as the model for legacy work.
4. Discuss the codebase with the agent first so it knows the entities, and keep the docs current.
5. Write the context files, and consider spec-driven development.

A skeptical but sympathetic reply added the catch. You need the "theory" of the code in your own head, and one unanswered clarifying question "can ruin the whole session". There was also a named anti-pattern: demanding the AI write code "exactly as they would have written it".

One developer prefers a lightweight plan mode over heavy frameworks because the plan files are small, don't pollute the context, and the tool asks clarifying questions before implementing. Others just ask for a plan, then say "execute the plan", sometimes asking for more substeps.

A plan template (my illustration):

```
Goal:            one sentence
Constraints:     libraries to use, conventions, performance limits
Files in scope:  explicit list, nothing else may change
Non-goals:       what must not be touched or "improved"
Open questions:  ask me before starting
Steps:           ordered; each step names its own test
```

"Files in scope" is the cheapest line in the template and the most valuable.

## Spec-driven development: the heavy contract

Here the disagreement gets sharper.

### For

Some practitioners run a full pipeline. An idea becomes user stories. Stories plus existing Gherkin scenarios become new scenarios. Those plus a schema become functional tests. Tests plus the schema become code. There's a `prompts/` directory and a human review at each step. The slogan: spec for days, build in minutes, and "debug the blueprint not the actual app. Fix/debug the spec not the code."

Several frameworks were named, with mixed endorsements: one "worked best", one only got early impressions, one "keeps feature scope tight". A dissenting voice argued the LLM shouldn't "define and orchestrate the process" at all. Use procedural code, with a human in the loop.

### Against

An opposing post called the whole approach overwrought. A four-page spec burned lots of tokens and produced poor output. There's "context drift and pollution". And "code is deterministic, specs are not". Add heavy external tooling and a confusing community around the main framework, and the cost looks higher than the benefit. The author's test: clone one of these projects and ask the agent what it's about.

### The replies

They split, and I'll leave the split unresolved:

- "You don't give them the whole spec at once. Break it out into tickets, much like a PM would do." One task per fresh session, and have the AI document the technical details after each task so the next session starts from there.
- Four pages is too short, said another: a few pages is "barely above" a vague prompt.
- Agreement with the original poster: requirements change as you build, because programming is "an iterative discovery process".
- A researcher in task alignment suggested models don't read specs the way humans do, so we may need an unambiguous shared language. Speculative.
- A reminder that building context (code retrieval, graph-based approaches) matters whatever format the spec takes.

The evidence on both sides is anecdotal and self-selected. Nobody posted a measurement comparing spec-driven runs with unplanned runs. Anyone who claims otherwise is probably selling a framework with a star count.

Under the shouting, the two camps agree on a little. Write less than a thesis. Break it into tickets. Don't hand over everything at once.

## Tickets and fresh sessions

This is where the contract becomes tickets. People report modest units of work: "one file per task", plus a short `decisions.md` of dated one-liners (what was chosen, what was rejected, why) that the agent reads at the start of each session. Others commit the agent's plan with each change, keep an architecture overview linking to detailed docs and a file index, or use architecture decision records.

The strongest reason for small tickets is decay. One poster cited a paper on "debugging decay", claiming reasoning drops about 80% after three failed attempts because the context fills up with wrong turns. Nobody checked the number, so treat it as secondhand. The advice that came with it holds up regardless:

1. After two failed fixes, stop.
2. Ask for a summary: the issue, what was tried, what's left.
3. Start a new session and paste in only that summary.
4. Next time, add temporary debug output up front.
5. Branch the thread instead of continuing a polluted one.

People disagree about how early quality degrades. One user sees answers get worse at about 30% of the context window and keeps a README and a handoff file refreshed with a standard prompt. Another says even 80% is fine when the work is "tightly planned" and the model follows a working document closely. They don't really contradict each other. The tightly planned user just needs fewer rescues, because the contract made the next step obvious.

A ticket template (also my sketch):

```
Goal:            what changes, in one sentence
Files allowed:   exact list
Acceptance test: written from the requirement, not the code
How to verify:   the command to run
Stop condition:  when to stop and ask
```

The loop: plan, one task per fresh session, log the decision, next task. Dull and dependable.

## Who drafts the contract, and who checks it

Planning with two models got a real experiment. One developer ran research, planning and cross-review phases on an actual feature (adding vector search to a small memory server), using two different frontier models. Using both beat either one alone. One model produced cleaner markdown plans with code snippets, and also cited a vendor relationship as a reason for a technical choice, which is a good reason to read plans skeptically. The author admitted a bias, and it was one task. The rule people suggested is intuitive: have each model's plans checked by the other.

A related point: a weaker implementer needs "a really good plan by a sota model or well broken down tasks, otherwise it codes itself in a corner". The quality of the plan sets the ceiling for a cheap model.

Human checkpoints matter too. A vendor's account of a long autonomous self-refactor said the team "mostly just reviewed the spec at the start and the code at the end". Most of the comments asked how much human involvement there really was and how it was tested. I'd treat it as marketing.

A developer on a team where every ticket has to go through an agent said the planning part "is still ok" while the typing is gone. One reply described what's left as "writing good task specs, knowing how to test the code". That's not a technique. It's a job description.

## Acceptance tests belong in the contract

One clause deserves its own section. If the AI writes tests from the existing code, "those tests will only mirror its logic". Generate acceptance tests from the requirements instead. Replies added nuance: a characterization test of current behavior still catches regressions, lint rules and pre-commit hooks help, and some spec frameworks already generate tests from requirements.

Why does this matter so much? One developer asked an agent to refactor a huge resolver file. The result dropped functionality, left "add this later" comments, and "conveniently rewrote the tests" so the broken code passed. The author hadn't frozen the tests.

So the plan should say which tests are frozen. Put it in the ticket. Better still, enforce it with a check that fails the run if frozen test files show up in the diff.

## When the contract is overkill

Not every job needs paperwork.

- **Tiny tasks.** Small games and scripts one-shot fine. A best-practices checklist for beginners got called a recipe to "over-engineer from day 1 and never release".
- **Narrow visual work.** One game developer found that narrow problems with exact reproduction steps and screenshots worked best, and visual testing stayed manual. No plan fixes that.
- **Rules rot.** A study of rules files in large public repos found that 90% were written as must/always/never, with piles of explicit "don't" bullets. One practitioner warned that long lists of prose stop being followed and should become structural checks.
- **Planning after the fact.** People were nearly unanimous that coding first and handing it to a freelancer later is "the worst of both worlds".

Discipline matters more than tooling. Several developers credited their habits rather than any particular tool, even good mode sets with architect, orchestrator, code and debug roles.

## Every good practice shrinks the model's freedom

Put it all together and a pattern shows up. Every practice that works in these threads narrows what the model is free to do. A short plan. One ticket per session. A list of allowed files. Tests fixed in advance. A summary instead of a polluted conversation.

That's the case for manual, deterministic control. You select the exact files yourself, so "files in scope" is enforced by construction rather than hope. The context holds the ticket and the code it touches, nothing else. The model proposes search/replace blocks, and the result is an ordinary Git diff you can read, reject or commit. Because the work is sliced and committed one task at a time, each fresh session starts from a clean repo, not a chat history.

Autonomous agents have their place, and a greenfield prototype in a throwaway repo is a fine one. But on a mature codebase, where the architecture is the asset, a contract you wrote and a diff you read beat a loop you hope converges.

This only rebuilds waterfall if the plan is big and written once. A one-page contract per ticket, revised as you learn, keeps agile's feedback loop with a fraction of the paperwork. A plan won't guarantee success, but it makes failure cheaper to spot and roll back. Spec-driven tooling can be worth it, especially where requirements already live in formal documents. For small teams, a plain markdown plan and a decisions log usually get most of the benefit with less context overhead. And for throwaway work, skip the plan. Match the ceremony to the cost of being wrong.
