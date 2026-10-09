The most useful thing a second model can do is disagree with the first one. Whether Claude or GPT is "better" this month matters much less than having one of them write and the other review.

Most "which model is better" debates age like milk. Strengths flip within weeks, and the model name your workflow depends on today is tomorrow's deprecation notice. So I find it more useful to think of a pairing as a protocol between roles: who writes, who critiques, what gets handed over, and in what format. Models are interchangeable implementations of those roles. The protocol is what's worth keeping.

A lot of public chatter in this area is about quotas and resets. I've only used discussions where people describe how they actually combine models. On quotas, one sentence: running out on one subscription is often what pushes someone to try a second.

## Same plan, two verdicts

A marketer building a web app asked one assistant to review a plan, and it found little. The plan then went to a second vendor's model at its highest effort, which listed ten specific issues. After fixes, the plan went back to the first assistant, which called it "a very good plan and better than the previous version." The poster's reasonable question: why didn't it say so the first time?

A developer told a similar story. Claude leads and commits, and the GPT model reviews at high effort. When the reviewer found something, the first model replied, as the poster reported it, "I should have caught that. Looks solid. Ready for production. Ship it."

Two explanations come up:

1. **Different training.** A model with different weights has different blind spots.
2. **A clean session.** One engineer called it the "Clean Room effect": a fresh context without the author's assumptions, whatever the vendor.

Nothing I read included a controlled test. That suggests a cheap experiment: review the same diff with a fresh session of the same model, then with the other vendor's model, and count the real findings. Until someone does, one practitioner's advice is a reasonable default: "if a model has completely different weights it's better imo", though a same-family pair "can work".

## The builder and the reviewer

The most common pattern is simple. One model plans and writes. Another reviews in a new session.

One developer showed a setup with Opus on the left and GPT on the right. The builder commits, then the reviewer looks. The interesting part is how it changed over time. With older models the loop turned into a "ping-pong" of ridiculous edge-case fixes and cleanup. With the newer one, the reviewer reportedly leaves things alone when nothing's worth fixing. A memorable catch: a timezone test asserting that "Mars/Phobos" is an invalid IANA zone. Tiny, silly, and exactly what a builder skips.

Another developer planned and built with Claude and reviewed with a GPT model at medium effort, then liked the reviewer so much it took over everything and ran a multi-day review-and-fix pass over a roughly 190k-line project. One engineer credited the clean-room effect plus different training, though they still saw a real gap at the top effort setting.

A third engineer runs Claude Code sessions that spawn a subagent calling the other vendor's CLI with an "adversarial-plan-review" skill. "Pretty simple but always adds up something."

It works for plans, not just code. That matters, because a mistake in the plan is far cheaper to fix before the first line gets written.

### Where the reviewer goes wrong

To be fair to both sides:

- **The over-eager reviewer.** The ping-pong problem. The fix that comes out of the success stories: tell the reviewer outright that "no changes" is an acceptable answer.
- **The reviewer that makes things up.** One engineer reported a model claiming it had done something, showing code when asked, and later admitting it never implemented it. A review is a claim. Check it against the diff.
- **The poor builder.** Some people find a given Claude model a bad builder, not just a bad reviewer of its own work: "hardest model to get to do any work, tries to avoid getting its hands dirty."

## Who thinks, who types

The planning split shows up in many combinations:

| Planner | Middle step | Builder | Reviewer |
|---|---|---|---|
| Gemini | Opus fills in the plan | Codex "one-shots everything" | None mentioned |
| Fable | None | Codex | Fable via Claude Code, at the end |
| Astra (Codex Plus only for planning and diagnosis) | None | $20 Claude Code plan | None mentioned |
| Astra, then a new session | Sol drives smaller agents | Terra / Luna | Astra re-plans, with checkpoints |
| Claude | None | Claude | None; the writer finds Codex and Gemini "a bit too fast", taking paths nobody agreed on |

Notice the contradiction. In one account Claude plans and Codex builds. In another, Codex plans and Claude builds. Both people are happy.

So the roles depend on which model a person trusts this month, not on any stable property of the models. Design for that.

One more caution from the Fable-plans, Codex-builds account: don't ask the planner to do a task end to end if it's priced like a luxury.

### The plan is the interface

The plan has to live somewhere both models can read: a file. One engineer running a long unattended task said that with the plan files already written, a mid-tier model ran for nine hours straight. The nine hours isn't the lesson. The written plan being the interface is.

An interview-style planning skill helps produce a plan good enough to hand to another vendor. Its text is short: interview the user one question at a time, and answer from the codebase when you can. A good plan file answers the questions the builder would otherwise have to guess.

One hazard: an engineer said Claude "freaked out" when another tool modified files at the same time. Two vendors writing to the same working tree is a different problem from one writing and one reviewing. The obvious fix is separate working directories or branches, one writer per tree.

## Reported strengths, with dates attached

These are claims, not facts. The threads span model generations from GPT-5.2 to a "GPT-6" tier and from Opus 4.5 to newer families, so every strength is a snapshot.

**The GPT side:**
- Critiquing plans and finding bugs, as above.
- "Follows skills/MCP tools 10x better than claude", according to one engineer who switched subscriptions over it.
- Server-side tasks and code reviews, preferred by one engineer.
- Does what it's asked, including deleting code or tables when told, versus the complaint that Opus is reluctant.

**The Claude side:**
- Front-end and UI design, with counterclaims that the other vendor can "generate GUIs from scratch as beautiful as claude", and that an earlier GPT model "massively sucked for front end stuff" before it improved.
- Creative writing.
- Scheduling itself: one developer keeps an older long-context Claude model purely for its ability to schedule nudges when an agent stalls, though 90% of their work now happens elsewhere.
- Hard tasks other models can't solve, countered by a user saying their tier solved "almost all assignments" the other couldn't.

Contradictory, yes. That's the point. A public chart won't settle it either. One benchmark argument split into two camps reading the same chart in opposite ways: one said a rival was "objectively better", the other said the leader was "benchmaxxed". When a chart supports both sides, run your own comparison on your own repo.

### Tell the reviewer what to look for

Known tendencies are useful because they tell the reviewer where to look.

- **Overbuilding (GPT as builder).** One thread called a model a "hash fetishist": redundant integrity hashes and defensive checks even after the plan was approved. One engineer said a "trim fat" instruction removed 19 lines and added 693. Fixes: "DO NOT" rules in the instruction file, and phrases like "SHA theater" in the prompt. A reviewer from the other vendor, told to hunt for unnecessary complexity and unreachable fallbacks, is a natural check.
- **Overconfidence (Claude as builder).** The "ship it" pattern, plus low thinking effort on reviews: the marketer complained the model "thinks for like 2 seconds".
- **Destructive commands.** Quoting bugs and an unset variable inside a recursive delete have wiped data. That's a job for sandboxing, not a review prompt.

## A single-vendor recipe that shows the mechanics

One thread laid out a split within a single vendor. It's the most concrete recipe I found, because the commands are explicit:

1. A top-tier model at its highest effort writes the plan.
2. Compact the context.
3. A high-tier model orchestrates and reviews.
4. For each unit of work, it starts a cheaper worker through a non-interactive command, such as `codex exec -m <model> -c 'model_reasoning_effort="max"'`.
5. The review prompt asks for quality, idiomatic code and meaningful tests, not just happy paths. Then the reviewer decides: call the worker again with full context, or fix the result itself if that's cheaper.

The objections matter more than the recipe. Why use a subprocess instead of native subagents? Has anyone measured the tokens? One engineer found older orchestrator-worker setups used more tokens because the smart model redid the work during review. Another said nothing about the worker tier made this possible. A fourth argued that harnesses backed by code beat skills that are only prompts. And one replaced the subprocess with the app's thread-to-thread feature and found it worked better.

Why include it in a post about two vendors? Because a Claude session calling the other vendor's CLI has the same shape: a second agent the first one calls from the shell. The weak points carry over too: tokens nobody measured, stalls when it isn't run ephemerally, and parsing structured output.

## Wiring it up

**Level 1, by hand.** Two windows, copy and paste. That's what the marketer and the left-and-right setups do. No tooling, no new failure modes, full control over what the reviewer sees.

**Level 2, shelling out.** The main agent calls the reviewer. A sketch of a skill (an illustration, not a tested recipe):

```text
# skill: adversarial-plan-review (sketch)
1. Write the plan to plan.md
2. codex exec --ephemeral -s read-only \
     "Review plan.md for missing cases. Reply NO CHANGES if none."
3. Summarise findings; do not apply them without the user
```

The ephemeral and read-only flags came from one thread's test prompt. Check them against current docs before copying. The last line matters most: findings come back as a report, and a human decides.

One more thing to settle early: who gets credit. Claude adds co-author lines to commits by default; Codex doesn't. Engineers split between "transparency and risk management" and "marketing". With two models, decide up front how you'll record which one wrote or reviewed each change.

## Living with two vendors

**Changes mid-session.** One test prompt reportedly produced reasoning-token counts clustered at 516, 1034 and 1552. The thread itself cautioned that this might be a token-budget pattern, not rerouting. A claim that changing effort invalidates the cache was disputed. For reviews, the practical rule is to log the model and effort next to every result, so you can tell a bad review from a degraded model.

**Names that expire.** Models leave subscription plans. Older ones get removed. Partnerships end. Keep the role definitions (planner, builder, reviewer) in a short note, not hard-wired to model names.

**The second opinion costs money.** A reviewer at top effort on a big diff isn't free. A reasoning-effort experiment on 26 tasks in a Go repo found high effort was the practical sweet spot, and the top setting was better but pricier. One engineer said high effort "over-engineered and introduced bugs". Start the reviewer at medium or high.

## Make the handoff explicit

Every failure above is a handoff failure. The reviewer sees too much or too little. The builder drifts from the plan. Two writers collide. Nobody records which model touched what.

A deterministic style fits this naturally. You select the exact files the reviewer sees, so a "fresh session" really is a fresh prompt containing only the plan and the relevant files. You use your own keys, so the second opinion has a visible price. Changes come back as search/replace blocks and land as an ordinary Git diff, which is neutral ground you can judge both vendors on. Agents have their uses (a greenfield prototype with one autonomous builder is a perfectly good day), so the point isn't to ban them. It's to keep the review step manual enough that you can see what it did.

## Checklist

1. Decide the roles first (planner, builder, reviewer), then assign models. Write it down in one file.
2. Review in a fresh session with none of the builder's context. Allow "no changes".
3. Tell the reviewer what to hunt for: needless complexity for one builder, missing edge cases and false confidence for the other.
4. Keep plans and findings in files. One writer per working tree.
5. Log the model, effort and date next to every review. Reassess the roles whenever a model changes.
6. Run a small comparison on your own repo before trusting a public chart.

A second vendor is a second subscription, and for small projects a fresh-session review with the same model may get you most of the benefit. Test that first. The reviewer will sometimes be wrong, and a confident wrong finding can cost more than a missed one, so treat its output as a hypothesis and check it against the diff and the tests. An agent can do the handoff automatically, and for low-risk work that's convenient. The cost is that you stop seeing what each side was shown.
