# Month Three: A Forensic Walk Through a Vibe-Coded Codebase

Vibe-coded apps tend to fail in a predictable order: structural decay first, then a recurring set of security and operations gaps that only appear once real users arrive. This article treats the repo like a crime scene, examining the evidence in the order a rescuer would, and ending with how people actually get out.

> I handed a friend's AI-built app to a developer I trust, and he went quiet for about two minutes before saying "what is this." The app worked, customers were paying, and that was the whole problem.

## Scene one: the first two minutes

Here is the report that keeps getting retold in slightly different forms. A founder spends six months building a product with AI app builders and an AI editor. Users are happy. Revenue is arriving. Then a contract developer opens the repository, goes quiet for two minutes, and says: "what is this."

What he sees: "the AI just kept adding. new file here, duplicate function there, 3 different ways to handle the same thing." The founder tried to refactor and gave up after two hours, because touching one part broke an unrelated one. The summary line is hard to forget: "The generation was fast. the cleanup is a nightmare."

A second story rhymes. An employee inherits a product her boss built with roughly $3,100 in editor credits. There is a single API file of about 22,000 lines that the tool "couldn't refactor ... into separate files properly". Bugs were ignored in favor of new features for demos. Then the whole thing was handed over.

One caveat before the autopsy. Plenty of experienced developers in these discussions say, correctly, that this is just tech debt. "This happened before vibecoding too." One veteran with fifteen-plus years has seen hand-written projects in production that "looked like this and even worse". A company of five who built a codebase often have no idea what it does once the team grows to a hundred.

So the claim here is narrow. The problem is not unique to AI. What differs is the *speed* at which it accumulates and *who* ends up holding the repo.

## Scene two: the decay curve

The pattern is told as three months.

| Month | What it feels like | What is happening |
|---|---|---|
| 1 | Idea to product in days | Every prompt works because the codebase is tiny |
| 2 | "The AI starts fighting you" | Re-prompting, pasting errors in, pasting whatever comes back |
| 3 | Live app, "terrified to touch anything" | Patches on patches, no one holds the whole picture |

The proposed mechanism is simple and plausible. The agent builds each feature in isolation. Each session lacks the whole-system context. The result: "API routes that bypass your own middleware because the AI didn't know it existed", duplicated logic, inconsistent data flows. Treat that as a hypothesis from people in the trenches, not as measurement. But it matches the symptoms people list: "the machine added twelve copies of the same thing that work in slightly different ways", "15 different functions that do the same thing", some never called.

Draw it as a sketch:

```
Feature 14 prompt  ->  agent saw: routes/orders.ts, a few helpers
                       agent did NOT see: auth middleware, 3 older
                       order-validation helpers, the pricing module
Result             ->  a 4th validation helper, a route with no auth check
```

Nothing here is a bug in the model. It reasoned correctly about the files it was shown. The context was the problem, and context is a thing a human can control.

There are counterpoints. Some say successful small and mid-size projects exist and the gloomy title exaggerates. They are probably right about small ones. The curve bites when the project outgrows what any single prompt can hold.

## Scene three: the reviewer gap

Evidence item: a daily user of an AI coding tool generated a mobile app in a framework they had never written. It looked clean. A friend who knew that framework flagged the folder structure, architecture choices, unnecessary rebuilds and odd state management. "I genuinely could not see those problems myself." The conclusion: AI is "more like a multiplier for existing knowledge".

Another: a developer with twenty-plus years watched a non-technical person build a web app with a top model. The text fields were open to SQL injection, and credentials would likely have leaked on deployment.

Replies disagree, and both camps have a point.

- "You don't know what you don't know" is true.
- Senior developers ship naive security mistakes too, and one person's deployed vibe-coded app never had an incident.
- The real difference, someone noted, is accountability: a professional has a career at stake, while a first-time builder has confidence without knowledge.

A useful pushback: best practices are not oral tradition. Experienced developers should codify guardrails, "reject the slop in precommit and CI and write the context files", not only complain about it. The counter-anecdote is just as instructive: a developer's carefully crafted codebase was torn apart by teammates merging AI output while the original author had no final say. That is a process and ownership failure, and no tool fixes it.

## Scene four: the audit

A team lead who has cleaned up a dozen of these apps lists the same problems showing up every time. Six are visible in the discussion, and each converts into something runnable.

1. **Secrets in code or frontend.** Search the repo for the usual suspects, such as `sk-`, `secret`, `password`. If you find any, rotate them. Deleting the line does not un-leak it.
2. **The UI is the only security.** A hidden admin button while the API answers anyone. Every endpoint needs its own server-side check. Test it by calling admin endpoints with no credentials.
3. **One user can read another's data.** Create two accounts, then fetch account A's records by ID while logged in as account B.
4. **No error tracking.** A free tier of any error tracker, or an open-source logger, beats finding out from a customer.
5. **Backups never restored.** "If you haven't done a restore, you don't have backups, you have hope."
6. **Payments trust the client.** Prices come from the frontend, and webhook signatures go unverified.

A quick scripted starting point (general technique, a sketch):

```
grep -rEn "sk-|secret|password|api[_-]?key" --exclude-dir=node_modules .
curl -i https://staging.example.test/api/admin/users        # expect 401/403
# log in as user A, fetch /api/orders/<id of user B>        # expect 403/404
# restore last night's backup into a scratch database       # time it
```

The list drew skepticism. Some called it an ad for an error tracker. Several experienced users said it just matches the standard web-security top ten, and that with modern models and good prompting these never happen. Others, including a non-coder, found it useful. One said they ask their assistant to read such posts and none of the problems apply. Nobody produced data on model-by-model rates, so this remains unresolved. 

A short sidebar on agents with real access. In one reported case, an agent running on Windows mangled the quoting in a delete command and pointed it at a drive root. Engineers asked the obvious questions: was it in a sandboxed VM or devcontainer, and was the project even under Git? In another, an assistant asked for an API key, and users reported being told to rotate any key pasted into chat. The rule is the same in both: no production access, and keys stay out of conversations.

## Scene five: the rescue playbook

Practitioners who got out did not "rewrite" and did not "prompt harder". They followed an order.

**Step 1: tests first, and black-box ones.** Integration tests around main flows and API endpoints are "your safety net". If there are none, ask the model to write unit and integration tests for each feature *before* any refactoring. Repeated "refactor cleaner, remove bloat" passes work "as long as you have comprehensive tests."

**Step 2: incremental, not rewrite.** The loudest line: "Rewrites are for suckers... Every time you break it, that is the universe granting you an excellent test case." Whole-system rewrites, this camp says, are always a mistake. Extract one route group at a time, simplest first.

The opposite camp is just as vocal: "Best to rebuild." Pay a developer to start from scratch. One person who learned engineering practice rewrote their platform themselves with an AI tool. Another suggests documenting the requirements and rebuilding, because the first version was effectively a prototype.

This is the central disagreement, and no thread settles it. The factors people imply are:

- Is there revenue to protect?
- Is there any test coverage?
- Can anyone explain what the current system does?

If the last answer is no, a rewrite loses the only spec you have: the running behavior.

**Step 3: plan-then-fix loops.** "Look for spaghetti, compile a plan to refactor, double check work, repeat." Or holistic passes: componentize the UI, split the backend, then one pass for tests and one for documentation.

**Step 4: impose structure the model must follow.** Learn some design patterns and make the model follow them. Start from an existing template rather than letting it invent architecture. And for every recurring mistake, write a rule, so "your AI will pick up everything". An illustrative rules file:

```
- All routes pass through auth middleware. Never add a route outside it.
- Before writing a helper, search for an existing one. List what you found.
- One validation module. Do not create another.
- Add a one-line comment per function: what it does, what calls it.
```

**Step 5: traceability.** One practitioner asks for a brief comment per function about what it does and where it connects. The trade-off, as stated: "tokens now for traceability forever". Whether those comments drift out of date is untested.

One developer argues LLM output is "highly refactorable... unreadable, but the logic is sound", unlike a junior's code, which you throw away. Another asks for a definition of "maintainable", and adds that "legacy code is code I didn't write myself". Opinions, both.  And one harsh view: AI-assisted code "reflects the capability of the developer", so giving up after two hours says something about experience.

## Scene six: preventing month three

A manager with fourteen years of experience let four interns vibe code from day one, with rules:

- They must explain what the AI generated before committing. "If they can't explain it they can't use it."
- Boundaries define what can be built solo and what needs review, widened as they prove understanding.
- On Fridays he deliberately breaks their code and they debug it without AI.
- Short notes on each new concept.

Others added "no test, no merge" and starting from a known template for auth, migrations and logging. Some argued that if you must explain the code, you are "by definition" not vibe coding. Fair. Call it AI-assisted engineering with guardrails, and move on.

Another workflow, from a non-technical founder who claims modest recurring revenue (self-reported, promotional in tone): three days planning, one day coding, with one AI instance planning, one executing and one reviewing against a preset standards prompt. The method is not the point. The planning documents are: a product requirements file, structure, architecture and tech stack written *before* code. Non-technical people prototyping with domain knowledge and handing requirements to developers under architecture and security specs is another pattern that repeats.

## The paradigm: keep the context in human hands

Read the scenes together. Duplicates, bypassed middleware and invented architecture have one root: the model saw a slice of the system chosen by whatever the tool fetched, and nobody checked.

Autonomous agents are brilliant for prototypes and greenfield weekends, where decay is a cost you can afford. For anything you intend to keep, the safer paradigm is deterministic. You choose the exact files each change sees: the route, the middleware, the existing helper. The model returns search/replace edits, which land as ordinary Git diffs you can read, test and revert. You bring your own API key, so the bill is a line item you can see. Each of these maps onto a rescue step: scoped context prevents the isolation problem, diffs make the review gap visible, and small commits make incremental refactoring safe by construction.

## The checklist

- **Before shipping:** secrets scan and rotation, server-side authorization on every endpoint, cross-account access test, error tracking, a real restore, server-side prices and verified webhook signatures.
- **Before the first refactor:** black-box tests around main flows, Git with a remote, a staging environment separate from production ("do NOT give it any access to prod").
- **During the refactor:** one slice at a time, rules updated after each repeated mistake, tests green before the next pass, a human reviewing structure.
- **To avoid a repeat:** an architecture document the model must read, a duplicate-logic check in review, "explain it before you commit", and CI gates for what experienced developers know is wrong.

The honest scorecard: people agree on tests first, on not trusting UI-only security, and on someone having to be able to read the code. They disagree on rewrite versus refactor, and on how common these flaws are with current models.

## FAQ

**Isn't this just ordinary technical debt with a new label?**
Largely yes. The difference is speed and ownership: debt that once took years now accumulates in weeks, often in the hands of someone who cannot read it.

**Why not rewrite when the code is a mess?**
Sometimes you should, especially when the first version was a prototype and nobody can explain current behavior. But a rewrite discards the only specification you have, which is what the running system does.

**Can a non-coder do this rescue?**
Part of it: writing requirements, running the audit script, and demanding tests. The structural judgment is where an experienced reviewer earns their fee.

**If modern models avoid these flaws, why bother auditing?**
Some experienced users say they rarely see them, and they may be right. But an audit costs an afternoon, and a leaked key or an exposed record does not.

## Key Takeaways

- Decay follows a pattern: each feature is built without the whole system in view, so duplicates and bypassed rules pile up until nobody dares to touch anything.
- The rescue order that works is tests first, incremental refactors, then rules the model must follow; rewrites remain the most contested option.
- Control what the model sees and review what it changes as a diff, and month three becomes a maintenance task instead of an emergency.

*Speed is cheap at generation time and expensive at every hour after.*
