# The Operating Habits Behind Vibe-Coded Projects That Stay on Track

Strip out the arguments about whether vibe coding is real engineering and a small set of habits remains. They are about controlling the loop, not about owning a smarter model.

> I have watched myself lose a whole Saturday to a bug that took twenty minutes to introduce and four hours of "try again" to bury. The model never got tired, and that was exactly the problem.

## The same two curves, over and over

Anyone who has built something with an agent knows the shape. The first 90% arrives in twenty minutes and feels like cheating. The last 10% eats the next day.

One developer described it as an agent that "keeps confidently fixing the wrong thing and bringing back the bug I just killed". A popular meme version of the same workflow: fix, which breaks something else, fix, new error, and "repeat until enlightenment... the AI runs out of context and you actually need to understand the system". Another compared it to a slot machine: blindly accept, and later suggestions get "less and less reliable".

Yet some people report finished things: a mobile idle game that "paid for the x5 plan", a crafting game with two dozen missions, small apps still in production two years later. Read for process only, the difference is not a better model. It is a workflow.

This article takes the **workflow lens**: every habit below is a way to lower the cost of a wrong step. The evidence is self-reported and survivorship-biased, so read the habits as hypotheses, not measured effects.

## Why the cost of a wrong step is the real variable

Agents are fast at writing code, which is not the same as good. Speed multiplies whatever direction you point it in, including the wrong one.

Think of each step as a bet with three costs:

- **Detection cost:** how long until you notice it is wrong.
- **Undo cost:** how hard it is to get back to the last good state.
- **Diagnosis cost:** how long to find out *why*.

Every habit below attacks one of those. Plan-first lowers detection cost. Checkpoints lower undo cost. Breaking the retry loop lowers diagnosis cost. A boring stack lowers all three.

| Habit | Which cost it cuts | What it looks like in practice |
|---|---|---|
| Plan before code | Detection | Read and interrogate the plan, cut until it fits in your head |
| Small steps, checkpoints | Undo | One plan, one commit, branch before risky work |
| Break the retry loop | Diagnosis | Stop after two failed fixes, name the cause |
| Context hygiene | Detection and diagnosis | Short sessions, split roles, scheduled refactors |
| Boring, portable stack | All three | One deployment target, data you control, git from commit one |

## Habit 1: Spend the effort in the plan, not the code

The most explicit recipe came from a developer who builds side projects from a phone and reads none of the code. Not exactly a role model for rigor, and yet their rules start with the discipline everyone else skips:

- Start in plan mode.
- READ THE PLAN.
- Ask the agent what each section means.
- Remember that "good and bad decisions cascade and multiply".
- If the plan does not fit in your head, it is too big. Have the agent split it into digestible chunks and run the same loop on each.

Someone who never reads code spends their care on the plan. Not an accident: a plan is the one artifact cheap enough to read, and an error caught there costs a sentence, not a refactor.

The same pattern shows up in a team setting. Picture a team adding a feature of roughly 12,000 lines to a .NET backend. The method is "architect first": a blueprint of around 2,000 lines before any code, because once an agent is allowed to make an assumption, it introduces patterns that "don't match company standards". 

One engineer in that discussion called writing tests first and making the agent pass them "the single biggest quality lever I've found", claiming it beats pure vibing once a project passes about 5K lines. That is one voice, not a measurement. Another, from embedded automotive work, noted it is the specification-then-handoff structure of their field.

Do the veterans agree this is vibe coding? No. One says architecture plus detailed specs for the AI is simply what vibe coding really is. Others say the term is being stretched until it means nothing. There is also a real constraint: agents rarely say no or challenge your requirement. A plan only catches the mistakes *you* can see.

A plan-light counterexample exists: a builder made a large strategy game with plan mode plus sub-agent teams, dumping bullet-point ideas in "20 minutes here and there". Fair enough. But how plans passed between agents, and what it cost, went unanswered. Short plans are still plans.

### A plan template (synthesis, not from any thread)

A one-page plan that works for most features:

1. Goal, in one sentence.
2. Constraints (stack, style, things not to touch).
3. Files expected to change.
4. The test or check that proves it works.
5. Explicit non-goals.

The last line matters most. Non-goals are how you stop an agent from "helpfully" rewriting the router.

For non-engineers, a veteran advised learning the building blocks (hosting, auth, APIs, version control, testing) before the code. Silent failures live in exactly those blocks.

## Habit 2: Keep each step small enough to hold in your head, and checkpoint it

The phone-workflow rules include a line worth stealing: commit to git after every completed plan, so you can "go back in time if something breaks". One plan, one commit.

A novice asked the obvious follow-up. What is the rollback point for the database? Nobody answered. That gap is real. Git saves code, not data, so schema migrations, snapshots and scheduled dumps need their own habit.

Consider the story of a refactor that was supposed to take five minutes and took two days to unwind. The mitigations people offered were all about undo cost: branch and revert everything, "walk back to the last commit and we'll try again", back up working files before a session, or hand the task to a different agent.

The opposite approach has its own gallery. An agent "cleans up" a project by deleting things. The reply: "so, it deleted everything". And a developer pasted a thousand lines of logic into a chat window and got back a total rewrite. The explanation from experienced users: in a plain chat interface, "any LLM that's not Claude will rewrite the entire document from scratch", while coding agents make targeted edits. The fix is to stop pasting into a chat box and use a tool that edits files in place. 

This is where the deterministic alternative earns its keep. A workflow built on search-and-replace blocks, applied to files you chose, then reviewed as a normal Git diff, makes the undo cost almost zero. The change is small by construction, the diff is the checkpoint, and "revert" is one command. Nothing was silently deleted because nothing could touch a file you did not select.

Autonomous agents are fine for greenfield exploration. In an established codebase, scope is a feature.

The trade-off is honest: small steps mean more round trips. The reported benefit is that bad decisions are caught while cheap.

Two sketched rules: commit after each completed plan, and no refactor across files without a plan.

## Habit 3: Break the retry loop

Back to the engineer whose agent kept fixing the wrong thing. What broke the cycle? Dropping the "try again" reflex and actually reading what the agent wrote. It had "patched the symptom and left the cause". Once the human *named the cause*, the agent fixed it in one go.

That is the most useful sentence in the whole genre. The model is a fast hands, not a diagnosis engine. The diagnosis is yours.

You can hear the difference in the vocabulary. "plz fix" is a lever pull. "wtf are you doing?" is a question, and asking it forces the agent (and you) to explain what is actually happening. Another veteran put the bar modestly: vibe coders do not need to be developers, but they should be able to troubleshoot, use dev tools and write test plans.

Tools that close the loop help. One engineer credited Playwright and agents with browser access for debugging, because a failing check beats a vague description. 

And then there is the laziness trap. A developer admitted never opening the browser inspector to find a `pointer-events: none` rule because the AI had named all the classes. Delegating the last two pixels can cost more than doing it.

### An escalation ladder (synthesis)

When a fix fails, climb one rung at a time:

1. Revert to the last good commit.
2. Restate the cause in your own words.
3. Add a failing test or browser check.
4. Switch agent or model for a second opinion.
5. Read the code yourself.

Cross-model fallback ("give it over to Codex") gets mentioned but never evaluated. An idea, not a law.

## Habit 4: Context hygiene when the project outgrows the window

The evidence here is thin but pointed. One builder split roles across tools: one model for specifying and planning, another for writing code, swapping if a limit hits. A developer on a big project reported hitting limits and token errors almost immediately.

Long projects re-read a lot, and a tangled codebase makes every feature expensive. One engineer who burned a quota in two prompts got this advice: ask how many files exist and how lines are distributed, then spend a few reset cycles having the AI refactor its own code.

Role-splitting is hygiene too. One developer fought an agent for hours over visuals, then treated a second session as a "graphic designer" producing assets from machine-readable instructions, keeping the logic session untouched. Separate sessions, separate jobs.

This is the argument for manual context in one image. If you choose the files that go into each prompt, the context is small by construction, cheap to pay for and easy to reason about. Nobody has to wonder what the agent "remembered".

A reminder: persistent instruction files change behavior. A joke about a "rigged memory" had people guessing an instruction file told the model to refuse. Whatever sits in standing instructions shapes everything after it.

## Habit 5: Pick a boring, portable stack and stick to it

Imagine a builder who has launched dozens of small apps over two years, with a handful still in production. Their routine, as described: reusable stateless "bricks" (image resizing, media generation), one deployment target (an edge platform or a plain VPS), centralized secrets and config, and one uniform way to resume any app. And a rule: write down bottlenecks because "they WILL repeat". Dev servers filling the disk? One cleanup worker per app, forever.

Skeptics asked the right question: did any make money?

Familiarity matters just as much. An experienced mobile developer shipped a weather app in three weeks on a stack they knew well, with only a shallow review, and the weak spot was the admin panel in a framework outside their comfort zone: most AI help, least confidence.

Platform lock-in is a workflow decision too. Platform lock-in is a workflow decision too. Imagine a builder with twelve gigabytes in a hosted builder platform's database, locked out with no reply. That account is one-sided and unverified, so take it as a risk argument. The advice was still sound: keep the database on infrastructure you control, take scheduled dumps out, keep source in git locally, and a cheap VPS with Postgres will do.

One more point: the stack decides what the agent can verify. If it can render, run and test the result, it can self-correct. If not, you are the test harness.

## Habit 6: Match tool to job, but do not churn

Every model release triggers the same thread. Some say "I prefer master a tool than changing all the time". One summary: "They're all fine. They're all terrible." Benchmarks draw suspicion too: a post praising two open-weight models read like an ad, some reported one "useless" in real agent work, and the best reply was "benchmarks mean nothing, does it actually accomplish real world tasks?" Test on your own task.

A louder claim says the gains come only from command-line agents that use tools on your machine. They are strong at greenfield work. The pushback was fair, though: the flashy demo is in the training data, and the real job is small fixes on large codebases. Pick by the cost of a wrong step.

## Where practitioners split

Sort the discussion into three camps.

- **Read-nothing hobbyists.** "If it works for me, it's fine." Fine for personal tools, though even they recommend reading the plan.
- **Experienced loop designers.** Their line: "design the loop, build the harness, review the actual work." The retort was immediate: "show me your harness". Both camps ask how juniors build judgment without the old debugging friction.
- **Skeptics.** When a respected maintainer is said to use AI help, the reply is that it is not vibe coding, because he reviews and knows what the code does.

A veteran's advice maps neatly onto everything above: new code should have unit tests, be modular, and learning git and code review is worth it even in an unfamiliar language.

And the caveat. All of it is self-reported and skewed toward people who finished. The developer who called themselves a failed vibe coder (two years, modest income, skills atrophied) is the other side of the sample.

## A routine you can copy

- **Before:** one boring stack you can read. Own your database and source outside any builder platform. Scheduled dumps. Git from the first commit.
- **Plan:** plan mode, read it, interrogate it, cut it until it fits in your head. Tests or acceptance checks first when the spec is non-trivial.
- **Slice:** one plan, one commit. A rollback point before each risky change. A separate session for assets or polish.
- **Loop:** after two failed fixes, stop. Read the diff, name the cause, hand over a failing test.
- **Hygiene:** watch for files growing large. Schedule refactors. Write down repeating bottlenecks and fold them into standing instructions.

A closing observation: someone pitched a "vibe coding keyboard" built around accept / esc / retry / voice. Those four verbs are the whole loop. The habits above are about how rarely to press the third.

## FAQ

**Isn't all this planning just slow programming with extra steps?**
Partly, yes. Planning moves effort from fixing to deciding, which pays off when the project is past a few thousand lines and costs you on a throwaway script.

**If the model keeps improving, won't these habits become unnecessary?**
Some will shrink, but a faster author still needs a reviewer, a rollback point and a named cause. Speed makes wrong steps cheaper to take, not cheaper to find.

**Why not let an agent roam the whole repo and sort it out?**
For greenfield experiments it can be great. In a codebase with history, broad autonomy widens what a wrong step can touch, and scoped, reviewable edits keep the blast radius small.

**Are survivors' habits proof of anything?**
No. They are self-reported by people who finished, so treat them as hypotheses worth trying and keep what lowers your own cost of being wrong.

## Key Takeaways

- Judge every habit by one question: does it lower the cost of detecting, undoing or diagnosing a wrong step?
- Read the plan, commit per plan, and name the cause instead of pulling the lever again.
- Keep the stack boring, the context scoped and the data in places you control.

*Speed is only a virtue for people who know how to stop.*
