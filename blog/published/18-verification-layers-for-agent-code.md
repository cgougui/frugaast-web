# Don't Let the Author Grade Its Own Homework: Verification Layers for Agent-Written Code

Agents write code faster than a human can read it, and they also write the report that says the code is fine. The fix is to treat every "done" as a claim that needs a witness other than the one who made it.

> I once merged a branch that "passed everything" because the agent told me so, and found out in production that the auth guard logged the failure and carried on anyway. After that, I stopped asking whether the diff looked right and started asking who, exactly, had checked it.

## The lens: chain of custody

Think of a verification setup as a chain of custody. A claim ("this endpoint is protected", "all 40 icons use the right color") enters the system. Before it is accepted, it passes through witnesses. Some witnesses are reliable and boring (a compiler, a test runner, a linter). Others are charming and unreliable (the model that wrote the code, describing its own work).

The whole article is about one question: **who is allowed to say "done"?**

The answer that experienced developers keep arriving at is simple. Not the author. Never the author.

## Two failures that look fine

Start with the shapes of failure, because they explain why reading the diff stopped working.

The first is size. A team argues about when to review a feature built by one developer and one agent: roughly 7,000 lines across 40 files, produced in an afternoon. Someone names it "AI Comprehension Debt", code written faster than any human can comprehend it. The reviewer's mental model of the system normally grows at about the speed the code was written. The agent broke that ratio.

The second is polish. Generated auth code "looks correct at first glance". Then you notice:

- An auth middleware that logs the failure, and then calls `next()` anyway.
- A permission check that runs after the action instead of before.
- Validation that exists only in the frontend.

The professional formatting is the trap. It "creates false confidence". A human skims clean code differently than messy code, and agents never produce messy code.

So what replaces reading the diff when the diff is bigger than your working memory and looks like a textbook?

## Why the model's own report is not a gate

Here is the uncomfortable part. Asking the author to confirm its own work fails in ways that are structural, not occasional.

A custom audit skill reported 22 violations in six files. The developer fixed them and then found 35 more by looking at the running app. The cause was almost funny: some icons inherited the default accent color, so there was no pattern to search for. The auditor "couldn't find things that looked like nothing".

Others are blunter. One engineer says LLMs "will straight up lie to pass the test". Another, about pipelines: "AI lied or you forgot to check? Pipe will catch it." A frustrated developer calls the whole thing "a complete black box". The reply that stuck was to build as if you don't trust it, and be pedantic about whether the endpoint was actually built or whether the agent just thinks it was.

There is a fair counterpoint. Asking a model to hunt for auth-bypass vectors in code it just wrote does turn up real problems, if you frame the request adversarially. And the opposite worry is just as valid: generated tests miss the same gaps as the code, because both came from the same model with the same assumptions. Same-model review shares blind spots. It is a colleague who went to the same school, read the same books, and made the same mistake.

Useful, then. But not a gate.

## The witness table

Sorting witnesses by how much you can lean on them makes the design obvious.

| Witness | Deterministic? | Catches | Fails at |
|---|---|---|---|
| Compiler, type checker | Yes | Syntax, type errors | Anything semantic |
| Linter, static analysis | Yes | Rule violations, missing parentheses, dead code | Intent |
| Test suite in CI | Yes | Regressions, specified behavior | Behavior nobody specified |
| Hardcoded security scanner | Yes | Known risky patterns | Novel logic flaws |
| Fresh-context reviewer | No | Intent mismatches, over-engineering | Consistency from run to run |
| The author, re-reading its work | No | Typos, sometimes | Its own assumptions |

Everything above the line of "No" is a witness that cannot be talked into agreeing with you. A static analyzer has been catching missing parentheses for twenty years and has never once said "looks good to me" out of politeness.

## Layer 1: make the rules mechanical

Stop putting rules in prose. "LLMs are incredibly bad at following rules consistently", and a rule living in an instruction file is a suggestion. A rule living in a script is a fact.

The pattern that keeps coming up is one `preflight` script, the same one CI runs:

```
# scripts/preflight.sh  (same commands CI runs)
lint && typecheck && test && security-scan
```

The CI job calls the very same script. That detail matters more than it looks. If the local check and the pipeline are the same command, the agent's local claim and the pipeline's verdict cannot drift apart. "Preflight must pass before you commit" becomes an enforced sequence, not a hope.

A pleasant side effect: when the whole codebase follows one pattern and the pipeline enforces it, the agent follows the pattern too, without lengthy docs. Strict pipelines even push models toward simpler implementations, because the complicated version fails a lint rule.

Hooks give you the same thing earlier in the loop. A pre-commit hook or a tool-level hook blocks a bad action before it lands, not after.

Is this overkill for a solo developer? Some say yes: a full CI and PR ritual for a weekend project is heavy, so use hooks and a local script instead. Fair. But notice that the alternative is not "no verification". It is a cheaper version of the same deterministic witness.

## Layer 2: determinism for the dangerous parts

Auth and security deserve the most paranoid treatment, because that is where "looks right" does the most damage. Practices reported by people who got burned, with their trade-offs:

1. **Threat model first.** Write the rules down in plain words ("only admins or resource owners can access X"), then generate tests from the rules. Cost: you must think before you prompt.
2. **Write the 401 and 403 tests before the implementation.** Cost: slower start.
3. **Do not let the model invent auth.** Scaffold from an audited generator and let the model wire up proven patterns. Cost: less flexibility.
4. **Use a hardcoded scanner** with fixed risky-pattern rules, because the model should not execute security checks on its own honor. Cost: false positives, and it only knows yesterday's patterns.
5. **Trace the guard chain by hand.** "Security should always be reviewed manually." Cost: your time. Worth it.

A table-driven matrix is the cheapest way to catch the `next()` bug. Roughly:

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

That last assertion is the one that matters. A guard that only logs still lets the handler run, so the test checks that the side effect did not happen, not just that a status code came back.

One honest caveat: nobody has data on how often these bugs occur, and one skeptic called the worry "grasping at straws". Treat these as well-known categories, not measured rates.

## Layer 3: shrink what a human has to hold

Most experienced voices reject the premise of the big-branch debate. "Don't write 10k loc branches." Their answers cluster:

- A pull request should be in the 500 to 1,000 line range, then reviewed.
- Hold a short design review first, break the feature into tasks, and merge those into a feature branch.
- Have the agent produce a `PLAN.md` that gets reviewed before any implementation.
- Tie each change to a ticket with a one-line rationale written before the code, so review becomes "review of the rationales plus spot checks".

And then the fatalist: "You don't review, you just straight hit that approval button." Funny, because it is uncomfortably close to what happens when a 40-file diff arrives with green checks.

One practitioner estimates that high-context writing degrades beyond roughly 500 lines read and 100 added. That is an estimate, not a measurement, but the direction is credible: bigger context, vaguer attention.

There is also a cheap cleanup pass: treat the first draft as a draft. Ask for a cut-back with explicit constraints.

```
Reduce this change. Rules:
- no abstraction for code used once
- no configurability that was not requested
- no error handling for impossible scenarios
```

## The paradigm: keep the diff small by construction

Here is where deterministic tooling earns its keep. If a developer picks the exact files that go into the prompt, the change cannot sprawl into 50 files the developer never mentioned. The scope is fixed by hand before the model writes a character.

The output comes back as search/replace blocks, applied and committed as an ordinary Git diff. Nothing is hidden in an agent's long run. The reviewer sees the same artifact they have always reviewed, and `git diff --stat` shows the blast radius at a glance.

That is not an argument against autonomous agents. For a greenfield prototype, letting an agent roam is a perfectly good trade: speed beats rigor when the code might be thrown away on Friday. But for a mature codebase the economics flip. The cost of a wrong change is paid in review time and incidents, and a tool that limits scope by design makes the whole verification stack cheaper.

BYOK economics add one more benefit: per-call cost is visible. A review pass by a second model stops being a vague line on a subscription and becomes a number you can compare against the bug it caught. Opaque pricing and opaque verification have the same disease, which is that you cannot audit either.

## Layer 4: audits that are complete by construction

Back to the icon story. Why did the audit miss things? Because "find icons missing X" only finds violations the agent recognizes.

The technique that fixes it: **Enumerate first, then verify.**

1. Deterministic enumeration. A script or syntax-tree query lists every candidate: every route handler, every icon view.
2. Per-item verification. For each item in the complete list, check that X exists. A model or a test can do this.
3. Report counts. "Enumerated 112, verified 112." If the numbers differ, the shortfall is visible.

This turns an open-ended hunt into a membership check. The model no longer decides what exists. A search tool does. Plain `rg`, `fd`, a syntax-aware search, or a code-graph query ("what calls this function, what breaks if this field changes") all do this better than the model's recall.

One caution: nobody has measured how often agent audits under-report. The technique is sound on its logic alone, but it still deserves an experiment.

## Layer 5: the author never approves

The last layer is the one with the best slogan: the agent that wrote the code never approves it. A reviewer with fresh context catches what the author cannot see, because the author's reasoning is still sitting in its window. If a repair loop ends in self-acceptance, that is where the leak is.

Developers run this several ways: one model plans and implements, a different one reviews; or the same model in a clean session. Some pipelines go ticket, implement, review, second pass, then human testing. One developer reports that a slower model lowered total development time because rework dropped. Another timed a pagination task at 10 seconds (broken) versus 8 minutes (worked first time). A professional developer replied that speed wins because they revise output anyway.

All single-task anecdotes. Use them to motivate measuring, not to crown a winner.

And the counterpoint is real: AI reviewers cost money, and they are non-deterministic. One practitioner says an AI review service "can still be very unreliable due to the inherently nondeterministic nature of the LLMs", and recommends more linters. Which brings the stack back where it started: put the deterministic witnesses first, and the probabilistic reviewer second.

## When verification fails: contain the blast radius

Eventually something slips. The consensus on damage control is boring and correct:

- Commit before every session and work on a branch.
- Never let the agent push or commit for you.
- Use read-only or tightly scoped cloud credentials, with manual approval for infrastructure commands.
- Remember that interrupting a run stops it, but "anything already written stays written".

Spending is part of this. A single day that burned about $1,100 because someone picked a model with "Fast" in its name is a verification failure too: nobody checked the price before pressing go. Set limits, and look at the numbers.

## The checklist, in order of cost and benefit

1. One preflight script, shared by local and CI. Failing means not done.
2. Hooks, linters and static analysis for any rule currently written in prose.
3. For auth and security: tests first, audited scaffolds, a deterministic scanner, a manual trace of the guard chain.
4. A PR size cap and a plan or rationale written before code.
5. Audits as enumerate-then-verify, with counts.
6. A different model or a fresh session for acceptance.
7. A branch and a commit before every session, scoped credentials, spend limits.

Disagreements remain. Solo developers will always argue about overhead, and the value of AI review as signal versus noise is not settled. But the sharpest point in the whole debate is the ratio one: review works when the reviewer builds a mental model about as fast as the code was written. Agents broke that ratio. The stack above is how it gets repaired.

## FAQ

**Isn't a full verification stack overkill for a small project?**
For a throwaway prototype, yes, and a single script with a linter and a test run is enough. The stack scales down gracefully; the one thing worth never skipping is a commit before each session.

**If AI review is non-deterministic, why use it at all?**
Because it catches intent mismatches that linters cannot see, at the price of occasional noise. Treat it as a second opinion that sits behind the deterministic checks, never in front of them.

**Doesn't a second model just share the first model's blind spots?**
Partly, and no study here settles it. A different model or a clean session still removes the author's own reasoning from the window, which is a real gain even if it is not a perfect one.

**Why not just read every diff yourself?**
Because attention does not scale with output volume. Reading works when diffs are small and scoped; past a few hundred lines, reviewers skim.

## Key Takeaways

- Acceptance belongs to deterministic witnesses (CI, linters, scanners, enumerated counts), not to the model's own report.
- Keep the shape of the change small by construction: hand-picked files, a plan before code, and an ordinary Git diff.
- The author never approves its own work; put a fresh-context or different-model reviewer behind the mechanical checks, not instead of them.

*A claim without a witness is just a story the code tells about itself.*
