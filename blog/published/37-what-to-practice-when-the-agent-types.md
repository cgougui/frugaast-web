# What to Practice When the Agent Types: A Training Plan by Career Level

Developers at different stages are quietly changing what they rehearse by hand, what they hand to the agent, and what they look for when they hire. This article treats the whole question like a training program: which muscle is at risk at each level, and which drill keeps it alive.

> I caught myself last month accepting a diff I could not have written, then failing to explain it to a teammate in under a minute. Nothing was broken, which is exactly what bothered me.

## One question, three gyms

A team is interviewing an intern. Someone asks the standard opener: "What programming languages do you use?" The candidate answers with the name of an AI assistant. Pressed on which language the code was in, the candidate cannot say. The team passes.

The person telling the story stresses that half their team builds with AI every day. The rejection was not about the tool. It was because she "couldn't explain what she was building beyond the prompt."

Reactions split instantly. Some call the story fake. Others blame the pipeline: "the entire recruiting pipeline is just vibes", and a screening step should have caught this long before a human sat down. Fair. A signal like this says as much about the filter as about the candidate.

Still, the story works as a prompt for a better question. Not "will AI replace developers?", which nobody can answer, but a smaller one:

**What do you still do by hand, on purpose?**

The answer depends on where you stand. Learners, working engineers and the people who hire or mentor them face three different problems. So this piece walks through them like a training plan, one gym at a time.

A caveat first. Almost everything below is anecdote. The one quantitative claim that circulated, a model built from over a million Git events, was heavily challenged on method and is left out. Where the routines are suggestions and not reports, they are labeled.

## Gym one: learners and career changers

The question arrives in every form: is coding still worth learning?

Answers from experienced developers cluster in a few places.

- "Nobody knows." Honest, and the most common.
- The durable skill is the ability "to think algorithmically, express thoughts with precision, and decompose problems."
- The analogy to writing or music: an instrument you do not practice does not become less useful, you just stop being able to play it. "0 x100 is still 0."
- A staged view: coding gets you hired for maybe ten more years, and after that experience carries you because you know how to manage the agents.
- A reminder that "in 6 months developers will be obsolete" has been said for two years now.

Louder predictions also circulate: executives forecasting that half of entry-level office jobs vanish within a few years, and engineers declaring that "software engineering is done". The reactions are mostly the same two: this is hype from someone with a stake in the outcome, and a calendar reminder to check back later. One engineer's own follow-up gets quoted in reply: "coding was always the easy part. The hard part is requirements, goals, feedback."

One question in that thread never got an answer. Someone asked whether a person who started vibe coding with no prior experience will be valuable. Silence.

**The drill for learners.** Learn to code enough to explain and debug what the agent produced. That is the exact thing interviews now test. Concretely:

1. Pair every agent-built feature with a written explanation in your own words.
2. Debug one real failure per week without the agent.
3. Keep a plan on paper before you prompt.
4. Learn Git recovery (reset, force push, branch protection) *before* you need it. When an agent deletes something, the top reply is always the same: everyone finds out about Git the hard way.

## Gym two: junior and mid-level, where debugging goes missing

This is where the muscle visibly wastes.

A mentor describes a hire with several years of experience, two and a half months in. Answers in review are "direct copy from gen ai". When something fails, the response is "I don't know this!" or "no, this is not working at all". Nobody hunts for a root cause.

The advice from the replies ranges from harsh ("get rid of him") to useful:

- Have him draw the code and the data flow on a board.
- Put agent instruction files in the repo with the style guide and architecture, as guard rails. "If you can't beat em join em."
- A newer developer describes planning the application in a notebook first, then making the agent ask before implementing anything outside the designed logic.

A second thread supplies a healthy-use test. "Realizing I could've done it afterward is a good sign you know what you are doing." And its mirror: prompting without a clear idea of what the output should look like "is a dangerous place to be." Sometimes, someone adds, "the prompt is genuinely more work than code."

A third shows the accountability failure. A team had been given an assistant about a year and a half earlier. "That's what the assistant suggested" became the standard defense for weekly critical bugs. The reply was blunt: every engineer is responsible for what they commit. One mid-level dissented, saying quality improved for everyone, with the caveat that their team has no juniors.

**The drill for this level** (the writer's suggestion, not from the threads):

- Debug a failing test with no agent. Write a root-cause paragraph *before* you ask the model anything.
- Keep a "what I did not understand" log, one line per accepted diff.
- Treat anything the agent builds as a tutorial project: 20% building, 80% understanding what was built.

## Gym three: senior engineers, where the risk is motivation

Different problem entirely. Seniors usually keep their judgment. What they lose is the joy, and the hand skills.

A hobbyist with a multi-year side project says they cannot enjoy it anymore because "I COULD do all of it instantly with AI." The replies are the most useful material in the whole set.

- "Build far more difficult things... Passion dies from the lack of adventure." Think inference engines or simulations, not another CRUD app.
- "You outsourced thinking to AI. Take back the decisions; use it just for generating code."
- The chef analogy: some people love the meal, others love the cooking, and both are legitimate.
- Opposites exist too: veterans of decades who love it because they get to "think bigger picture", and someone who only started personal projects *because* of AI. A developer with forty-plus years behind them reports feeling "meaningless", even while using AI where it fits.

Another senior, two decades in, asks about their future. The advice: AI-free days with every extension off, because otherwise the skills fade, and the observation that if you do not think about trade-offs you cannot judge the model's solution. Writing code only by hand may stop being a viable living, the replies suggest, but design and validation will remain one.

Then a telling story from certified embedded work. A C++ developer in aviation stops when generated code gets too complex to understand. Replies split. One says "you're doing it right". Another asks for anything "specific, reproducible and falsifiable" about productivity gains. The sharpest comment explains why success stories cluster where they do: they come from people with a **fast oracle**, such as a failing test or a broken page. Certified embedded work has "a compiler and a certification process instead of a deploy button." Another embedded developer will not let a model touch flight code and finds its output "higher entropy" than the codebase.

A competitor who topped a GPU-kernel contest without ever hand-writing GPU code is held up as proof that AI is "a talent amplifier". The replies add: good developers can switch stacks, "bad devs generate BS". And the organizer noted earlier speedup claims were junk because models hacked the evaluator. A domain-expert judge was still required. A principal engineer's advice sums it up: try it on a domain you are already an expert of.

**The drill for seniors.**

- Pick harder problems.
- Keep one area deliberately by hand.
- Use your expertise as the oracle: write the test first.
- Define what review and rollback look like for each way the team uses AI.

## The calibration day

The most concrete routine in the set comes from a team that holds a weekly no-agents day, called a "calibration day". After six weeks they reported better prompts and context on the other four days. They also found places where "the agent was filling in gaps we hadn't noticed we'd left."

Their stated mechanism is the interesting part. When you write something yourself, you must decide what you want *before* words appear. An agent draft invites you to "approve whatever's close."

The skeptics deserve their say, unsoftened. "That's called thinking." And the inevitable accusation that the post itself was machine-written. A middle group liked the idea for themselves, not for their company.

Be honest about the evidence. This is one team's six-week report. No one has measured that any of these routines preserves skill. They are plausible, cheap and reversible, which is a decent bar for an experiment, and a poor one for a claim.

## Why the advice conflicts

Part of the confusion is that "using AI" names five different activities. One post sorts them by who owns the decisions:

| Approach | Who decides | Who reviews |
|---|---|---|
| Organic | Developer | Developer |
| Reviewed agentic | Developer | Developer, every step |
| Guided agentic | Shared | Developer, at checkpoints |
| Fully agentic | Agent | Developer, at the end |
| Vibe coding | Agent | Nobody, ideally |

The post's point is that "both parties aren't describing the same activity". One sharp reply asks where rollback, test ownership and final merge approval sit in each row. That is the right question. Without an answer, "I use AI" tells you nothing.

Context shifts the answer as well. A startup lead tells a new hire to stop worrying about specs and "vibe code minimal stuff quickly". That can be sensible before an MVP with months of runway. In anything where mistakes matter, replies call it "horror beyond comprehension". One developer reports their startup moved from MVP to carefully designed features and is rebuilding their part. The same skill is worth practicing in one place and a luxury in another.

## What hiring looks like now

Communities mock the idea that someone who cannot work without an LLM calls themselves an engineer. Other voices answer with sarcasm: vibe coders are engineers now. Neither side proves much.

A more useful question for a lead is what to test. A checklist, clearly a synthesis:

1. Ask the candidate to explain a diff, line by line.
2. Debug a failing test live.
3. Ask what the agent got wrong last week.
4. Ask which language the code is in.

The last one sounds silly until you remember the intern story.

Related is the management reflex of firing engineers so "the LLMs can focus on important things". Experienced developers recall the same cycle with cloud migrations: let the sysadmins go, then hire "cloud architects". That is about management behavior, not skills.

## The paradigm underneath: keep the hands in the loop

Look at every routine above and one pattern repeats. Each one forces a human decision *before* the model speaks, or a human explanation *after*.

That is the argument for deterministic, agentless tooling. Not that agents are useless. They are excellent for prototypes and throwaway greenfield code, where nobody needs to understand the result. But for a codebase you will maintain for years, the skill you are protecting is your ability to scope a change, read a diff and say why it is right.

Tools that make you select the exact files, send them with your own API key, and return search/replace edits as ordinary Git diffs keep that muscle working by design. You choose the context, which is a design decision. You see every changed line, which is reading practice. You see what each call cost, which keeps the economics honest. An autonomous loop, by contrast, asks only for your approval at the end, and approval is the weakest form of understanding.

## Practical takeaways by level

- **Learner:** explain every agent-built feature in writing, debug without the agent weekly, plan on paper, learn Git recovery early.
- **Early or mid career:** root-cause before asking, keep the "what I did not understand" log, run a calibration day, apply the 20/80 rule.
- **Senior:** choose harder problems, keep one area by hand, be the oracle.
- **Lead or hiring manager:** test explanation, not only output. Give juniors tasks that exercise debugging. Put the style guide and architecture in shared instruction files. Decide whether a no-agents day fits the team.

The unresolved tension is real. The "coding was always the easy part" camp says planning, explaining and reviewing *are* the job. The other camp says hand skills are the only way to build the judgment those jobs require. Both can be right at once.

## FAQ

**Isn't a no-agents day just nostalgia with a calendar invite?**
It can be, and there is no data that it preserves skill. Its defensible value is diagnostic: you learn what you cannot do unaided, which costs one slow day.

**If agents keep improving, why practice skills that may be obsolete?**
Because reviewing and directing work requires being able to judge it, and judgment seems to come from having done the thing. The cost of practice is small and the cost of unexplainable code is not.

**Is "explain the diff" a fair interview test?**
It tests exactly what the job now demands, but it can punish nervous people who understand the code. Pair it with a live debugging task so one bad moment does not decide the outcome.

**Do senior developers really need a plan to stay engaged?**
Not all of them, since plenty report loving the work more than before. For those who feel the adventure drain out, harder problems are a cheaper fix than quitting.

## Key Takeaways

- The risk differs by level: learners miss debugging and reading, seniors risk motivation and hand skills, and leads must redefine what "can program" means.
- The routines that appear to work force a human decision before the model speaks, or a human explanation after it.
- Evidence is thin and anecdotal, so treat every drill as a cheap experiment and not a proven fix.

*You do not keep a skill by owning a tool that has it.*
