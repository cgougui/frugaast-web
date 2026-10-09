Thirteen. That's how many times a compliance rule was pushed into an agent's context during a single task. The agent broke it anyway.

Most people who write instruction files have a smaller version of this story: a "never touch the billing module" line, a ticket that says otherwise, and an agent that sides with the ticket. The usual reaction is to repeat the rule in capitals. It works about as well as it sounds.

## The rule was in context 13 times

A team runs a payments monorepo. A ticket asks for bigger gift cards. The agent raises the cap, opens issuance to every cashier, removes the admin validation step, and rewrites its own tests until everything is green. In the pull request it invents "compensating controls" to justify the change.

The compliance rule forbidding all of this had been pushed into context thirteen times during the task. The validation step it deleted had been written by the same agent eighteen tickets earlier.

Across sixty-four rules under observation, that was the only violation. It was also the expensive one.

The engineer who reported it had a clean explanation. The ticket is the most recent instruction. The rule is older context. When they conflict, the agent sides with the ticket, because that is what a text predictor does with a fresh, specific, imperative sentence. Their conclusion was that "something has to be able to refuse."

A smaller version: a weekend project's agent hits a 503 on a cold-start endpoint, notices an API key for a different paid service sitting in the repo, switches providers, and spends $40 on a job that should have cost under $5. Nobody did anything malicious. The agent hit an obstacle, found a way around it, and nothing in the system said no.

Everything below is about adding the things that say no, roughly in order from cheapest to strongest.

## What people actually put in AGENTS.md

An analysis of large open-source repositories found that about a quarter of the top thousand have an agent instruction file. In a sample of the biggest ones, around 90% are written in the imperative: must, always, never. There are hundreds of explicit "don't" bullets. One of the shortest files is thirty-five words, a rule about disclosing AI assistance in a commit trailer. Another says, more or less, "do not claim that an interrupted or timed-out test passed."

Nobody writes that last line in advance. Someone got burned first.

Engineers describe these files as "documenting past trauma", which matches what I've seen. One developer's file grew to about 150 lines over 34 days, and nearly every line traced back to a specific incident. Rules copied from classic software-engineering books are different: they are hypothetical, and the same engineers say strict rules without explanations get ignored.

Opinion is split on how much these files help. Some people find agents respond well to hard lines. Others point to the advice to keep instruction files under 200 lines and say many rules in popular repos "don't do anything in practice." I think both are right. A short file built from real incidents helps. A long one is a wish list.

Prose has a ceiling, and the gift-card story shows where it is.

## Match the mechanism to the cost of failure

The useful move is to stop treating every rule as the same kind of thing. Each constraint has a cost when it's broken, and the enforcement should match that cost.

| Kind of rule | Where it lives | Who enforces it |
|---|---|---|
| Preference ("use named exports") | Instruction file | The model, when it feels like it |
| Procedure ("how a release is cut") | A skill or runbook | The model, mostly |
| Must-never (delete data, add dependencies) | Hook, linter, CI check, permission | A script that can refuse |
| Secrets and spend | Environment scoping, provider caps | The provider |
| Invariants (validation must exist) | A protected check tied to the invariant | CI, with human sign-off |

The first two rows ask. The last three enforce. Most teams put last-three-row rules in the first row and are then surprised.

## Turn every "don't" into a linter

The cheapest tactic I've come across: whenever you're about to add a "don't do X" line, write a custom linter instead, and tell the agent to run all linters after every change and fix what fails.

You spend fewer tokens on negation, the check is deterministic, and the failure message is specific. Models handle a concrete error far better than a vague prohibition.

Teams that do this tend to converge on a similar list of checks the agent must pass before it can say it's done:

1. Type check the whole project.
2. Run dead-code and circular-dependency detectors (Knip, Madge and similar).
3. Fail on any new top-level dependency.
4. Fail on hardcoded URLs.
5. Run static security analysis and feed every failure back to the agent verbatim.

The same idea comes up in debates about applying a safety-critical coding standard to AI-written code: short functions, assertions, every return value checked, zero warnings, no recursion. Critics say it's a fine lint that misses the real problem, which is that the model doesn't know your codebase. Supporters say a model told to comply strictly does well in a fresh context.

The stronger argument is about volume. Human code was never clean either. But five agents can copy five messy patterns across ten repositories before one review finishes. Review didn't scale, so the shared rules had to become things the workflow can check by itself. As one engineer put it, make wrongness detectable by something other than your eyes.

## Hooks

Skills are requests too. A hook is code that runs at a defined moment (before a tool call, after it, on notification, at stop) and can block.

Experienced users call hooks "the only deterministic layer in an otherwise probabilistic system." The habit that goes with that is simple: "every time an agent makes a mistake you don't want repeated, turn it into a hook." One favourite: if the agent has tried the same thing twice and it isn't working, stop, reassess, and notify a human.

Hooks are underused because writing one feels like writing policy, and on solo projects mistakes are cheap. One engineer warned that hooks "in the wrong hands could get weird".

A concrete setup, which is useful precisely because it's boring:

- A Stop hook runs a readiness script when the agent says it's finished.
- The script works out what the diff touches, checks that tests exist for the changed code, runs them, and applies policy gates such as file length and module boundaries.
- A non-zero exit blocks completion, and the failure text goes back to the agent.

Hooks also help with token spend. One example redirects code navigation to a language server instead of text search, and claims about 600 tokens per answer instead of 6,500. The fair objection is that dynamic languages and generated files break symbol lookup, and savings only count if the success rate stays the same.

And a cautionary one. A strict hook asked the human for a budget before letting a long job continue. At 3 a.m. the human typed "whatever you need to nail this perfectly", and the morning brought an $800 bill. A gate that accepts a free-text override isn't a gate.

## Remove ambient authority

Back to the $40 cold-start story. Three things went wrong, and none of them had to do with prose. The spare key had no spend cap. Every credential in the environment was reachable. And the plan ("use the hosted endpoint") didn't say what to do if the endpoint failed.

The fixes people report are ordinary engineering:

- A written failure policy: on a 500 or 503, back off and retry, and never switch to a different paid service without asking.
- A hard per-key spend cap as a circuit breaker.
- Separate environment files per directory, loaded with something like direnv.
- Show the agent only the schema of the secrets file (names, no values), block reads and writes to the file itself, and give it a scoped run command.

Sandboxing comes with its own stories (exposed agent instances, malicious community skills, a container that didn't stay sealed), none of which I could verify. The principle doesn't depend on them: the less an agent can reach, the less it can chain together.

## Guard invariants, not file paths

Here's the subtle part of the gift-card case. A protected-file list wouldn't have helped, because the validation step was created by the agent during the run. It was never on any list. Any control born inside a run is unprotected by default.

The proposed fix is a rule tied to the invariant itself: removing an existing assertion or validation requires explicit approval at the ticket level, and the agent has no write access to the control. Tests need the same treatment. If an agent can rewrite tests until they pass, "tests pass" tells you nothing about changes to tests or guard code.

In practice that's a CI check that fails any diff deleting an assertion or validation, or touching a protected test directory, unless a human-signed label is attached.

A related harness pattern: the model emits a typed intent, the harness checks permissions and preconditions, attaches an idempotency key, executes, and checks a receipt on retry, with success judged by an independent check. The people who built it add a warning: chasing the perfect verifier can eat the whole project.

Where does the human fit? Some call "human in the loop" corporate theatre when the human has no context the agent lacks, because then it's a rubber stamp. Others say humans still catch dumb mistakes, like a second user table or a missing admin decorator. Both happen. A reviewer is a real gate only when they know something the pipeline doesn't.

## What no gate catches

Some failures are outside the reach of any of this. A SaaS prototype can pass every check and still break in production: an OAuth refresh edge case, a file size limit enforced only in the browser, missing email authentication records, missing database indexes. A healthcare MVP can end up rebuilt at three times the cost after a customer asks for compliance paperwork nobody planned for.

Is that the founder's lack of knowledge, or the tool's lack of knowledge about your regulatory environment? Both. These are gaps in the specification, and no hook fixes a requirement nobody wrote down.

The reasoning behind code has the same problem. A developer who can't explain why totals round the way they do has lost the reasoning, even if the code is intact. A cheap habit: before accepting a sizeable change, have the agent write two lines to a decisions file, saying what it's doing and what it's avoiding and why.

## Loops need a check, not a timer

Skeptics call "loop engineering" "guaranteed token burn with fingers-crossed results". The best reply I've seen: a failed cron job starts clean on its next run, but an agent loop that fails silently carries corrupted context forward. One report described a bad tool call poisoning three downstream cycles before an alert fired.

Cron is just the timer. The loop is the memory, the verification, the retries and the stopping rule, and it's only as good as the check at the end of each iteration.

That's also the best argument for the camp that says you don't need agents 90% of the time. A one-pass edit with hand-picked context and a reviewable diff needs none of this machinery. Autonomy should be earned by the structure of the task, and a loop is justified only when each iteration can be checked mechanically.

## Or don't grant the authority at all

Every step above puts a deterministic boundary around a probabilistic worker. You can skip half of them by not handing over the authority in the first place.

Pick the exact files that go into the prompt. Have the model propose changes as search/replace blocks. Apply them as a normal Git diff, read it, commit it. Pay with your own API key, so spend is visible per call and capped by the provider.

In that workflow nothing can delete a guard you didn't point it at, start a loop, find a spare credential, or rewrite a test out of view. It doesn't scale to unattended overnight work, and it demands more of your attention. For greenfield prototypes and throwaway scripts, autonomous agents are worth it. For a payments monorepo, a human reading a diff is the cheapest gate there is.

## Checklist

1. For every incident, ask whether a script could refuse it before you add more prose.
2. Cap spend per key and scope credentials per run.
3. End every session with a readiness script.
4. Don't let the agent edit the guards, or the tests of the guards.
5. Keep raw outputs when you filter them; a wrong "pass" badge hides the line that would have caught the problem.
6. Put failure policy (retry, stop, ask) in the harness, not the prompt.
7. Keep the instruction file short and tied to real incidents.
8. Keep a decisions file for the reasoning.

All of this is overhead that people who stick to one-pass edits never pay. Whether it's worth it depends on how much autonomy you hand out. Nobody has published good numbers on how much latency and token cost readiness scripts add, so for now that trade-off is a judgment call. A better prompt does lower the violation rate, and it's worth writing one. It just can't get the rate to zero, so anything expensive to break still needs something that can refuse.
