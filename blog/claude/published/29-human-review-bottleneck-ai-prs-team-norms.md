# The Reviewer Is the Bottleneck: Team Norms for AI-Generated PRs

Generating a pull request now takes minutes. Reading one carefully still takes the same human hours it always did. This article treats review as a queue with one slow server, and looks at the team rules that keep the queue from collapsing.

> I read a 90-file PR on Tuesday that its author could not explain on Wednesday. I did not get angry; I got arithmetic: he spent twenty minutes, I spent six hours, and the next one was already open.

## The lens: review as a queue

Forget code quality for a moment. Think about throughput. A queue has an arrival rate and a service rate. When the arrival rate rises tenfold and the service rate stays put, the queue does not get slightly longer. It grows without limit, and everything waiting in it goes stale.

That is the situation on many teams. Authors, now armed with coding assistants, produce diffs faster than anyone can read them. Tests, design notes and review replies are generated too. The reviewer is the only part of the pipeline still running at human speed.

Verification tooling (tests, CI, independent machine review) matters, but it is a separate topic. This one is about the human step: who is accountable, how big a change can be, and what management expects.

## The reviewer who announced he was done

A story that circulated widely among experienced developers: at a company meeting, a backend engineer announced he would stop reviewing AI-generated pull requests. The context was a familiar one. Analysts with a coding assistant had started sending web-framework PRs to the web developers, in a stack they did not know.

His reason was simple. The code "looks good and plausible," so problems are easy to miss, and the authors do not understand what they submitted. His follow-up is the best sentence in the debate: "Review breaks down when the reviewer becomes the only person reasoning about the system." He also clarified that his objection was to PRs from people who do not understand the output, not to AI use as such.

The pushback is worth hearing, because the debate is not one-sided.

- Many said no one should be raising a PR they do not understand, so the rule is already there.
- Others called it a weird hill to die on. The proper process, they said, is: request changes, ask for a split, approve when satisfied, and the author owns any miss.
- One engineer tried the same stance on a greenfield project and said it went badly once leadership started vibecoding huge PRs of its own.

Both camps agree on the core. The disagreement is whether a reviewer should refuse, or comply and document.

## Why generated diffs are harder to read

Reading a human diff gives you free signals. An odd data structure suggests someone had a reason. A tangle of complexity suggests a bug fix with a story. Reviewers used to apply a Chesterton's Fence instinct: do not remove it until you know why it is there.

Generated code erases those signals. It "looks good and plausible" by default. One engineer estimated that most of the time the unusual structure has no intent behind it, so tracing intent wastes time. A junior defending a data structure with "that's what it suggested" shows the old signal is gone.

Skeptics say humans always wrote showy code and review should have caught it. True. But volume changes the economics of catching it.

Heuristics that engineers reported:

1. Check the blame age of surrounding code, so you know what is old and deliberate.
2. Look for generated smells, such as one property checked under five spellings (`first_name`, `fname`, `firstName`, `f_name`) because the model did not know the real one.
3. Require "why" comments on anything non-obvious.
4. Read tests with more suspicion than production code.

A related irritation: generated suggestions undoing deliberate human work. One engineer had a hand-tuned optimization reverted because a chat assistant called it "unnecessary complexity," despite twenty explanatory comments. Another noted that strong developers now sometimes submit half-reviewed generated output, so every PR needs an extra careful look. Reading is harder than writing, and it always was.

## Three kinds of volume

### Code

A senior colleague opens a 90-file PR with no description after days of silence. Responses reported by reviewers: decline with "smaller, isolated chunks please"; ask for a design doc first; adopt a rule like "PRs over 30 files need a short writeup"; treat anything past 1,000 lines as a trigger for a split request or an explanation meeting. One lead described engineers shipping "5000+ diff" PRs daily and being blamed for slowing them down. Do the math: that is tens of thousands of lines a week that nobody on the team actually knows.

### Tests

The complaint was enormous generated test suites: over half of some diffs were tests, with 100% coverage targets. The disagreement here is real.

- **Tests are cheap now.** Skim them, delete or regenerate them when fragile.
- **Tests are first-class code.** Bad tests give false confidence and often assert implementation details. Reviewers should be more aggressive on tests than on production code. One example: a mock returning `null`, wrapped in a 200-line class with nine tests.

One practical tip worked for both camps: give the assistant a "ground zero" exemplar test to imitate, so style and level of mocking stay consistent.

### Prose

Tech plans, spikes and acceptance criteria that read like "word vomit." An AI-generated reply to a hand-written, twenty-minute review comment. The recurring reaction: "If you can't take the time to write this, why should I take the time to read it?" A suggested ask that has the virtue of being funny and practical: "send me the prompt."

The common thread is asymmetry. One person generates; another reads every page. One engineer called it content pollution, and the label fits.

| Artifact | Cost to generate | Cost to review | Reasonable norm |
|---|---|---|---|
| Large PR | Minutes | Hours to days | Size limit, description, split on request |
| Test suite | Minutes | Hours of suspicion | Exemplar test, no implementation-detail asserts |
| Design or plan prose | Minutes | Reader's time | Edit it down, share the prompt on request |
| Reply to a review comment | Seconds | Reviewer's patience | Write replies by hand |

## Who owns the diff?

The convergent rule across many discussions: AI use is fine, unvalidated output is not. "Doing a shitty job using AI is a red flag," said one engineer. Another: use of AI is not a red flag, trusting it implicitly is.

A telling case: a senior with the highest velocity on the team, who never reviewed anyone else's PRs and accepted a chatbot's diagnosis of a slow endpoint without running the in-house profiler or query tool. Colleagues pointed out the review debt he creates and that individual velocity is a bad metric. The sound framing, borrowed from a well-known engineer's writing, is that the job is delivering code "proven to work."

Norms proposed in these threads (not tested recipes, a synthesis):

- **Authors must be able to explain the change.** A walkthrough before review (a routine step before 2020).
- **Reviewers may bounce PRs** from authors who are unable to self-evaluate their changes.
- **Reciprocity.** If you generate PRs, you also take review turns.
- **Judge people by whether they can explain it.** One half-joking suggestion was "PR captchas that are code questions."

On refusal, the camps split again. Some say a hard line is emotive and career-risky. Others say that without one you "lose the entire codebase." Present both to your team; do not pretend there is a free option.

## AI as first pass, human as last gate

A common suggestion is to run an automated review before any human looks, either a structural critique or a review plugin in CI. One engineer said it "finds lots of issues it created," which neatly names the same-author problem (covered elsewhere). Another reported that an automated reviewer on a 150-file management-authored PR still left a long list of issues. A third complained that non-technical directors run an automated reviewer on PRs, and engineers then have to explain why its findings are wrong. Use pre-review as a filter, not a substitute.

A different flow came up in a thread about finding joy in the work: write the first pass yourself, or leave TODOs for the assistant, then have the AI review your work. Put scaffolds and templates in the repository that show "how it should be done."

And a warning about what review should look for. One engineer argued the biggest problem is architecture, not correctness: assistants never propose dropping a table. They add schema, converters, migrations and tests. Their fix was humans owning schemas and API specs while the AI fills in the rest. Others said skill atrophy is the bigger problem, the "GPS effect." Either way, review has to check what should not exist.

## The management mismatch

The title of one popular thread says it: "The AI burns the toast, I scrape it." Several engineers described being handed fully vibecoded PRs from management and finding that refactoring took as long as writing the thing. The incentive claim: the people shipping prompts do not sit with the knife.

Another version is the speedup mismatch. Advocates say the burden shifts to review, yet managers expect review to be faster too. Only part of a project is code, so an individual task that goes five times faster does not make the whole project five times faster. And throughput pressure is real: PRs "sitting for 3 weeks" create pressure to approve, and one company added "AI effectiveness" to its performance metrics.

Engineers reported several tactics, with disagreement among them: write concerns down before outages happen; confine vibe-coded work to demos and throwaways; "malicious compliance"; or simply collect a paycheck. None is endorsed here. Data points from published studies on comprehension and speed were also quoted, but a summary post's numbers were questioned, and readers asked for results with newer models. Check primary sources before citing.

What remains unsolved is the hardest part: no thread offers a way to prove review cost to leadership.

## A draft PR policy

Marked clearly as a draft, synthesized from these discussions:

```markdown
## PR rules (draft)
- Author can explain every changed file; reviewer may ask for a walkthrough.
- Over N files / lines: description + design note required, or split.
- Tests: no assertions on implementation details; delete boilerplate tests; link an exemplar.
- AI-written text (plans, replies) must be edited down; attach the prompt if asked.
- Authors of generated PRs take review turns on others' PRs.
- Review-time budget is tracked and visible to management.
```

Reviewer-side tactics to pair with it: form your own opinion of the design before opening the diff; read tests with extra suspicion; check "why" comments on odd code; use blame for age and author context.

## Shrink the queue before it forms

The best lever in queueing theory is not a faster server. It is smaller jobs and fewer arrivals. That is where the deterministic way of working fits.

When a developer picks the exact files for a request, the change is bounded by construction. A model that only sees four files cannot rewrite forty. The edit arrives as search/replace blocks, applied and committed as a normal Git diff, so the reviewer sees precisely what changed and nothing else. The author, having chosen the scope, can explain it, because they decided what the model could touch. And with a personal API key, each request has a visible cost, so a 90-file generation sprawl shows up as a number instead of a surprise.

Autonomous agents have a place. Greenfield prototypes and throwaway tools can tolerate an unread diff. A shared, long-lived codebase cannot. There, the cheapest review is the one for a small change by someone who knows exactly why every line is there.

## FAQ

**Isn't refusing to review generated PRs just resistance to change?**
It can be, which is why the better version of the rule targets unexplained changes, not the tool. Authors who can walk you through their diff are not the problem.

**Won't size limits just make people split one big change into twenty tiny ones?**
Sometimes. But a stack of small, ordered PRs is at least readable, and the author is forced to think about sequence.

**Can't an automated reviewer absorb this load?**
It can filter obvious problems, but it is graded by the same kind of system that wrote the code. A human still has to be the last gate.

**Do these norms slow teams down?**
Probably, in the short run, and managers will notice. The alternative is a faster pipeline feeding a codebase nobody understands.

## Key Takeaways

- Review is a queue; when generation speeds up and reading does not, the only sustainable fix is smaller, explained, accountable changes.
- Put the cost back on the author: explain every file, edit generated prose, split large PRs, and take review turns.
- Bound changes at the source by choosing what the model sees, and review plain diffs.

*A change nobody can explain is not finished, no matter how fast it was written.*
