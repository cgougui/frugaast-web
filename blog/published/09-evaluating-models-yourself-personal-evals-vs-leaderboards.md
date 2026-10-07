# Ten Dollars of Your Own Evals: Picking a Coding Model When the Leaderboard Disagrees With Your Repo

Public leaderboards are a good way to build a shortlist and a bad way to make the final call. The final call belongs to a small, boring, repeatable experiment on your own code, scored in cost and minutes per accepted task.

> I picked a model because it ranked two spots higher on a popular leaderboard, then watched it burn most of my weekly budget on a task a rival finished in ten minutes. I had run exactly one test, one time, and I believed it.

## The same question, asked fifty times

Scroll through any forum where developers share cheap coding setups and the same thread keeps coming back. "What's the best model right now?" "Model A vs Model B, which one?" The answers rotate every few weeks. A budget model is the darling in spring, a newer release replaces it by summer, and by autumn somebody asks whether the old favourite is still HOT or NOT.

One engineer summed it up: everyone is building a habit of trying new random models every few days.

That speed has a consequence. Any ranking printed here would be stale before you finished reading it. So this article does not rank models. It is about method, which is the only part that survives the next release.

One caveat: everything below is anecdote from developers who shop for cheap plans. No controlled studies. Treat it as field notes.

## Experiment zero: why the leaderboard is an input, not an answer

Leaderboards are not useless. They are just answering a different question than yours.

Three patterns show up again and again in the field reports.

**High score, disappointing week.** A new model lands near the top of an aggregate index. Early users say it is fast. A few weeks later the mood flips: "Benchmaxxed to the moon and back. Not good for actual serious coding." Yet a third group stays happy, because their tasks were design mock-ups and orchestration, where the model really is strong. Same model, opposite verdicts. The difference was the task mix.

**Picking by rank and getting burned.** A developer chose the higher-ranked of two budget models because the index said so. Result: an hour and a half, nearly the whole usage window, and output "just as bad" as the cheaper rival. A premium model finished the same job in about ten minutes with minor edits.

**Benchmarks that miss what you feel.** One developer who left a premium model for a mid-priced one said it reminded them that the headline coding benchmark "is not everything". How a model interacts with you has no column in any table.

And there is a quieter hole. Many accuracy tables have no token column, so a model that ranks well but burns tokens is "not as attractive as this list makes it". Accuracy-only rankings hide the two numbers you pay in: money and waiting time.

So use the leaderboard to cut fifty candidates down to three. Then test the three.

## The unit of comparison: cost per accepted task

The price per million tokens is the number every vendor prints. It is also the least useful number for comparing models.

Why? Because nobody uses a model for exactly a million tokens. As one practitioner put it, you use it until the goal is hit. Two models with the same rate card can differ wildly in the tokens they need to get there.

Here is a composite of a read-only bug-hunt, the kind of small experiment that shows the effect. One real bug, one identical question, six model and effort settings:

| Config | Cost for the run | Output tokens | Notes |
|---|---|---|---|
| Model A, high effort | $0.006 | ~5k | Few turns |
| Model B, low effort | $0.028 | ~14k | Many turns, cache-heavy |
| Model B, high effort | $0.042 | ~25k | Same bug found |
| Model C, high effort | $0.043 | ~22k | Middle of the pack |
| Model D, high effort | $0.048 | ~31k | Longer reasoning |
| Model E, high effort | $0.396 | ~41k | Premium price, similar answer |

Look at the spread: under a cent to about forty cents for the same question, with output tokens differing roughly 8x. The model that took many turns re-read a huge cached context every time, so its cache-read tokens climbed into the millions. Per-token price told you almost nothing.

Now add the term nobody prints: retries. A model that is cheap but "makes many stupid mistakes" means you do the job two or three times, "so you lose the time and the money again". One developer tried a faster, cheaper flash-tier model and found that tool calls got sketchy once the task got hairy. They ended up redoing half of it anyway, so the 2x-versus-4x quota math "didn't save me anything".

So the right metric is:

> cost per accepted task = (total spend across all attempts) / (tasks you actually merged)

And a second column next to it: minutes of wall-clock and number of human corrections. A task that costs 40 cents but needs an hour of babysitting is not cheap. It is expensive in the currency that you cannot refund.

One more detail. Store tokens and outcomes, not dollars. Prices change, promos expire, multipliers get adjusted. If you logged tokens (input, output, cache, reasoning) you can recompute cost under any billing path later. If you logged only dollars, your old results died the day the price list did.

## Four experiment designs, and what each can prove

Practitioners have tried several designs. Each tells you something and hides something.

**1. Real bug, same prompt, read-only.** Take an actual bug from your tracker, for example a UI button that flashes and only registers one click in ten. End the prompt with "don't make any changes yet". Run six configurations. Record input, output, cache, context and cost. Have a stronger model judge the answers blind, with outputs unlabeled and names swapped in afterwards.

What it proves: which models can diagnose, cheaply and comparably. Read-only runs leave no side effects, so they are the safest first rung. It also showed that reasoning effort changes both cost and turn count, and that one run read documentation for the wrong framework version.

What it hides: it is n=1. One bug, one judge.

**2. Same plan, different executors.** Plan a feature at maximum depth, then let several models implement it. The design flaw: one-shotting a large feature tests autonomy, which is precisely how cheap models should not be used. The advice from engineers in the trenches: "dont one shot everything". Split the work into steps, write compact specs, generate one plan with a strong model and reuse it across all executors so the plan is a constant, not a variable.

**3. Multi-run.** Fire the same prompt at two models, twice each. One developer saw the newer model win both times, then added: only two instances. Two data points is a hint, not a result.

If you want the plumbing, here is a generic sketch of a personal harness, not taken from any thread. One git worktree per model, one prompt file, one starting commit. After each run, record `git diff --stat`, run the tests, and append a line of tokens, cost, minutes and human fixes to a CSV.

## Models have temperaments

A single score flattens behaviour that practitioners describe in very different terms. One model is "more conscientious but rigid". Another is "more flexible but error-prone". One is robust until about 30% of its context and then gets dumb. One is "good if paired with a stronger thinking model for planning", because alone it hallucinates too much to plan. The pairing that emerged: the flexible one for open-ended changes, the rigid one to review.

So tag your tasks (locate a bug, small edit, refactor, UI from mock-up, review) and include one long-context case. Verdicts flip by task type. Cheap open-weight models were called "excellent execution machines" by one engineer, which is a statement about a role, not a ranking. Decide per role, not per model overall.

## How personal evals get contaminated

This is where most "tested it, it's bad" reports go wrong. The experiment itself has leaks.

**The model changes under you.** A cheap model was declared "dumber" within hours of a provider change: slower, seemingly quantized, hallucinating "fake data". Meanwhile a team on a different regional provider cut costs by 80% with the same model name and were happy. Same name, different route, different score. Log the route and the date with every result.

**Session state masquerading as model quality.** A "broken" model came back to life after a restart and a compaction. Some sessions "just seem to get cursed". Rerun in a fresh session before declaring a regression.

**The harness is part of the model.** One comparison ran the same wrapper against two providers to isolate the provider, and found double the context and cost per turn plus cut-off responses on one. Even that control had a hidden variable: data-retention settings changed the cost. Another user trimmed their tool's default prompt to save tokens and said it backfired. If you change the wrapper and the model at once, you learned nothing.

**Free and stealth variants.** Free capacity overloads; one user got disconnected ten times in twenty minutes. Verdicts on a free anonymous checkpoint ranged from "insane" to "a very shit model". One useful metric did emerge: first-iteration approval rate, roughly 70% against 30% for the comparison model. But that user ran several parallel reviewers, so the number was not independent of the workflow.

**One bad session mistaken for a bad model.** A post claimed caching "evidently doesn't work" after a few dollars vanished in half an hour, then retracted: "could be a one-off bug".

**Context-dependent pricing.** A model that doubles in price past 250k of context will not cost at 150k what it cost at 40k.

## Who grades the grader

Two of the threads used a language model to score language model output. One hid model identity from the judge. The other produced scores like 9/10 versus 7/10 on "depth, accuracy, usefulness". The top reply asked the only question that matters: "Who scores both models? Did you do it manually, or is it some third model?"

General background on LLM judges: they prefer longer, more structured answers, favour their own model family, and without ground truth they grade style.

The bug-hunt design had something better. The bug was real, so the claimed root cause could be checked against the actual fix. Ground truth first. If you use a judge, blind it, use a different model family, and spot-check by hand.

And do not confuse an eval with a workflow. Asking a model to "antagonise" its own output is a good habit. It is not a measurement.

## The deterministic way to run an experiment

The best experiments above fix the variables: same starting commit, same prompt file, same plan, fresh session. Known inputs, inspectable outputs.

That is the philosophy of deterministic coding, and it is not an accident. An autonomous loop that decides which files to read, which tools to call and when to stop adds a dozen uncontrolled variables to every comparison. You end up measuring the loop and the model fused together.

Agents have their place. For prototyping a greenfield app, letting a loop run is a perfectly good way to spend a Saturday. But to learn what a model is worth on a complex codebase, remove the moving parts. Select the exact files yourself, so context is identical across candidates. Bring your own key, so the bill per model is an itemised fact and not a pooled-quota guess. Take the answer as Search/Replace blocks and read them as a standard Git diff, so "accepted" has an unambiguous meaning: you merged it. Run the same prompt on three models, diff the three results, done.

Precise scoping is not a limitation. It is the control group.

## A minimal personal eval protocol

Pulling it together, here is a checklist you can run in an afternoon.

1. Shortlist from a public leaderboard. Drop anything that wins only on accuracy while ignoring tokens.
2. Pick five to eight tasks from your own repo history, tagged by type. Prefer ones with a known right answer: a merged fix, a passing test.
3. Fix the variables: same tool version, same rules file, same plan (generated once by a strong model), same starting commit in a fresh worktree, fresh session.
4. Run read-only diagnosis tasks first. They are cheap and comparable. Implementation second, in steps rather than one shot.
5. Run each cell at least twice and note the variance.
6. Record tokens (in, out, cache, reasoning), turns, wall-clock, cost on your real billing path, human corrections, accepted or not. Add provider route and date.
7. Judge against ground truth. If a model judge is unavoidable, blind it and change the family.
8. Re-run a small canary set whenever a provider, price or model alias changes, always in a fresh session first.
9. Assign models to roles, not to the whole project.

Keep your own logs. Usage dashboards get redesigned and lose history. A CSV in your repo does not.

## FAQ

**Isn't a five-task eval statistically meaningless?**
Yes, as science it is thin; I would never publish it. But the question is not "which model is best in the world", it is "which model wastes the least of my time on this codebase", and for that a few repeated, well-controlled tasks beat a stranger's average.

**Why not just trust the leaderboard that my favourite vendor links to?**
Because a vendor-linked table optimises for the vendor's story and usually omits token use and retries. Used as a shortlist filter it is fine; used as a verdict it has burned plenty of people.

**Won't my results be obsolete when the next model drops?**
The ranking will, the method will not. A logged task set and a CSV make the next comparison a one-hour job, which is the point of building it once.

**Isn't paying for several runs per model wasteful?**
It is a few dollars against months of daily use, and read-only runs cost cents. The expensive mistake is the one you keep paying for.

## Key Takeaways

- Use leaderboards to shortlist, then decide with your own tagged tasks, measured as cost, minutes and human corrections per accepted task.
- Fix every variable you can (commit, files, plan, session, route) so the model is the only thing that changes, and log tokens rather than dollars.
- Judge against ground truth, rerun in fresh sessions, and assign models to roles instead of crowning one.

*A benchmark is a rumour about somebody else's repo; a diff is a fact about yours.*
