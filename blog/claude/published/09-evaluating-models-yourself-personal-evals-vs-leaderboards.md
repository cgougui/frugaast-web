One question for one real bug, asked of six model settings: the cheapest answer cost $0.006, the most expensive $0.396, and both found the same bug. No leaderboard would have told you that. A five-minute experiment on your own repo did.

On any forum where developers share cheap coding setups, the same thread keeps coming back. "What's the best model right now?" "Model A vs Model B?" The answers change every few weeks. A budget model is everyone's favorite in spring, a newer release replaces it by summer, and by autumn someone asks whether the old favorite is still hot or not. As one engineer put it, everyone is getting into the habit of trying random new models every few days.

So any ranking I printed here would be stale before you finished reading. This post is about method instead, since that's the part that survives the next release. Everything below comes from developers shopping for cheap plans. There are no controlled studies, so treat it as field notes.

## The leaderboard answers a different question

Leaderboards aren't useless. They just answer a different question than yours. Three patterns keep showing up.

**High score, disappointing week.** A new model lands near the top of an aggregate index. Early users say it's fast. A few weeks later the mood flips: "Benchmaxxed to the moon and back. Not good for actual serious coding." A third group stays happy, because their tasks were design mockups and orchestration, where the model really is strong. Same model, opposite verdicts. The difference was the kind of work.

**Picking by rank and getting burned.** A developer chose the higher-ranked of two budget models because the index said so. It took an hour and a half, nearly the whole usage window, and the output was "just as bad" as the cheaper rival's. A premium model did the same job in about ten minutes with minor edits.

**Things benchmarks don't measure.** One developer who moved from a premium model to a mid-priced one said it reminded them the headline coding benchmark "is not everything". How a model works with you has no column in any table.

There's a quieter gap too. Many accuracy tables have no token column, so a model that ranks well but burns tokens is "not as attractive as this list makes it". Accuracy-only rankings hide the two things you actually pay with: money and waiting time.

Use the leaderboard to cut fifty candidates down to three. Then test the three.

## Measure cost per accepted task

Price per million tokens is the number every vendor prints, and it's the least useful one for comparing models. Nobody uses a model for exactly a million tokens. As one practitioner put it, you use it until the goal is reached. Two models with the same rate card can need wildly different numbers of tokens to get there.

Here's a composite of a read-only bug hunt, the kind of small experiment that shows the effect. One real bug, one identical question, six model and effort settings:

| Config | Cost | Output tokens | Notes |
|---|---|---|---|
| Model A, high effort | $0.006 | ~5k | Few turns |
| Model B, low effort | $0.028 | ~14k | Many turns, lots of cache |
| Model B, high effort | $0.042 | ~25k | Found the same bug |
| Model C, high effort | $0.043 | ~22k | Middle of the pack |
| Model D, high effort | $0.048 | ~31k | Longer reasoning |
| Model E, high effort | $0.396 | ~41k | Premium price, similar answer |

Under a cent to about forty cents for the same question, with output tokens varying about 8x. The model that took many turns re-read a huge cached context every time, so its cache-read tokens climbed into the millions. The per-token price told you almost nothing.

Then add the factor nobody prints: retries. A model that's cheap but "makes many stupid mistakes" means you do the job two or three times, "so you lose the time and the money again". One developer tried a faster, cheaper flash-tier model and found tool calls got sketchy once the task got hairy. They redid half the work anyway, so the quota math "didn't save me anything".

So the metric I use is:

> cost per accepted task = total spend across all attempts / tasks you actually merged

Next to it, track wall-clock minutes and the number of human corrections. A task that costs 40 cents but needs an hour of babysitting isn't cheap. It's expensive in the one currency you can't get back.

One more detail: store tokens and outcomes, not dollars. Prices change, promos end, multipliers get adjusted. If you logged tokens (input, output, cache, reasoning), you can recompute the cost under any pricing later. If you only logged dollars, your old results died the day the price list changed.

## Four experiment designs

Practitioners have tried several designs. Each one shows something and hides something.

**1. A real bug, the same prompt, read-only.** Take an actual bug from your tracker, like a UI button that flickers and only registers one click in ten. End the prompt with "don't make any changes yet". Run six configurations. Record input, output, cache, context and cost. Have a stronger model judge the answers blind, with outputs unlabeled and names added back afterwards.

This shows which models can diagnose the problem, cheaply and comparably. Read-only runs have no side effects, so they're the safest place to start. In this case it also showed that reasoning effort changes both cost and number of turns, and that one run read the docs for the wrong framework version.

What it hides: it's one bug and one judge.

**2. The same plan, different implementers.** Plan a feature at maximum depth, then let several models implement it. The flaw: one-shotting a big feature tests autonomy, which is exactly how you shouldn't use cheap models. The advice from people doing this daily: "dont one shot everything". Split the work into steps, write compact specs, and have a strong model generate one plan that you reuse for every implementer, so the plan stays constant.

**3. Several runs.** Send the same prompt to two models, twice each. One developer saw the newer model win both times, then added: only two instances. Two data points are a hint, not a result.

**4. Your own small harness.** This is my sketch, not from any thread: one git worktree per model, one prompt file, one starting commit. After each run, record `git diff --stat`, run the tests, and append a line with tokens, cost, minutes and human fixes to a CSV.

## Models have temperaments

A single score flattens behavior that practitioners describe in very different terms. One model is "more conscientious but rigid". Another is "more flexible but error-prone". One holds up until about 30% of its context and then gets dumb. One is "good if paired with a stronger thinking model for planning", because on its own it hallucinates too much to plan. The pairing people settled on: the flexible one for open-ended changes, the rigid one to review.

So tag your tasks (find a bug, small edit, refactor, UI from a mockup, review) and include one long-context case. Verdicts flip by task type. One engineer called cheap open-weight models "excellent execution machines", which is a statement about a role, not a ranking. Pick a model per role, not one model for everything.

## How personal evals get contaminated

This is where most "tested it, it's bad" reports go wrong. The experiment leaks.

**The model changes under you.** A cheap model was declared "dumber" within hours of a provider change: slower, apparently quantized, making up "fake data". Meanwhile a team on a different regional provider cut costs by 80% with the same model name and was happy. Same name, different route, different result. Log the route and the date with every result.

**Session state that looks like model quality.** A "broken" model came back to life after a restart and a compaction. Some sessions "just seem to get cursed". Rerun in a fresh session before you call it a regression.

**The harness is part of the model.** One comparison ran the same wrapper against two providers to isolate the provider, and found one doubled the context and cost per turn and cut off responses. Even that had a hidden variable: data-retention settings changed the cost. Another user trimmed their tool's default prompt to save tokens and said it backfired. If you change the wrapper and the model at the same time, you've learned nothing.

**Free and stealth variants.** Free capacity gets overloaded; one user was disconnected ten times in twenty minutes. Verdicts on a free anonymous checkpoint ranged from "insane" to "a very shit model". One useful metric did come out of it: first-try approval rate, roughly 70% against 30% for the comparison model. But that user ran several reviewers in parallel, so the number wasn't independent of the workflow.

**One bad session mistaken for a bad model.** A post claimed caching "evidently doesn't work" after a few dollars disappeared in half an hour, then retracted: "could be a one-off bug".

**Pricing that depends on context size.** A model whose price doubles past 250k of context won't cost at 150k what it cost at 40k.

## Who grades the grader?

Two of the threads used a language model to score other models' output. One hid the model names from the judge. The other produced scores like 9/10 versus 7/10 on "depth, accuracy, usefulness". The top reply asked the only question that matters: "Who scores both models? Did you do it manually, or is it some third model?"

Some background: LLM judges prefer longer, more structured answers, favor their own model family, and without ground truth they end up grading style.

The bug-hunt design had something better. The bug was real, so each claimed root cause could be checked against the actual fix. Get ground truth first. If you do use a judge, blind it, use a different model family, and spot-check by hand.

And don't confuse an eval with a workflow. Asking a model to argue against its own output is a good habit. It isn't a measurement.

## Control the variables

The best experiments above fix everything they can: same starting commit, same prompt file, same plan, fresh session. Known inputs, outputs you can inspect.

An autonomous loop that decides which files to read, which tools to call and when to stop adds a dozen uncontrolled variables to every comparison. You end up measuring the loop and the model together.

Agents have their place. For prototyping a greenfield app, letting a loop run is a fine way to spend a Saturday. But to find out what a model is worth on a complex codebase, remove the moving parts. Choose the exact files yourself, so context is identical across candidates. Use your own key, so the bill per model is an itemized fact and not a guess from a shared quota. Take the answer as search/replace blocks and read them as a normal Git diff, so "accepted" means something unambiguous: you merged it. Run the same prompt on three models, diff the three results, done.

Choosing the files yourself isn't a limitation. It's your control group.

## An eval you can run in an afternoon

1. Shortlist from a public leaderboard. Drop anything that wins on accuracy but ignores tokens.
2. Pick five to eight tasks from your own repo history and tag them by type. Prefer ones with a known right answer: a merged fix, a passing test.
3. Fix the variables: same tool version, same rules file, same plan (generated once by a strong model), same starting commit in a fresh worktree, fresh session.
4. Run read-only diagnosis tasks first. They're cheap and comparable. Do implementation second, in steps rather than one shot.
5. Run each combination at least twice and note the variance.
6. Record tokens (input, output, cache, reasoning), turns, wall-clock time, cost on your real billing path, human corrections, and whether you accepted it. Add the provider route and the date.
7. Judge against ground truth. If you can't avoid a model judge, blind it and use a different family.
8. Rerun a small canary set whenever a provider, price or model alias changes, always in a fresh session first.
9. Assign models to roles, not to the whole project.

Keep your own logs. Usage dashboards get redesigned and lose history. A CSV in your repo doesn't.

As science, a five-task eval is thin, and I'd never publish one. But the question isn't which model is best in the world. It's which model wastes the least of your time on your codebase, and for that, a few repeated, well-controlled tasks beat a stranger's average. The ranking will be obsolete when the next model ships. The method won't: with a logged task set and a CSV, the next comparison takes an hour. And a few dollars of runs is cheap next to months of daily use with the wrong model.
