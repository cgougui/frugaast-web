Two hundred agent roles configured. Twenty ever used. That's what one team found in a repo someone had "vibe engineered" for three months, along with dozens of skills and more documentation than code.

The rest of the numbers make a new owner sit down: about 280k lines of code, 190k lines of documentation, files over 5,000 lines, and more than a million lines of markdown logs written by agents about their own activity. There are 40-plus secrets in the environment, and exactly 2 are needed.

Asset or liability? Experienced developers say "it depends". Someone will point out that the original builder probably had real product context, and that both heavy and light approaches have their place. Fair. I'm not arguing that extending your tools is a mistake. I'm arguing that every extension should be able to answer three questions:

1. What does it cost to run, every session?
2. What evidence says it pays off?
3. How does it fail when nobody's watching?

What follows comes from about fifteen public discussions among working engineers. Most of it is comment-level: anecdotes under complaint threads, not controlled measurements. Where the evidence is thin, I say so, and the "confidence" column matters more than any other.

## At a glance

| Mechanism | Typical use | Evidence it pays off | Running cost | How it fails | Confidence |
|---|---|---|---|---|---|
| Notification and status hooks | Know which session needs you | Strong for parallel sessions | Near zero | "Neat, not useful" | Medium |
| Destructive-command gates, deny lists | Stop `rm -rf`, volume wipes | Strong, after incidents | Near zero | Gaps in matching, no shared scripts | Medium |
| Settings flags (attribution) | Remove noise from commits | Small, clear | Zero | Key names change | High |
| Minimalism skills | Make the agent write less code | Author's benchmark only, 5 tasks | Tokens on every task | Hides edge cases | Low |
| Output styles for verbosity | Fix the model's prose | Split | A week of tuning | Doesn't reach code comments | Low |
| Auto memory, "dream" consolidation | Keep notes across sessions | Unmeasured | Background tokens | Silent usage burn | Low |
| Subagent fan-out, nesting, workflows | Parallel research and coding | Mixed | Highest reported | Errors spread, runaway spend | Medium |

Cheapest first.

## Hooks that only watch

A hook is a script the agent runs at a set moment: before a tool call, after it, at the end of a session. The cheapest use is just watching.

One developer wired a red, yellow and green light to session state. Red means waiting for confirmation, yellow means running, green means idle. Reactions were mixed; "neat, not useful" was the polite version. The replies were the interesting part, because they listed everything people already use for the same job: a notification hook, a chat message to a phone, a push notification from the remote-control feature, a programmable button per session that turns red when it needs attention, and the plain old statusline.

The real value here is data. One person wanted usage history per command to prove that limits drain faster after certain actions. That's only possible if you logged events in the first place.

Cost: almost nothing. Risk: almost nothing. Failure mode: you built a light nobody looks at. Keep it, and log everything.

## Guardrail hooks and settings

Nobody installs a deletion gate on day one. They install it after an agent asked to "create a backup" wrote it to the wrong directory and then wiped the drive, or after "clean up unnecessary files" took out personal documents, or after a suggested `docker compose down -v` erased weeks of local database state. The `-v` flag deletes named volumes, and as one engineer noted, a one-letter flag with that much power is dangerous in Docker itself.

The reported fixes are short:

- a hook on destructive commands that forces an approval step
- `rm -rf` in the permissions deny list
- the automatic classifier mode
- a sandbox container with only the project directory mounted
- separate production and pilot servers, with backups the agent can't reach

Some blamed the setup ("why did it have access to your whole PC?", "backups, backups"); others said a tool that can do this needs a gate that isn't made of prompt. Both are right, and that's why the cheap deterministic version wins. A deny list doesn't read context, can't be persuaded, and doesn't drift over a long session.

One caveat: nobody in these threads posted a working hook script. What follows is general background, not thread evidence. A `PreToolUse` hook receives the tool call as JSON on standard input, inspects the command string, and exits with a blocking status if it matches a pattern like `rm -rf` outside the project root or `docker compose down -v`. That's about fifteen lines of shell. The weakness is obvious: pattern matching misses creative spellings. Treat it as a net with big holes, and put the real protection in the permission layer and in backups.

Keep it. The best payoff per line of config on this list.

## A config key beats a prompt sentence

Two threads, months apart, ask how to stop the agent adding itself as co-author. In March the key was `includeCoAuthoredBy: false`; by July it was an `attribution` block in `settings.json` with empty strings for commits and pull requests. The disagreement was the useful part. Some developers want the line gone. Others want it kept for honesty. One said some companies track AI usage, so individual contributors want it visible in the pull request. Another summed up the mixed message: you're supposed to use AI, but not admit it.

The lesson here is smaller. A config key replaced a paragraph of "please never write Co-Authored-By" in an instruction file, and it works every time. Zero cost, clear evidence. The catch is that the key name changed between the two threads, so copying advice from a six-month-old post is a gamble. Check the current docs.

Keep it, and check the names.

## Skills: the minimalism case

Skills are where it gets murky. Some developers say the old commands folder is now just treated as skills. That's secondhand, so check before relying on it.

The most discussed example is a skill that makes the agent climb a ladder of questions before writing code. Does this need to exist? Does the standard library do it? Is there a native platform feature? An existing dependency? Could it be one line? The author's own numbers: five tasks, about 16% fewer tokens, roughly 4x faster, 293 lines down to 47, and a 190-line countdown dashboard shrunk to 13. The same rules ship as plain rules files for other editors.

Impressive. Also five tasks, self-reported.

The pushback was specific and good. Validating an email with `"@" in email` isn't minimalism; it's a bug that lets bad data into the database. "Write less code" can quietly delete edge cases, error messages and debuggability. Critics wanted examples at the level of system architecture, not a toy dashboard.

The problem the skill targets is real, though. As one engineer put it, "the complexity of any solution you allow the coding agent to propose grows with every turn". And here's the failure mode of every skill: it's a request, not a constraint. One user said that after a model regression it "doesn't stay to SKILLs anymore". One comment, but it describes the exact risk: you pay the tokens to load the skill on every task, and whether it's followed is a coin flip you can't see.

Try it, don't trust it. Run it on a task with real validation requirements and compare the diffs before adopting it.

## Output styles as a patch for model behavior

People complain about the model's mannered prose, and have tried banned-phrase lists, a concise mode and a custom BLUF (bottom line up front) style. The evidence splits. One engineer says output styles don't work and never have. Another says a BLUF and STE style "really improved it", though it took a week of tuning plus audits by several AIs. A third notes the verbosity leaks into docstrings and code comments, which a style can't reach.

Do the math: a week of an engineer's time, and the fallback that actually worked was switching models. That's a prompt-level patch for a model-level problem. If the behavior comes from the weights, a paragraph of instructions is a bandage on a broken bone.

Skip it, unless prose is your actual product. Try a different model first.

## Auto memory and background consolidation

Automatic memory writes notes across sessions. After many sessions the notes get noisy and contradictory, so a consolidation pass was added: prune stale entries, replace "today" with real dates, merge duplicates. As reported, it runs after 24 hours and 5 sessions since the last run, with read-only access to project code, write access to memory files, and a lock file for concurrency.

The reaction was skeptical: "yet another way to burn tokens that runs quietly in the background". One user said usage jumped from 10% to 45% overnight while they weren't working, and blamed a "bad dream". That's a joke wrapped around a real signal, and also a single comment, so it proves nothing, except that nobody measured. The feature was explained mostly through a video, not an announcement. One suggestion deserves a raised eyebrow: set up memory and stop hooks while off-peak limits are doubled. That's the "use it while it's free" mindset, and it's how every cloud bill in history started.

Hold off until it's measured. Log usage before and after turning it on, and compare.

## Subagents and fan-out

If anything on this list is in the red, it's this.

Reported incidents:

- One version let subagents spawn their own subagents up to five levels deep. A user ran two simple "look this up online" prompts and watched about a quarter of a five-hour window disappear.
- A session proposed two deep-research harnesses, and every subagent inherited the most expensive model. The allowance was gone in minutes.
- A "dynamic workflows" feature that spawns hundreds of parallel subagents may explain why one weekly limit ran out in two days, though the user also suspected lowered limits.

Plan reviews with several specialized subagents do catch things a single pass misses, so there are real uses. But the skeptics have the sharpest lines: "model intelligence just ain't there yet; multi-agent orchestration tends to propagate errors", and "at what point does coordinating all these agents get as time-consuming as coding it yourself?"

Use sparingly, and only with a depth cap, a cheap model pinned for the workers, and a spend limit.

## Spend where you can read the bill

Step back far enough and a pattern shows up. The items that pay off are deterministic: a deny list, a flag, a hook that either blocks or doesn't. The items that leak are the ones where a model has to interpret an instruction, load a pile of text, or decide how many helpers to launch.

That's the argument for agentless, manually scoped work. When you pick the exact files that go into a request, the context is small by construction, with no skill library loading underneath. When the answer comes back as search/replace blocks applied through a normal Git diff, review is a diff review, not archaeology. And when the call goes through your own API key, the cost of each request is a line on your provider statement, not a percentage that moved overnight for reasons nobody can explain.

That doesn't make autonomous agents useless. For a greenfield prototype, where the whole thing is disposable, loose orchestration is fine. But on a complex, long-lived codebase, a mechanism you can't price is a mechanism you can't keep.

## Audit checklist

1. **Measure before adding.** Log hook events and usage per session for a week. A baseline makes every later claim checkable.
2. **Give every extension a removal test.** Turn it off for a day. If nobody notices, delete it.
3. **Cap subagent depth and pin the worker model.** Inheriting the most expensive model by default is how a morning disappears.
4. **Keep protection against destructive actions out of prompts.** Deny lists and hooks, plus backups the agent can't reach.
5. **Treat leaked or unreleased features as if they don't exist.** Don't build process on a changelog entry that vanished.
6. **Switch models before writing an output style** when the complaint is about model behavior.
7. **Audit the inherited repo again.** Of the 200 handles, how many survived real work? Of the 190k lines of docs, how many has anyone read?

This isn't a case against extensions. A few small hooks and settings keys clearly earn their place. It's a case against complexity nobody priced. And since most of the evidence is anecdotal, don't take my verdicts on faith either. The advice that holds up is the advice that costs almost nothing to test: add one logger, remove one extension, compare two weeks. For irreversible actions, a deterministic gate beats a good prompt, because a gate can't be talked out of its job. For style and taste, where an occasional miss is cheap, a prompt is still the right tool.
