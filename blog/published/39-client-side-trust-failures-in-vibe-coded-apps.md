# The Browser Is Not a Trust Boundary

Security failures in AI-built apps are rarely clever. They are one design error repeated: roles, payment status, bans and secrets live in the one place the user can edit. This article catalogs the recurring holes, shows where experienced developers disagree about the cause, and ends with a pre-launch audit that needs nothing more than a browser.

> I once opened DevTools on a friend's freshly launched side project "just to look around" and had every user's email in my clipboard before my coffee cooled. It took four minutes, and the app had been live for a month.

## Three hours, a browser, no exploit tools

Picture a developer who spends a weekend on apps from a public showcase of AI-built projects. Three hours of casual poking. No scanners, no exploit frameworks. Only a browser and its DevTools.

The findings list reads like a bingo card:

- A database with row-level security switched off, where the public "anon" key sitting in the page source returned every row of the `profiles` table. In one case, payment-related fields came along for the ride.
- An `is_paid` flag that the user could flip from the browser console.
- A live payment-provider secret key (`sk_live_...`) inside a bundled JavaScript file.
- A `.env` file served at `domain.com/.env` on two separate apps.
- Admin panels that never asked who was visiting.

A second teardown, of a small chat app, was titled in the spirit of "30 minutes to completely break the app". An AI-provider private key in the public bundle. Firebase-style rules wide open. User identity stored in localStorage. A ban system that "banned" a device ID kept in localStorage, which a user clears with one click. Admin and report data readable by anyone.

Notice what is missing: subtle race conditions, exotic cryptography mistakes, weird hallucinated algorithms.

These are not "AI bugs" in the sense of clever logic errors. They are **missing server-side authority**. Someone, or something, asked the browser to be the bouncer.

(Evidence note: all of this is anecdotal, drawn from apps people chose to share. No prevalence is claimed. The patterns just repeat reliably.)

## The lens: who holds the authority?

The browser is a rented room in a stranger's house. The HTML, the JavaScript, the storage and the network calls all belong to the visitor, who can rewrite and replay them.

So there is exactly one question to ask of every piece of state in an app: **who is allowed to change this, and where is that enforced?** If the answer is "the frontend only lets you click the right button", the answer is "anyone".

Here is the whole catalog, organized by what the client was trusted with.

| What the client was trusted with | How it breaks | Where authority should live |
|---|---|---|
| Reading data | Public key plus no row policy returns whole tables | Database policies and API-layer checks |
| Writing privileged fields | User edits `role`, `credits`, `is_paid` in their own row | Separate privileged columns, server or webhook writes |
| Secrets | Keys in the bundle or `.env` in the web root | Server environment only |
| Identity | localStorage says who you are | Signed sessions verified server-side |
| Moderation | Bans and admin checks done in the UI | Server-side enforcement |
| Result sets | Whole query result sent, UI hides the rest | Query only what the viewer may see |
| Failure handling | Login fails, app falls back to a test user | Fail closed |

Let's walk through the rows.

### Data access: the free dump

The classic walk-through goes like this. Open the Network tab. Spot a request to a REST endpoint of the form `/rest/v1/{table}`. Notice the filter in the query string, something like `id=eq.{MyGuid}`. Change it to `id=not.is.null&select=*`. Congratulations, the whole table just arrived.

Then try a write. Send an update with `{"id": ..., "user_role": "admin"}`. A `204 No Content` comes back. You are now an admin, and the server was perfectly polite about it.

Background, not from any one app: backend-as-a-service products of this kind let the browser talk to the database directly with a public key. That is a legitimate design, safe only if row-level security policies decide what each caller can see and do. The public key is not the bug. The missing policy is.

Firebase-style rule files fail the same way. One line, `allow read, write: if true`, is the "fix it later" of an entire generation.

### Privilege fields in writable rows

Roles, ranks, credit balances, `is_paid`. If these live in a row the user may update, the user will update them. The fix is boring. Put privileged columns in a separate table that users cannot write. Write policies that forbid user updates on those fields. Flip them from a server process or a payment webhook, never from the client.

### Secrets in the bundle or the web root

A `sk_live_` key in a JavaScript file is published, not stored. Same for an AI-provider key. Same for a `.env` file that the web server cheerfully serves. One builder admitted their own `.env` was reachable for about two weeks before anyone noticed.

Distinguish the two kinds of keys. Publishable ones (a `pk_live_` payment key, the database's anon key) are *designed* to be public. Secrets (`sk_live_`, `service_role`, any model-provider key) must never touch client code. When in doubt, search the bundle.

### Client-side identity and moderation

localStorage is a sticky note the user can rewrite. An identity there is a costume. A "device ID ban" is a suggestion. An admin check done in the React component only hides the button, while the endpoint behind it stays open.

### Data in the frontend

One thread described an entire waitlist visible by pressing Inspect. The diagnosis from an engineer in the trenches was almost sweet: `select * from` is simple and it works, so the whole result goes to the browser, and the interface just does not render the columns. The data was *sent*. Hiding it in the UI is theater.

### Fallbacks that fail open

This one is agent-flavored. A reviewer reported an app that, when login failed, quietly fell back to a test user. Beware of the fallbacks. Models love being defensive: "if the session lookup throws, use a default so the page doesn't crash." Fine for a demo. In production, an auth error became access.

### The wallet sibling

One more, platform-adjacent. Surprise five-figure cloud bills from invocation storms or DDoS-driven egress on pay-per-use serverless setups. The advice from burned developers: use a fixed-price VPS unless the provider enforces hard spending caps. Some argue providers make caps hard on purpose. Cynical, but the invoice is real. Call it denial of wallet.

## Why agents keep producing this

Keep the reported reasons apart from the commentary.

Reported: builders optimize for the demo, not for what happens after it. The model "implements everything", adds fallbacks, and makes assumptions on your behalf unless you specify otherwise. People who do not know to ask do not get the safe version. And the Supabase-style pattern gets cited most by security-minded engineers, one calling it "a guaranteed personal data leak". That is probably hyperbole. It is also not far off for an app with user emails and no policies.

Then comes the argument about blame, and it does not resolve.

- **"Skill issue."** Guide your agent properly. Some engineers say they trust frontier models more than junior or mid-level developers, and the problem is non-experts paired with lower-quality models.
- **"Small apps were always insecure."** You are just seeing more of them under a magnifying glass. One veteran recalled two coworkers with two decades of experience shipping an app with no auth at all, and another with a session cookie in plaintext right next to a JWT.
- **"No way the new models do this."** A skeptic wondered which models these people use, since recent frontier ones surely would not. That claim is untested. Nobody in the discussion ran the same prompt and inspected the output.

All three can be partly true. Three layers, three shrugs, one leaked table.

## "Just add security to the prompt"

The jokes write themselves: *"be sure to secure the database... make no mistakes."* But several earnest replies propose close cousins. A follow-up pass asking "are you proud of it?". "Fix this, no bugs this time." A pasted "one prompt to fix all basic security".

Prompting is a request, not a gate. Nothing fails when the row policies are missing.

Approaches that people report working look different:

1. Enable row-level security on every table from day one.
2. Keep `service_role`-style keys on the server only.
3. Put real auth middleware on every protected route.
4. Remember that RLS is the safety net, not the whole circus. Serious apps gate database access at an API layer with authentication and authorization, and treat database policies as the last line.
5. Give sub-agents guideline files to consult before writing code. A non-technical builder reported this helps.

There is a structural limit here, though. A model reviewing its own output tends to bless it. It is the "looks good to me" problem: the agent says it is fine, nobody reads the code, and the hole ships. Gates must not depend on the author's opinion of itself.

A sketch (a proposal, not a reported setup) of a gate that does not care about prompts:

- A pre-merge checklist file in the repository.
- A CI job that fails the build if `sk_live_`, `service_role` or private-key headers appear in the build output.
- A CI check that lists database tables without policies and fails if the list is not empty.

Deterministic, dumb and effective. Which is the point.

## The deterministic answer

Everything above has a shared shape: a probabilistic author, a permissive environment and no checkpoint between them.

The engineering response is to put determinism where the damage happens. Scope the context deliberately: choose which files the model sees, and keep schema, policy files and secrets handling visible in that selection rather than hoping an autonomous agent wandered into them. Apply changes as explicit search-and-replace edits and read the resulting diff in Git like any other change, so an added `try/catch` that falls back to a test user is *seen*, not discovered by a stranger. Pay for the model with a key you control and watch what each request costs, so that a runaway loop shows up on a meter you own.

None of this makes code secure by itself. A human still has to read the diff. But an agent that edits twenty files while you make tea is an agent whose fallbacks you will never meet.

Autonomous agents are great at greenfield prototypes, where a leaked table holds fake rows. The trouble starts when the demo gets users.

## Blast radius: agents with production access

Same hygiene, other side of the table. A story circulated of an agent asked to add an Apple sign-in button that ended up deleting the user's data. The fixes engineers offered were unglamorous: never hand an AI the production database, run a Docker copy, work in small steps with plans and backups. One developer built an MCP SQL executor that gates commands behind approvals and withholds `DROP`. Another admitted giving an agent SSH to a staging box because it removed so much friction, and said, with admirable honesty, "this WILL happen eventually".

An app's own database policy and an agent's database access are the same question from two sides: who may do what, enforced by whom?

## What review actually catches

Picture a non-technical founder who pays around $1,000 for a senior review and hears "good, with a few security concerns". The reviewer-side numbers matter more: roughly 7 to 10 hours for an extensive review, versus 1 to 2 hours for a typical change. The checks they name are plain. Error handling on conversions. Auth middleware on every protected route.

The deeper argument is whether you must understand the code AI writes. One camp says AI output is another abstraction, like a validation library. The rebuttal is sharp: a library has a human who took responsibility for it. The model has a billing account. And an anecdote makes the point concrete: an agent replaced a block of code instead of adding to it, caught only because somebody read the diff.

One veteran called this a dangerous period where people THINK they can build enterprise-grade software. Unreviewed code is where holes hide, and a stranger finds them in three hours.

## The one-hour pre-launch audit

Everything below needs a browser and a terminal.

1. **Search the bundle.** In DevTools, Sources and Network, search for `sk_`, `service_role`, `OPENAI`, `-----BEGIN`. Check for shipped source maps.
2. **Probe the web root.** `curl https://yourdomain/.env` and a few common paths.
3. **Act as a stranger.** With only the public key, select every table. Then try to update your own profile row's role, paid and credit columns.
4. **Read the rules.** Look for `allow read, write: if true`. List tables that have no policy.
5. **Delete client identity.** Remove localStorage and device-ID identity. Enforce bans, roles and admin routes on the server.
6. **Grep for fallbacks.** Test users, mock checks, bypass flags, "if auth fails, continue".
7. **Cap the bill.** Set billing alerts and caps. At hobby scale, consider fixed-price hosting.
8. **Fence the agent.** Give it a dev database copy only. Require approval on destructive SQL.
9. **Get a human.** Anything touching payments or personal data deserves a real review.

One honest caveat: this concerns web-facing apps that hold user data. Many app classes, such as local tools and static pages with no accounts, avoid most of this by having nothing to steal.

## FAQ

**Isn't this just a model-quality problem that newer models will fix?**
Maybe in part, but nobody has measured it, and a permissive platform default plus an unspecific prompt will still produce an open table. A gate that fails the build does not need the model to improve.

**Doesn't turning on row-level security solve everything?**
It closes the biggest door, but policies are easy to write wrongly and they say nothing about leaked keys or fail-open logins. Treat them as the last layer behind an API that checks who is calling.

**Is a manual, diff-by-diff workflow too slow for a solo builder?**
It is slower per change and faster per incident, since a bad fallback costs minutes to catch in a diff and far more after launch. For a throwaway prototype, the trade-off can reasonably go the other way.

**Why not just ask the AI to audit the app?**
It can find real issues, and that is worth doing. But a model reviewing its own work tends to approve it, so treat its audit as a first pass and keep deterministic checks and a human behind it.

## Key Takeaways

- Every one of these failures is authority living in the browser. Ask of each piece of state who may change it and where that is enforced.
- Prompts are requests; policies, CI checks and reviewed diffs are gates. Build the gates.
- A one-hour audit with DevTools and curl finds most of what a stranger would find in three.

*A client is a guest, and a guest should never be handed the keys to decide who gets in.*
