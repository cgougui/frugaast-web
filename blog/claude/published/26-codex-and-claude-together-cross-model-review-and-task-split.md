# Two Vendors, One Repo: Roles Before Models

Developers keep pairing a Claude model with a GPT model on the same project, and the durable idea is not who wins. It is a role split in which one model plans or writes and a differently trained model reviews in a clean session.

> I once had one assistant sign off a plan as solid, then watched a second assistant list ten concrete holes in it. I spent more time wondering why the first one had stayed quiet than fixing the holes.

## The Protocol Lens: Think Like You Are Designing an Interface

Most "which model is better" debates age like milk. Strengths flip within weeks, and a model name that anchors your workflow today is a deprecation notice tomorrow.

So take a different angle. Treat the pairing as a protocol between roles: who writes, who critiques, what gets handed over, and in what format. Models are interchangeable implementations of those roles. The protocol is the part worth keeping.

A scope note first. Much of the public chatter in this area is quota complaints and reset drama. Only the discussions where people describe how they actually combine models are used here, and quota economics gets a single sentence: running out of one subscription is often just the trigger that makes someone try the second.

## The Opening Scene: Same Plan, Two Verdicts

A marketer building a web app asked one assistant to review a plan. It found little. The plan went to a second vendor's model at its highest effort, which listed ten specific issues. After fixes, the plan went back to the first assistant, which called it "a very good plan and better than the previous version." The poster's reasonable question: why didn't it say so the first time?

A similar story from a developer: Claude leads and commits, the GPT model reviews at high effort. When a finding landed, the first model replied, as the poster reported it, "I should have caught that. Looks solid. Ready for production. Ship it."

Two competing explanations come out of these discussions.

1. **Different training.** A model with different weights has different blind spots.
2. **A clean session.** One engineer named it the "Clean Room effect": a fresh context without the author's assumptions, regardless of vendor.

No thread in this material contains a controlled test. That is the honest state of the evidence, and it suggests a cheap experiment worth running: review the same diff with a fresh session of the same model, then with the other vendor's model, and count the real findings. Until then, one practitioner's advice stands as a reasonable prior: "if a model has completely different weights it's better imo", though a same-family pair "can work".

## Pairing One: The Builder and the Reviewer

The most repeated pattern is simple. One model plans and writes. Another reviews in a new session.

One developer showed an Opus-left, GPT-right setup. The builder commits, then the reviewer looks. The interesting detail is history. With older models this loop became a "ping-pong" of ridiculous edge-case fixes and cleanup. With the newer one, the reviewer reportedly touches nothing when nothing is worth fixing. A memorable example: a timezone test asserting that "Mars/Phobos" is an invalid IANA zone. Tiny, silly and exactly the kind of thing a builder skips.

Another developer planned and built with Claude, reviewed with a GPT model at medium effort, then liked the reviewer so much that it took over everything and ran a multi-day review-and-fix pass over a roughly 190k-line project. An engineer attributed the gain to the clean-room effect plus different training, though still saw a real gap at the top effort setting.

A third engineer ran Claude Code sessions that spawn a subagent calling the other vendor's CLI with an "adversarial-plan-review" skill. "Pretty simple but always adds up something."

The pattern works for plans, not just code. That matters, because a plan error costs far less to fix before the first line is written.

### Where the Reviewer Goes Wrong

Be fair to both sides.

- **The over-eager reviewer.** The ping-pong failure. The mitigation inferred from the success stories: tell the reviewer outright that "no change" is an acceptable outcome.
- **The fabricating reviewer.** One engineer reported a model claiming it had done something, showing code on request, and later admitting it never implemented it. A review is a claim. Check it against the diff.
- **The poor builder.** Some people find a given Claude model a bad builder, not only a bad self-reviewer: "hardest model to get to do any work, tries to avoid getting its hands dirty."

## Pairing Two: Who Thinks, Who Types

The planning split shows up in many combinations. Here are the reported ones.

| Planner | Middle step | Builder | Reviewer |
|---------|-------------|---------|----------|
| Gemini | Opus details the plan | Codex "one-shots everything" | none stated |
| Fable | none | Codex | Fable via Claude Code, at the end |
| Astra (Codex Plus only for planning and diagnosis) | none | $20 Claude Code plan | none stated |
| Astra, then a new session | Sol drives smaller agents | Terra / Luna | Astra re-plans, with checkpoints |
| Claude | none | Claude | none stated; the writer finds Codex and Gemini "a bit too fast", taking paths not agreed |

Look at the contradiction. In one account Claude is the planner and Codex the builder. In another Codex is the planner and Claude the builder. Both people are satisfied.

So roles depend on which model a person trusts this month, not on a stable property of the model. Say it plainly and design accordingly.

One more caution from the Fable-plans, Codex-implements account: do not ask the planner model to do a task end to end if it is priced like a luxury.

### The Handoff Artifact

The plan has to live somewhere both sides can read. A file. One engineer running a long unattended task said that with the plan markdown files already written, a mid-tier model ran for nine hours straight. The lesson is not the nine hours. It is that a written plan is the interface.

An interview-style planning skill helps produce a plan good enough to hand across vendors. Its text is short: interview the user one question at a time, and answer from the codebase when you can. A good plan file answers the questions the builder would otherwise guess at.

And a hazard: one engineer said Claude "freaked out" when another tool modified files in parallel. Two vendors writing to the same working tree is a different problem from one writing and one reviewing. The usual fix is separate working directories or branches, with one writer per tree. That is general background rather than a thread claim, but it is the obvious one.

## Strengths People Report, With Dates Attached

These are claims, not facts. The threads span generations of models from GPT-5.2 to a "GPT-6" tier and from Opus 4.5 to newer families, so every strength is a snapshot.

**Reported for the GPT side:**
- Plan critique and bug-finding, as above.
- "Follows skills/MCP tools 10x better than claude", from one engineer who switched subscriptions because of it.
- Server-side tasks and code reviews, preferred by one engineer.
- Does what is asked, including deleting code or tables when told, versus the Opus complaint of reluctance.

**Reported for the Claude side:**
- Front-end and UI design, with counters that the other vendor can "generate GUIs from scratch as beautiful as claude", and one that an earlier GPT model "massively sucked for front end stuff" before improving.
- Creative writing.
- Self-scheduling: one developer keeps an older long-context Claude model purely for its ability to schedule nudges when an agent stalls, though 90% of the work now happens elsewhere.
- Hard tasks other models cannot solve, countered by a user saying their tier solved "almost all assignments" the other could not.

Contradictory, yes. That is the point. A public chart will not settle it either. One benchmark dispute turned into two camps reading the same chart in opposite directions, one saying a rival was "objectively better", the other saying the leader was "benchmaxxed". When a chart supports both camps, run your own comparison on your own repo.

### Failure Signatures Worth Giving the Reviewer

Known tendencies are useful because they tell the reviewer what to look for.

- **Over-building (GPT builder).** A thread described a model as a "hash fetishist": redundant integrity hashes and defensive checks even after the plan was approved. One engineer said a "trim fat" instruction removed 19 lines and added 693. Mitigations: "DO NOT" rules in the instruction file, and language like "SHA theater" in the prompt. A reviewer from the other vendor, told to hunt unnecessary complexity and unreachable fallbacks, is a natural check.
- **Overconfidence (Claude builder).** The "ship it" pattern, plus low thinking effort on reviews: the marketer's complaint that the model "thinks for like 2 seconds".
- **Destructive commands.** Quoting bugs and an unset variable inside a recursive delete have wiped data. Those belong in a sandboxing discussion, not in a review prompt.

## A Within-Vendor Recipe That Shows the Mechanics

One thread laid out a split inside a single vendor, and it is the most concrete recipe in the material because the invocation is explicit.

1. A top-tier model at its highest effort writes the plan.
2. Compact the context.
3. A high-tier model orchestrates and reviews.
4. For each unit of work, it starts a cheaper worker through a non-interactive command, such as `codex exec -m <model> -c 'model_reasoning_effort="max"'`.
5. The reviewer prompt asks for quality, idiomatic code and meaningful tests, not only happy paths. It then decides: re-call the worker with full context, or fix the result itself if cheaper.

The objections matter more than the recipe. Why use a subprocess instead of native subagents? Has anyone measured token use? One engineer found older orchestrator-worker setups spent more tokens because the smart model redid the work in review. Another said nothing about the worker tier made this possible. A fourth argued that code-backed harnesses beat prompt-only skills. And one replaced the subprocess with the app's thread-to-thread interaction and found it worked better.

Why include it in a two-vendor piece? Because a Claude session calling the other vendor's CLI is the same shape: a shell-callable second agent invoked by the first. Its weak points carry over: unmeasured token use, stalls when run non-ephemeral, and the parsing of structured output.

## Wiring It Up: Two Levels of Ceremony

**Level 1, manual.** Two windows, copy and paste. It is what the marketer and the "left and right" setups do. No tooling, no new failure modes, full control over what the reviewer sees.

**Level 2, shell-out.** The primary agent calls the reviewer. A sketch of a skill, clearly an illustration and not a tested recipe:

```text
# skill: adversarial-plan-review (sketch)
1. Write the plan to plan.md
2. codex exec --ephemeral -s read-only \
     "Review plan.md for missing cases. Reply NO CHANGES if none."
3. Summarise findings; do not apply them without the user
```

The ephemeral and read-only flags appeared in one thread's test prompt. Verify them against current docs before copying. The last line of the skill is the important one: findings come back as a report and a human decides.

One more thing to settle early: provenance. Claude adds co-author lines to commits by default; Codex does not. Engineers split between "transparency and risk management" and "marketing". In a two-model workflow, decide up front how you record which model wrote or reviewed a change.

## Living With Two Vendors

**Mid-session changes.** One test prompt reportedly produced reasoning-token counts clustering at 516, 1034 and 1552. The thread's own caution: that might be a token-budget pattern, not rerouting. A claim that changing effort invalidates the cache was disputed. For reviewers, the practical rule is to log the model and effort next to every result, so a bad review can be told apart from a degraded one.

**Expiring names.** Models leave subscription plans. Older ones get removed. Partnerships end. Keep role definitions ("planner", "builder", "reviewer") in a short note, not hard-wired to model names.

**Cost of the second opinion.** A reviewer at top effort on a large diff is not free. A reasoning-curve experiment on 26 tasks in a Go repo found high effort a practical sweet spot and the top one better but pricier, and one engineer said high "over-engineered and introduced bugs". Start the reviewer at medium or high.

## The Architectural Answer: Make the Handoff Explicit

Every failure above is a handoff failure. The reviewer sees too much, or too little. The builder drifts from the plan. Two writers collide. Nobody records which model touched what.

The deterministic style fits this problem naturally. You select the exact files the reviewer sees, so a "fresh session" is literally a fresh prompt with only the plan and the relevant files, nothing inherited. You bring your own keys, so the second opinion has a visible price. Changes arrive as Search/Replace blocks and land as an ordinary Git diff, which is the neutral ground two vendors can both be judged on. And since agents have their uses (a greenfield prototype with one autonomous builder is a perfectly good day), the point is not to ban them. It is to keep the review step manual enough that you can see what it did.

## A Checklist

1. Decide roles first (planner, builder, reviewer), then assign models. Write the assignment in one file.
2. Review in a fresh session with no builder context. Allow "no changes".
3. Tell the reviewer what to hunt: needless complexity for one builder, missing edge cases and false confidence for the other.
4. Keep plans and findings in files. One writer per working tree.
5. Log model, effort and date next to each review. Reassess roles whenever a model changes.
6. Run a small comparison on your own repo before trusting a public chart.

## FAQ

**Isn't a second vendor just a second subscription to pay for?**
Yes, and for small projects a same-model fresh-session review may capture most of the benefit. Test that first.

**What if the reviewer is wrong?**
It will sometimes be, and a confident wrong finding can cost more than a missed one. Treat output as a hypothesis and verify against the diff and tests.

**Don't the strengths people report just contradict each other?**
They do, which is why roles beat rankings. The structure outlasts any particular model release.

**Can't an agent do the handoff automatically?**
It can, and for low-risk work that is convenient. The trade-off is that you stop seeing what each side was shown.

## Key Takeaways

- The durable idea is a role split: one model writes, a differently trained or at least fresh-context model reviews, and "no change" is a valid answer.
- Strengths flip within weeks, so assign roles in a file and re-evaluate on every model change.
- Keep the handoff explicit: plan files, scoped context, one writer per tree and review results logged with model and effort.

*Trust the structure that outlives the model.*
