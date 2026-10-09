A free model doesn't announce when it's leaving. It works for three weeks, then one Tuesday it's gone, and the fallback starts breaking code that worked the day before.

That's a common story. A free, anonymous checkpoint behind a harness with swappable providers is fast, and one enthusiast called it "100% frontier level", with "nothing free comes even close". Then it's gone, with no migration guide. The harness falls back to another model, which starts introducing bugs into working code. A second developer reports the same thing. A third says the free model hallucinated so badly that a live project had to be recovered by hand.

The replies in those threads always say the same two things. "Version control," with a sigh. And: "do you have rules set out for the project?"

Both are right, and both miss the point. Picking a free model isn't just a cost decision, it's a dependency decision. The "free" label tells you nothing about who serves the model, who keeps your prompts, or how long it will be around. You end up paying in four other currencies:

- **Identity.** Which model is actually answering.
- **Data.** What gets kept, and what it's used for.
- **Continuity.** Whether the model, the limits and the capacity are still there next week.
- **Your work in progress.** What a weaker substitute does to the code the previous model wrote.

## Identity: you aren't told what you're running

Stealth slots exist so labs can test models in the wild. Fair enough. It also puts you inside someone else's experiment.

Take a slot nicknamed after a pickle. In mid-August, users noticed a change: faster responses and shorter reasoning than earlier in the summer. A guessing game followed. A cheap flash-tier model? A mid-sized open-weight one? A fine-tune from another family? "A router that routes to cheap models depending on the task and price"? The most sober answer: "officially it's still just a stealth slot, not a named checkpoint". Nobody actually knew.

The behavior was unstable too. One user's slot answered in a language they never asked for. Another said it "went offline for a few hours and came back having had a prefrontal lobotomy", and mostly recovered about a week later.

A second case taught something different. A slot with "Alpha" in its name sparked speculation that it was built on a famous vendor's models. A developer debugging it pointed out that the name only meant it spoke that vendor's API format. None of it was verified, but the practical point stands: an endpoint that accepts one vendor's request format can be serving anything.

Without knowing the model, you can't pin a version. Without a version, you can't reproduce a result. And without that, you can't answer the question you ask every day: is it the model, or is it me?

One suggested test is to run the same prompt against a named model and compare style and failure modes. That's a heuristic, not proof.

## Data: contributor tiers, training, and what "zero retention" covers

This is the one that makes legal departments nervous.

Some plans give you a discount in exchange for permission to use your traffic. One contributor tier was called "currently the best option for price/performance". Another user asked bluntly about "the version that spies on us" and only used it for public data: web research, classification. The reply that sums up the safe attitude: "assume every in/out is recorded".

There are two camps, and I don't think either is wrong.

**An acceptable price for non-sensitive work.** One developer is happy for the lab to train on "all the non personal data" from boring local test loops. Public repo, throwaway script, who cares.

**Trust nobody.** Another argues you can't trust any cloud provider, wherever it's based. A third builds with API keys and private repositories and can't find any statement on how sensitive data is protected.

It gets murkier when one model is sold three ways: a free plan, a paid plan from the same harness, and a direct API from the lab. One user claimed the free plan and the lab's API both train on your data while the paid plan doesn't. But is the model hosted by the harness, or routed to the lab? If it's routed, each provider's policy applies separately. Another user said none of the options offer zero data retention, so paying only supports the lab.

Zero data retention (ZDR) is what people say they're paying for. One subscriber stays "only because of ZDR". Another lists "0 day data retention, no training on most models" as a perk, then adds the caveat that matters: "unless they lie". Terms change, too. One post thanked a provider for putting a model back on "no model training / no data retention", which means it was something else for a while.

My rule of thumb: read the provider's actual terms, not a stranger's summary, and follow the chain. Who hosts the model? Does your request pass through a third party? If you can't tell, assume the worst.

### The leak that isn't the model host

Data can also leave through the harness. Imagine a tool with a "learns your style" feature. It reads your git diffs and corrections, sends them to the selected model, writes the resulting preferences to a Markdown file, and injects that file into future prompts. Reasonable idea. Now suppose it scans git history without applying the filter it uses on the working tree for `.env` files, private keys and credentials. A secret you deleted two years ago is still in history, and it ends up in a request.

A case shaped like this was reported, from one side only, and the author stressed it didn't prove intent. The general lesson: before enabling any feature that learns from your repository, find out what it reads (the history, not just the checkout) and where that data goes. One workable defense is to run such features in a clone with squashed history.

### Check what would be sent

Before putting a repo on a data-for-discount model:

1. List the files likely to end up in a prompt: the diff, the rules file, the config.
2. Search the working tree and the git history for keys, tokens and `.env` contents.
3. Check what any "memory" or "style" feature is allowed to read.
4. Decide how sensitive the code is (see the table below) before choosing the model.

## Continuity: the free lineup moves, and so do the limits

A free model "just stops all the time". One agent's own analysis of its logs said: "sometimes free stuff just works bad, just spam continue". It works while one continent sleeps and becomes unusable later. Users blame popularity: "it was awesome right after the announcements". Yet one user reports a single failure in forty million tokens, so reliability varies by hour and region.

The same stop-before-finishing problem hits paid setups too. Subagents come back empty. A mid-task failure costs thirty-five cents and delivers nothing. A status page says everything's fine while nothing works. The free tier fails first, not only.

Then there's the lifecycle:

- A model described as "true unlimited" at high speed gets removed.
- The recommended free list changes every few weeks.
- A stealth model gets pulled in a pull request, and the reaction is "it wasn't there for long".

Access rules change too. A free tier that only works inside the vendor's own harness. A free limit that never resets until you move to a new major version with a new key. An `encrypted_content` error, with workarounds ranging from compacting to starting a new session, and a warning that restarting the connection makes the agent repeat work.

The ceilings are real, if fuzzy. One user reports over twenty million tokens before the cap; another, thirty-five to forty million. Replies point out that twenty million isn't much on a medium codebase, and that "1B tokens are not enough" for a heavy user. The free variant also capped context at 200k.

In fairness, several developers say the free flash-tier model is perfectly usable. Free isn't necessarily bad. It's just unscheduled.

## Your work in progress: the handoff

Back to my Tuesday. The real damage wasn't losing the free model. It was the handoff.

When one model writes a codebase and a different one continues it, the second inherits conventions it never saw, tests it didn't write, and assumptions that only existed in a long session. A weaker substitute makes confident edits to code it half understands. One gloomy take: "if you built something with previous good models, just stop right now" unless you're paying. That's an overreaction. The practical version is calmer:

- **Commit before every model switch.** A tagged checkpoint costs nothing, and any damage becomes a normal Git diff you can read, revert or cherry-pick.
- **Keep the rules in the repository, not the session.** If conventions live in a file, the next model reads them. If they live in a chat history, they died with the model.
- **Use free models for work that can tolerate loss.** Public-data research, classification, review passes, or a cheap workhorse behind a stronger model that writes specs and checks the work.

A deterministic workflow gives you this safety net by default. You choose the files that go into the prompt. The model returns search/replace blocks. You apply them and commit through ordinary Git. If the next model is worse, `git diff` shows it in seconds and `git revert` undoes it. There's no hidden agent state to rescue and no session that gets "cursed", because the project doesn't live in the session.

Autonomous agents have real strengths. For greenfield prototyping, throwing a free model at an empty folder is a fair way to explore. But the longer a project lives, the more a silent substitution costs, and the more you want to control it through files and diffs rather than a conversation.

### Routing around the hole

Some people build fallback ladders: a local gateway that falls through subscription, API keys, cheap models and free models, with circuit breakers. Others set up a balance-based fallback so hitting a limit rolls into pay-as-you-go. A common pattern is free models for small-context tasks and paid ones once the context grows. One user describes the split plainly: a premium model writes the spec and checks the work, and the cheap plan is "the workhorse".

As an illustration: a provider block pointing at the local gateway, a small free model only for titles and summaries, and a pinned, named, paid model for the main work. Gateway users add a caveat: "speed is not the best".

## The paid middle: privacy, or just a discount?

Paying a modest monthly fee changes some of these costs and not others.

According to subscribers, a mid-priced routed plan buys you stated no-training on most models, zero retention (always with caveats), a rotating lineup, and a fallback to your balance. It doesn't buy you a stable allowance. In one case, the allowance for a popular cheap model was halved when its successor launched; elsewhere, per-model allowances were cut to a quarter. The discount moves too.

People also doubt the quality, with suspicions of nerfing and quantization. The sober reply: "they don't quantize themselves, but those providers can". Nobody produced a benchmark either way.

One more incident: a cheap model that suddenly started printing cryptic text. Suggested causes ranged from prompt injection through a fetched file to an API problem. It was never resolved. Unknown serving stacks are hard to debug precisely because you can't see inside them.

## Match the model to how sensitive the code is

| Tier | Code | Acceptable options | Non-negotiable |
|---|---|---|---|
| 0 | Public or throwaway (open source, demos) | Free, stealth and contributor models | A Git checkpoint before every model switch |
| 1 | Private, few secrets | A paid plan with a stated no-training policy | Read the provider chain; strip secrets and history before any "learns from your repo" feature |
| 2 | Client work, regulated, or credentials in the environment | A provider whose contract you can read, or local models | No stealth models, no contributor tiers |

And the operational side:

1. Name and pin the model. Check what actually ran, not the label.
2. Keep a fallback that doesn't depend on the same free pool.
3. Test the failure modes (empty subagent replies, odd errors) before a long unattended job.
4. Write rules into the repo, not the session.
5. Ask every "free" or "contributor" offer five questions: who hosts it, what's retained, is it used for training, is there an opt-out, and what happens to a running session when it's removed?

Use your own key where you can. Direct billing on a named model gives you an itemized cost, a contract to read, and one less party between your code and the weights.

Every provider could, in theory, lie about retention. Reading the terms is still worth it: a written term is something you can cite, audit, and leave over. A paid plan is partly the same trade with fewer surprises, not none. And running everything locally is a fine answer for the sensitive tier, at the cost of weaker models and your own hardware bill. Choose by how sensitive the code is, not by ideology.
