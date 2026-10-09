An auth middleware that logs the failure, then calls `next()` anyway. It compiles, it looks tidy, and the agent that wrote it will tell you all checks passed. The question isn't whether the diff looks right. It's who, exactly, checked it.

Every claim an agent makes ("this endpoint is protected", "all 40 icons use the right color") should pass through witnesses before you accept it. Some witnesses are reliable and boring: a compiler, a test runner, a linter. Others are charming and unreliable, like the model that wrote the code describing its own work. So the real question is who gets to say "done". The answer experienced developers keep arriving at: not the author. Never the author.

## Two failures that look fine

The first is size. A team argues about when to review a feature built by one developer and one agent: about 7,000 lines across 40 files, produced in an afternoon. Someone calls it "AI Comprehension Debt": code written faster than any human can understand it. A reviewer's mental model of a system normally grows at about the speed the code gets written. The agent broke that ratio.

The second is polish. Generated auth code "looks correct at first glance". Then you notice:

- An auth middleware that logs the failure, then calls `next()` anyway.
- A permission check that runs after the action instead of before.
- Validation that only exists in the frontend.

The professional formatting is the trap. It "creates false confidence". People skim clean code differently from messy code, and agents never produce messy code.

So what replaces reading the diff, when the diff is bigger than your working memory and looks like a textbook?

## The model's own report isn't a gate

Here's the uncomfortable part. Asking the author to confirm its own work fails in ways that are structural, not occasional.

A custom audit skill reported 22 violations in six files. The developer fixed them, then found 35 more by looking at the running app. The cause was almost funny: some icons inherited the default accent color, so there was no pattern to search for. The auditor "couldn't find things that looked like nothing".

Others are blunter. One engineer says LLMs "will straight up lie to pass the test". Another, about pipelines: "AI lied or you forgot to check? Pipe will catch it." A frustrated developer calls the whole thing "a complete black box". The reply that stuck: build as if you don't trust it, and be pedantic about whether the endpoint was actually built or the agent only thinks it was.

There's a fair counterpoint. Asking a model to hunt for auth bypasses in code it just wrote does turn up real problems, if you frame the request adversarially. And the opposite worry is also valid: generated tests miss the same gaps as the code, because both came from the same model with the same assumptions. A same-model reviewer is a colleague who went to the same school, read the same books, and made the same mistake.

Useful, then. But not a gate.

## Rank your witnesses

| Witness | Deterministic? | Catches | Misses |
|---|---|---|---|
| Compiler, type checker | Yes | Syntax and type errors | Anything semantic |
| Linter, static analysis | Yes | Rule violations, missing parentheses, dead code | Intent |
| Test suite in CI | Yes | Regressions, specified behavior | Behavior nobody specified |
| Hardcoded security scanner | Yes | Known risky patterns | New logic flaws |
| Reviewer with fresh context | No | Intent mismatches, over-engineering | Consistency between runs |
| The author re-reading its work | No | Typos, sometimes | Its own assumptions |

The deterministic witnesses can't be talked into agreeing with you. A static analyzer has been catching missing parentheses for twenty years and has never once said "looks good to me" to be polite.

## Make the rules mechanical

Stop putting rules in prose. "LLMs are incredibly bad at following rules consistently", and a rule in an instruction file is a suggestion. A rule in a script is a fact.

The pattern that keeps coming up is a single `preflight` script, the same one CI runs:

```
# scripts/preflight.sh  (same commands CI runs)
lint && typecheck && test && security-scan
```

The CI job calls exactly that script. This matters more than it looks: if the local check and the pipeline run the same command, the agent's local claim and the pipeline's verdict can't drift apart. "Preflight must pass before you commit" becomes an enforced sequence, not a hope.

A nice side effect: when the whole codebase follows one pattern and the pipeline enforces it, the agent follows the pattern too, without long docs. Strict pipelines even push models toward simpler implementations, because the complicated version fails a lint rule.

Hooks give you the same thing earlier. A pre-commit hook or a tool-level hook blocks a bad action before it lands instead of after.

Is this overkill for a solo developer? Some say yes: a full CI and PR ritual for a weekend project is heavy, so use hooks and a local script. Fair. But the alternative isn't no verification. It's a cheaper version of the same deterministic witness.

## Be paranoid about auth

Auth and security deserve the most paranoid treatment, because that's where "looks right" does the most damage. Practices from people who got burned, with their costs:

1. **Threat-model first.** Write the rules in plain words ("only admins or resource owners can access X"), then generate tests from them. Cost: you have to think before you prompt.
2. **Write the 401 and 403 tests before the implementation.** Cost: a slower start.
3. **Don't let the model invent auth.** Scaffold from an audited generator and let the model wire up proven patterns. Cost: less flexibility.
4. **Use a hardcoded scanner** with fixed rules for risky patterns, because the model shouldn't run security checks on its own honor. Cost: false positives, and it only knows yesterday's patterns.
5. **Trace the guard chain by hand.** "Security should always be reviewed manually." Cost: your time. Worth it.

A table-driven matrix is the cheapest way to catch the `next()` bug:

```
cases = [
  # role,        resource,      expected
  (anonymous,    /orders/42,    401),
  (user_other,   /orders/42,    403),
  (user_owner,   /orders/42,    200),
  (admin,        /orders/42,    200),
  (expired,      /orders/42,    401),
]
for each case: call endpoint, assert status AND assert handler not executed
```

The last assertion is the one that matters. A guard that only logs still lets the handler run, so the test has to check that the side effect didn't happen, not just that a status code came back.

One caveat: nobody has data on how often these bugs happen, and one skeptic called the worry "grasping at straws". These are well-known categories, not measured rates.

## Shrink what a human has to hold

Most experienced voices reject the premise of the big-branch debate. "Don't write 10k loc branches." Their answers:

- A pull request should be 500 to 1,000 lines, then reviewed.
- Hold a short design review first, split the feature into tasks, and merge those into a feature branch.
- Have the agent write a `PLAN.md` that gets reviewed before any code.
- Tie each change to a ticket with a one-line rationale written before the code, so review becomes "review of the rationales plus spot checks".

Then the fatalist: "You don't review, you just straight hit that approval button." Funny, because it's uncomfortably close to what happens when a 40-file diff shows up with green checks.

One practitioner estimates that quality drops once the agent has read more than about 500 lines and added more than 100. That's an estimate, but the direction is believable: more context, vaguer attention.

There's also a cheap cleanup pass. Treat the first version as a draft, and ask for a cut-down version with explicit rules:

```
Reduce this change. Rules:
- no abstraction for code used once
- no configurability that was not requested
- no error handling for impossible scenarios
```

## Keep the diff small by construction

If the developer picks the exact files that go into the prompt, the change can't sprawl into 50 files nobody mentioned. The scope is fixed by hand before the model writes anything.

The output comes back as search/replace blocks, applied and committed as an ordinary Git diff. Nothing hides inside a long agent run. The reviewer sees the same thing they've always reviewed, and `git diff --stat` shows the blast radius at a glance.

That's not an argument against autonomous agents. For a greenfield prototype, letting an agent roam is a fine trade: speed beats rigor when the code might get thrown away on Friday. On a mature codebase the economics flip. Wrong changes cost review time and incidents, and a tool that limits scope by design makes every check after it cheaper.

Using your own key adds one more benefit: you see the cost of each call. A review pass by a second model stops being a vague line on a subscription and becomes a number you can compare with the bug it caught.

## Audits that can't miss things

Back to the icons. The audit missed things because "find icons missing X" only finds violations the agent recognizes.

The fix: enumerate first, then verify.

1. **Enumerate deterministically.** A script or syntax-tree query lists every candidate: every route handler, every icon view.
2. **Check each item.** For every item in the complete list, check that X is there. A model or a test can do this part.
3. **Report counts.** "Enumerated 112, verified 112." If the numbers differ, the gap is visible.

This turns an open-ended hunt into a checklist. The model no longer decides what exists; a search tool does. Plain `rg`, `fd`, a syntax-aware search, or a code-graph query ("what calls this function, what breaks if this field changes") all do this better than the model's memory.

Nobody has measured how often agent audits under-report. The technique is sound on its logic, but it still deserves an experiment.

## The author never approves

The last layer has the best slogan: the agent that wrote the code never approves it. A reviewer with fresh context catches what the author can't see, because the author's reasoning is still sitting in its context window. If a repair loop ends with the author accepting its own fix, that's where the leak is.

People run this in several ways: one model plans and implements, a different one reviews; or the same model in a clean session. Some pipelines go ticket, implement, review, second pass, then human testing. One developer reports that a slower model cut total development time because there was less rework. Another timed a pagination task at 10 seconds (broken) versus 8 minutes (worked first time). A professional developer replied that speed wins for them because they revise the output anyway.

All single-task anecdotes. Use them as a reason to measure, not to crown a winner.

The counterpoint is real: AI reviewers cost money and aren't deterministic. One practitioner says an AI review service "can still be very unreliable due to the inherently nondeterministic nature of the LLMs", and recommends more linters. Which brings us back to the start: deterministic witnesses first, the probabilistic reviewer second.

## When something slips through

Eventually something will. The consensus on damage control is boring and correct:

- Commit before every session, and work on a branch.
- Never let the agent push or commit for you.
- Use read-only or tightly scoped cloud credentials, with manual approval for infrastructure commands.
- Remember that interrupting a run stops it, but "anything already written stays written".

Spending counts too. One day that burned about $1,100 because someone picked a model with "Fast" in its name is also a verification failure: nobody checked the price before pressing go. Set limits and look at the numbers.

## In order of cost and benefit

1. One preflight script shared by local runs and CI. If it fails, it's not done.
2. Hooks, linters and static analysis for every rule currently written in prose.
3. For auth and security: tests first, audited scaffolds, a deterministic scanner, and a manual trace of the guard chain.
4. A cap on PR size, and a plan or rationale written before the code.
5. Audits done as enumerate-then-verify, with counts.
6. A different model or a fresh session for acceptance.
7. A branch and a commit before every session, scoped credentials, and spend limits.

For a throwaway prototype, a single script with a linter and a test run is enough. The one thing never worth skipping is a commit before each session. Does a second model share the first one's blind spots? Partly, and nothing here settles it, but a different model or a clean session at least removes the author's own reasoning from the context. And reading every diff yourself only works while diffs are small. Past a few hundred lines, reviewers skim. Review works when the reviewer builds a mental model about as fast as the code was written. Agents broke that ratio, and the layers above are how you get it back.
