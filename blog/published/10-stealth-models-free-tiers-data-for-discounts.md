# Paying With Your Code: The Real Price of Stealth Models, Free Tiers and Data-for-Discount Plans

A model that costs nothing, or less than the vendor's own API, is paid for somewhere else. This article treats "free" as a risk register: four currencies you may be spending, who disagrees about them, and which hedges hold up.

> I spent three weeks building on a free anonymous model, it vanished on a Tuesday, and the fallback quietly broke code that had been working the day before. It took me an afternoon to realise the model was not the only thing I had lost.

## The Tuesday the free model disappeared

Picture a developer on a mid-sized side project. For a few weeks the assistant is a free, anonymous checkpoint behind a harness with swappable providers. It is fast. By one enthusiast's verdict it is "100% frontier level", and "nothing free comes even close".

Then it is gone. No migration guide. The harness falls back to another model, which starts introducing bugs into code that worked yesterday. A second developer reports the same pattern. A third says the original free model hallucinated so badly that a live project had to be recovered by hand.

The replies in that kind of thread are always the same two lines. "Version control." Said with a sigh. And: "do you have rules set out for the project?"

Both are right, and both miss the point. A free model is not only a cost decision. It is a dependency decision. The "free" label tells you nothing about who serves the model, who keeps your prompts, or how long it will exist.

Four currencies get spent when you take the offer:

- **Data.** What is retained, and what is it used for.
- **Identity.** Which model is actually answering.
- **Continuity.** Whether the model, the limits and the capacity are still there next week.
- **Work-in-progress safety.** What a weaker substitute does to the code the previous model wrote.

One at a time.

## Currency one: identity (you are not told what you are running)

Stealth slots exist to test models in the wild. Fair enough. It also puts you inside someone else's experiment.

Take a slot nicknamed after a pickle. Users noticed a mid-August change: faster responses, shorter reasoning traces than the long ones from earlier in the summer. A guessing game followed. A cheap flash-tier model. A mid-sized open-weight one. A fine-tune of another family. "A router that routes to cheap models depending on the task and price". The most sober answer: "officially it's still just a stealth slot, not a named checkpoint".

Nobody had ground truth.

The behaviour was unstable too. One user's slot answered in a language they never asked for. Another said it "went offline for a few hours and came back having had a prefrontal lobotomy", and mostly recovered about a week later.

A second case teaches something different. A slot with an "Alpha" name sparked speculation that it was built on a famous vendor's models. A developer debugging it pointed out that the name only meant it spoke that vendor's API dialect. Unverified, all of it. The practical point: an endpoint that accepts one vendor's request format can be serving anything.

Why does this matter? Without identity you cannot pin a version. Without a version you cannot reproduce a result. And without reproducibility you cannot answer the daily question: "is it the model, or is it me?"

One suggested test: run the same prompt against a named model and compare style and failure modes. A heuristic, not proof.

## Currency two: data (contributor tiers, training, and what "zero retention" covers)

Now to the one that makes legal departments twitch.

Some plans trade a discount for permission to use your traffic. One contributor tier was called "currently the best option for price/performance". Another user asked bluntly about "the version that spies on us" and restricted it to public data: web research, classification. The reply that sums up the safe attitude: "assume every in/out is recorded".

Opinions split into two camps, and it is worth presenting both without adjudicating.

**Camp one: an acceptable price for non-sensitive work.** One developer is happy for the lab to train on "all the non personal data" fed into boring local test loops. Public repo, throwaway script, who cares.

**Camp two: nobody should be trusted.** Another argues you cannot trust any cloud provider, wherever it is based. A third builds with API keys and private repositories and cannot find any statement on how sensitive data is protected.

It gets murkier when one model is sold three ways: a free plan, a paid plan from the same harness, and a direct API from the lab. One user claimed the free plan and the lab's API both train on your data while the paid plan does not. But is the model hosted by the harness or routed to the lab? If routed, provider policies apply separately. Another said neither option offers zero data retention, so paying only supports the lab.

Zero data retention (ZDR) is what people say they pay for. One subscriber stays "only because of ZDR". Another lists "0 day data retention, no training on most models" as a perk, then adds the hedge that matters: "unless they lie". Terms also move: one post thanked a provider for returning a model to "no model training / no data retention", which implies it was something else for a while.

Rule of thumb: read the provider's actual terms, not a stranger's paraphrase, and read the chain. Who hosts the model? Does your request touch a third party? If you cannot tell, assume the worst.

### The leak that is not the model host

Data can leave through a second door: the harness. Imagine a tool with a "learns your style" feature. It reads your git diffs and your corrections, sends them to the selected model, writes the resulting preferences to a Markdown file, and injects that file into future prompts. Reasonable idea. Now suppose it scans git history and does not apply the same filter it uses on the working tree for `.env` files, private keys and credential files. A secret you deleted two years ago is still in history. It would land in a request.

A reported case of this shape was one-sided, and its author stressed it did not prove intent. Treat it as a worked example, not a verdict. The lesson is general: before enabling any feature that learns from your repository, find out what it reads (history, not just the checkout) and where that goes. One workable defence is to run such features in a clone with history squashed.

### A one-page "what was sent?" audit

Before putting a repo on a data-for-discount model:

1. List the files that would plausibly enter a prompt: the diff, the rules file, the config.
2. Search the working tree and git history for keys, tokens and `.env` content.
3. Check what a "memory" or "style" feature is allowed to read.
4. Decide the code's tier (see below) before choosing the model.

## Currency three: continuity (the free lineup moves, and so do the limits)

A free model "just stops all the time". The agent's own log analysis said: "sometimes free stuff just works bad, just spam continue". It works while one continent sleeps and is unusable later. Users blame popularity: "it was awesome right after the announcements". Yet one user reports a single failure in forty million tokens, so reliability varies by hour and region.

The same stop-before-finishing symptom hits paid setups too. Subagents return empty. A mid-task failure costs thirty-five cents and delivers nothing. A status page says all is well while nothing works. The free tier fails first, not exclusively.

Then there is the lifecycle.

- A model described as "true unlimited" at high speed is removed.
- The recommended free list churns every few weeks.
- A stealth model leaves via a pull request, and the reaction is "it wasn't there for long".

Access rules shift as well. A free tier that works only inside the vendor's own harness. A free limit that never resets until you migrate to a new major version with a new key. An `encrypted_content` error, with workarounds from compacting to starting a new session, and a warning that restarting the connection makes the agent repeat work.

The ceilings are real, if fuzzy. One user reports over twenty million tokens before the cap; another, thirty-five to forty million. The replies: twenty million is not much on a medium codebase, and "1B tokens are not enough" for a heavy user. The free variant also had a 200k context cap.

Fairness demands a counterpoint: several developers say the free flash-tier model is perfectly usable. The claim is not that free is bad. It is that free is unscheduled.

## Currency four: work-in-progress safety (the cursed handoff)

Back to the Tuesday. The real damage was not the loss of the free model. It was the handoff.

When one model writes a codebase and a different one continues it, the second inherits conventions it never saw, tests it did not write and assumptions that lived in a long session. A weaker substitute makes confident edits to code it only half understands. One gloomy rule: "if you built something with previous good models, just stop right now" unless you are paying. That is the over-reaction. The pragmatic version is less dramatic:

- **Commit before every model switch.** A tagged checkpoint costs nothing and makes any damage a standard Git diff you can read, revert or cherry-pick.
- **Keep the rules in the repository, not in the session.** If the conventions live in a file, the next model reads them. If they live in a chat history, they died with the model.
- **Use free models for work that tolerates loss.** Public-data research, classification, review passes, a cheap workhorse behind a stronger model that specs and verifies.

A deterministic workflow gives you this safety net by default. You choose the files that enter the prompt. The model returns Search/Replace blocks. You apply them and commit through ordinary Git. If the next model is worse, `git diff` shows you in seconds, and `git revert` removes it. There is no hidden agent state to rescue, no session that gets "cursed", because the session is not where the project lives.

Autonomous agents have genuine strengths: for greenfield prototyping, throwing a free model at an empty folder is a fair way to explore. But the longer a project lives, the more a silent substitute costs, and the more you want your control surface to be files and diffs rather than a conversation.

### Routing around the hole

Some people build ladders: a local gateway that falls through subscription, API keys, cheap models, free models, with circuit breakers. Others keep a balance-based fallback so a hit limit rolls into pay-as-you-go. A common pattern is free for small-context tasks, paid once context grows. One user states the division of labour plainly: a premium model specs and verifies the work, and the cheap plan is "the workhorse".

A config sketch, as illustration: a provider block pointing at the local gateway; a small free model for titles and summaries only; the main model a pinned, named, paid checkpoint. A caveat from gateway users: "speed is not the best".

## The paid middle: privacy, or just a discount?

Paying a modest monthly fee changes some currencies and not others.

A mid-priced routed plan plausibly buys, per subscribers: stated no-training on most models, zero retention (repeatedly caveated), a rotating lineup, and a fallback to balance. It does not buy a stable allowance. In one case the allowance for a popular cheap model was halved when its successor launched; elsewhere, per-model allowances were cut to a quarter. The discount side of the deal moves too.

Quality is doubted too, with "nerf" and quantization suspicions. The sober reply: "they don't quantize themselves, but those providers can". Nobody produced a benchmark. Say so out loud.

One more incident: a cheap model that suddenly printed cryptic text. Suggested causes ranged from prompt injection through a fetched file to an API problem. No resolution. Unknown serving stacks are hard to debug precisely because you cannot see inside.

## Decision table by code sensitivity

| Tier | Code type | Acceptable options | Non-negotiables |
|---|---|---|---|
| 0 | Public or throwaway (open source, demos) | Free, stealth and contributor models | Git checkpoint before each model switch |
| 1 | Private, low-secret | Paid plan with stated no-training | Read the provider chain; strip secrets and history before any "learns from your repo" feature |
| 2 | Client, regulated, or credentials in the environment | A provider whose contract you can read, or local models | No stealth, no contributor tiers |

And the operational checklist that goes with it:

1. Name and pin the model. Check the run, not the label.
2. Keep a fallback that does not depend on the same free pool.
3. Test the failure mode (empty subagent replies, odd errors) before a long unattended job.
4. Write rules into the repo, not the session.
5. Ask every "free" or "contributor" offer five questions: who hosts it, what is retained, is it used for training, is there an opt-out, and what happens to an in-flight session when it is removed?

Bring your own key where you can. Direct billing on a named model gives you the itemised cost, a contract to read, and one fewer party between your code and the weights.

## FAQ

**Is "free" ever actually safe for real work?**
For public or throwaway code with a Git checkpoint behind it, often yes; for anything private, the missing guarantees on retention and continuity are the real price.

**If every cloud provider can lie about retention, why bother reading terms?**
Because a written term is something you can cite, audit and leave over, whereas a vague promise gives you nothing; it narrows the risk, it does not erase it.

**Isn't a paid plan just a prettier version of the same trade?**
Partly. You trade less data risk for allowances that can still shrink and hosts you did not choose, so paid buys fewer surprises, not none.

**Why not run everything locally and skip the whole ledger?**
You can for sensitive tiers, at the cost of weaker models and your own hardware bill; the right mix is by code sensitivity, not by ideology.

## Key Takeaways

- Free and discounted models are paid for in data, identity, continuity and work-in-progress safety, so pick the currency you can afford to spend per project.
- Treat every model switch as a deployment: commit first, keep rules in the repo, and rely on reviewable Git diffs rather than session state.
- Match the model to code sensitivity, read the provider chain, and keep a fallback that does not share the free pool.

*Nothing is free in software; the only choice is whether the invoice arrives in dollars or in surprises.*
