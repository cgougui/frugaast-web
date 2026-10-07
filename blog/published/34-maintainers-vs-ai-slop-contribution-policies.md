# Closing the Door on Slop: The Economics of Reviewer Attention in the Age of Free Patches

Open-source review used to rest on a quiet assumption: whoever sends a patch or a bug report has spent more effort than whoever reads it. Generation is now nearly free, so that assumption has flipped, and maintainers are answering with policies, bans, opt-outs and closed bounties.

This article reads those responses as an attention economy problem: who pays, who gets paid, and which rules actually change the price.

> I once reviewed a 1,400-line pull request whose description was longer than the bug it claimed to fix, and I could feel my brain just shut down by the third duplicate helper. Rewriting it from scratch would have been faster than reviewing it, and that is the moment I understood the problem is economic, not moral.

## The ledger flipped

Picture a mature networking library maintained by four volunteers. For years it ran a small bounty program for security reports. Then the reports changed. A "proof of concept" that never touched the library at all. Repro steps that amounted to grepping the test and docs directories for private-key headers and the word "password". A report citing a chatbot's answer from two years earlier as evidence. Each one took a maintainer twenty minutes to disprove and the author thirty seconds to produce.

The maintainers did not add a filter. They ended the bounty.

That is the cleanest expression of the shift. A company's internal design document put the principle well: prose written by a language model breaks a "social contract" in which the writer is presumed to have done more work than the reader. Once that presumption fails, the reader has to re-verify everything, and re-verification is the expensive part.

The reviewer-side version sounds the same everywhere. A large, clearly generated PR, with trite comments, duplicate helpers and poor organization. The reviewer's verdict: "my brain just shuts down", and they would rather redo it than read it.

Hold onto the ledger metaphor, because every policy below is an attempt to move a cost from one column to another.

## What slop actually looks like

The word gets used loosely, so a taxonomy helps. These patterns recur across projects, anonymized here as composites:

- **Fabricated vulnerability reports.** Linter warnings fed to a model, which produces a "catastrophic threat narrative". A satirical RFC that circulated widely captured it: that is not a disclosure, and peers are not a free validation service for your model's output.
- **Feature PRs from people who cannot compile.** "Ask a chatbot for a feature, generate a diff, submit without building." Then a hostile reaction when it is rejected.
- **Internal phantom authors.** A team running a Java 21 service found `CompletableFuture` code using the default ForkJoinPool for I/O-bound work. The author's defense: "the assistant put it there." Same team, same quarter: tests with "full coverage" that contained duplicate asserts and needless mocks, and passed.
- **Drive-by PRs from the top.** An executive sends huge pull requests, one with 93 commits, to repositories they do not maintain, then never answers a review comment. Power dynamics plus volume.

A fair caveat. Much of this evidence is anecdotal, and titles in these discussions tend to overstate. In one case of a scientific library closing an agent-written PR, engineers pointed out that the PR was not closed for quality at all.

## Case study: the "good first issue" that a robot took

That scientific-library case deserves a closer look because it exposes a policy surface people forgot they had.

An agent, run by an operator, resolved an issue labeled for new contributors. The fix was fine. A top reply made the sharp point: the label exists to give humans an entry point, so a perfect agent fix still defeats the label's purpose. The title "rejected for being slop" was called unfair. Then the operator opened a second PR "with 100% more meat", which did not help.

The advice for handling it split in two:

1. Respond with "Slop", link your policy, close and lock. Under ten seconds.
2. Don't write long formal replies, because they eat maintainer time the contribution never earned.

Both views agree on the cost accounting. The only real disagreement is whether a template deserves a sentence of politeness.

The takeaway is practical: "good first issue" is a contract with humans. If a project wants it to stay human-only, it has to say so, because a bot cannot read intent from a label.

## The policy toolkit, priced

Here is the survey. Each mechanism targets a different column of the ledger.

| Mechanism | Example | Reported upside | Reported downside |
|---|---|---|---|
| Remove the incentive | A networking library ends its bounty | Kills the profit motive for fake reports | Penalizes honest researchers too |
| Disclosure plus reviewer opt-out | A compiler project: models fine to "answer questions, analyze, distill, refine, check, suggest, review. But not to create" | Keeps useful assistance; reviewers may decline LLM-generated content | Verbose; honest people disclose, dishonest ones do not |
| Outright ban | A small language project bans LLM contributions and moves its hosting elsewhere | Simple, easy to enforce | Looks tied to platform grievances; some see the tone as immature |
| Documentation | A kernel-scale project declines to take a stance in its docs | Avoids ideology | Bad actors do not read it |
| Judge the code, not the author | Maintainers who merge on quality alone | No detection needed | Does nothing for review load |
| Community-level ban | A programming forum tried a month-long ban, then limited AI posts to deeply technical content | Cleans the feed | Collateral damage: human-written posts auto-removed |
| Use AI on the maintainer side | AI-assisted triage and review | Catches things humans miss | "Sometimes spews nonsense" |

A few details from the table are worth unpacking.

The reviewer opt-out is the part engineers call key. A disclosure rule alone only filters honest contributors. A carve-out that lets reviewers decline LLM-generated content gives them a price lever: they can refuse the work without arguing about its quality. There was a counterpoint, too. The verbosity of such policies exists so maintainers never have to say "the quality just isn't there".

The documentation row matters because of a blunt remark from a veteran maintainer of a very large project: the slop problem is "NOT going to be solved with documentation". Experienced reviewers agree: people who submit slop do not read CONTRIBUTING files. That argues for enforcement, such as fast closure and account-level consequences, over longer documents. (Engineers disputed how that remark was framed, so treat it as a position, not scripture.)

Then there is the "judge the code" camp. One engineer said they cannot tell whether a PR was AI-assisted but can tell good code from bad, so they merge on quality alone. It is a respectable position. It also quietly ignores the entry-point argument above, and it ignores that discovering bad code costs the same reading time no matter who wrote it.

## Inside companies: "your PR, your responsibility"

The same economics play out in private repositories, with one difference: you cannot lock the issue.

Reviewers keep reporting the same unacceptable sentence: "that's just how the assistant did it." The culture that works is simple. The submitter owns every line. If you cannot explain why a design choice was made, you do not get to ask someone else to approve it.

A cynical coping strategy also showed up: approve everything fast, because cleanup is future employment. Take this as a warning sign, not a recommendation. It is what a reviewer does when the ledger is hopeless.

Two process failures illustrate what happens when nobody owns the review:

- **The co-author trailer saga.** A team shipping a developer tool merged a change that turned on an "AI co-author" commit trailer by default. Engineers noted no description, no ticket, an author who was a product manager, an AI-written summary, an AI review, and a merge without human pushback. A follow-up admitted the trailer ignored the setting that was supposed to disable AI features, and added attribution to changes that involved no AI. Some defended the product manager, pointing at the process rather than the person. That defense is right: a process that lets a default flip without a human who understands it is the bug.
- **Attribution as policy.** One view: crediting an AI tool is as odd as crediting autocomplete, except when the tool acted fully autonomously. Another raised a real risk. If commits falsely claim an assistant wrote them, a contractor under a "no AI" clause could be in breach on paper.

One organization reportedly announced a goal of having all output AI-generated and AI-reviewed by the end of the year. A single anecdote, but a vivid one: if every step is generated, then nobody is on the hook, and the accountability sink grows.

## When your own bot is the attack surface

Reviewing inbound content is one problem. Feeding inbound content into a privileged agent is a worse one.

A class of CI vulnerabilities was reported where untrusted text, such as issue bodies, PR descriptions or commit messages, flows straight into the prompt of an agent that holds powerful tools. The vulnerable pattern looks like this:

```yaml
prompt: "Review the issue: ${{ github.event.issue.body }}"
```

Anyone who can open an issue can now write instructions for an agent that may hold repository secrets and write access. Reports described this pattern in several large organizations, and fixes shipped within days once raised. Verify the specifics against the original report before repeating them.

Engineers reacted in two ways. Some asked why an LLM is in the pipeline at all, since CI is supposed to be deterministic. Others called it "SQL injection 2.0", which is accurate: data and instructions share one channel.

The mitigation direction is old wisdom with a new coat of paint. Restrict the agent's tools. Treat the model's output as untrusted. Scan workflows for the pattern. And a sketch that is general background, not from the discussion: pass issue text as a file to a summarizer that has no tools and can only emit a comment, rather than to a privileged agent that can push code.

## Is it "AI slop" or just bad contributions?

Engineers disagree here, and the disagreement shapes what a sensible contributor does.

One side: remove the AI part and the rule still holds. Low-quality work is rejected, always has been. The other side: the cost structure is different now because generation is free, and a rule that assumed a human typed it for an hour no longer protects anybody.

Both are right, which is why the ledger framing helps. The quality bar did not change. The price of producing something that merely looks plausible did.

Skepticism is also calibrated by vendor claims. When a company publishes a flashy demo, such as a browser or compiler built by agents, engineers sample the output, find that most commits do not build or that the result renders pages with bugs, and update their prior. After a few of those, a maintainer's default stance on a big autogenerated PR is not hostility. It is Bayesian.

Some second-order worries should be presented as opinion, not fact: that library choice drifts toward whatever is popular in training data, that LLM-driven rewrites raise licensing doubts, and the view that agents are fine for private forks but the result should never be sent upstream.

## The agentless contributor

There is a way to read all of the above as an argument for the deterministic, human-in-the-loop workflow.

Slop is, at its root, unscoped generation. The author handed a task to an autonomous loop, did not choose which files mattered, did not read the result, and sent the diff. A contributor who picks the exact files that go into the prompt, asks for a Search/Replace block, applies it as an ordinary Git diff, and reads that diff line by line will produce a small PR that they can defend. They also know what each call cost, because they brought their own key and can see the ledger.

That is not purity. An agent that explores a throwaway prototype is fine, and a private fork can be whatever you like. But a patch headed for someone else's repository is a request for their attention, and the minimum price of that request is that you read it first.

## Checklists

**For contributors who use agents:**

1. Read CONTRIBUTING and any AI policy first. Respect the intent of "good first issue".
2. Be able to explain every design choice. "The model did it" ends the conversation.
3. Run the project's build and tests yourself and show the output. Never submit an unbuilt diff.
4. For security reports, reproduce against the real project, include a working proof of concept and paste no model narrative.
5. Disclose tool use when asked, keep the PR small and answer comments.

**For maintainers and team leads:**

- Publish a short, enforceable policy (disclosure plus reviewer opt-out) and a canned close response.
- Decide whether bounties, first-issue labels and bots are still worth their review cost.
- Require a description and a linked issue for every change, including from non-engineers and executives.
- Test your kill switches. A setting that does not do what it says is worse than none.
- Never pass untrusted text into a privileged agent in CI.

## FAQ

**If I cannot tell AI code from human code, how can a disclosure rule work?**
It cannot be perfect, and I would not claim otherwise. Its value is social: it gives honest contributors a clear norm and gives reviewers a legitimate reason to decline.

**Isn't banning AI contributions just Luddism?**
Sometimes, but often the ban is a pragmatic response to review capacity, not a theory about technology. A maintainer with four hours a week has to spend them somewhere.

**Why not simply merge anything that passes tests?**
Tests only catch what someone thought to check, and generated tests can pass while asserting nothing. Passing tests also say nothing about whether the maintainers want to own the code forever.

## Key Takeaways

- Free generation flipped the effort asymmetry, so every policy is really a way of moving cost back onto the sender.
- Enforcement beats documentation: fast closure, reviewer opt-outs and removed incentives work where long rulebooks do not.
- Contributors who scope context by hand, read their own diff and can defend every line stay welcome in any repository.

*Attention is the only resource in open source that nobody can fork.*
