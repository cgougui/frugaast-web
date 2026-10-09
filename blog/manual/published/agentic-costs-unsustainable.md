---
id: "agentic-costs-unsustainable"
title: "The 'Taxi Meter Effect': Why I stopped using agentic coding loops"
subtitle: "Unmasking the unsustainable unit economics of pay-per-token autonomous development."
date: "2026-10-09"
image: "/assets/blog/burning-tokens.png"
---

The era of predictable $20-a-month AI subscriptions is quietly ending, replaced by autonomous tools that silently burn through pay-per-token API budgets. If you caught the recent emails about Claude Code moving third-party harnesses to an "extra usage" pay-as-you-go tier, you already know the writing is on the wall.

Transitioning from deterministic, manually-scoped context to open-ended agentic loops introduces staggering hidden costs that disrupt standard engineering economics.

> "I tried once to use APIs for agents, but seeing a counter of money go up and eventually landing at like $20 for one change made it really hard to justify. I'd rather pay $200/month before I'd be OK with that sort of experience."

## The "Just Bring Your API Key" Bait and Switch

The software industry universally loved the flat-rate subscription era of basic chatbots. Predictability is the lifeblood of engineering budgets. A flat fee means the financial risk of high usage is entirely absorbed by the vendor. 

But modern agentic harnesses flip this model on its head. To run autonomous coding agents natively, developers are increasingly required to provide their own LLM API keys. On the surface, this sounds liberating. In practice, it is a financial trap. As one battle-scarred developer noted sarcastically about a newly launched CLI agent: *" 'Just API key' lol. Just hundreds of dollars at a minimum."*

This introduces the **Taxi Meter Effect** to software development. 

Watching a terminal output stream while a language model recursively debugs a minor state management issue is no longer just a test of patience—it is an exercise in financial anxiety. There is a profound psychological friction in seeing a counter of money go up in real-time. In one instance, an engineer evaluating a popular workspace agent reported spending over $12 for a mere 45 minutes of automated React refactoring. 

Because traditional professional developer tools historically top out around $1,000 to $2,000 a year per developer, paying $12 to $15 an hour for a tool that often hallucinates is terrible business math. 

## The Token Furnace: The Math Behind the Burn

Agentic loops run autonomously. They prompt themselves. They self-correct. They iterate. And every single step burns tokens. 

Let's look at the actual math of a typical agent resolving a standard ticket using a frontier model like Claude Opus 5 or GPT-5.6 Sol (assuming rough API costs of $15 / 1M input tokens and $75 / 1M output tokens):

1. **The Context Sweep:** The agent blindly sweeps your workspace to understand the codebase. It loads 120,000 tokens of context.
2. **The Loop:** It proposes a fix, runs your test suite, fails, reads the error, and tries again. It does this 6 times.
3. **The Bill:** `120,000 tokens * 6 loops = 720,000 input tokens.` 
4. **The Output:** Across those 6 loops, it generates 15,000 output tokens of explanations, terminal commands, and diffs.

You just spent **$10.80 on input tokens** and **$1.12 on output tokens**. You paid nearly $12 to fix a single off-by-one error or state misalignment, simply because the agent brute-forced its way through the problem by re-reading the entire context window every single loop.

The underlying problem is a fundamental lack of optimization. A simple regex parsing task does not require a heavy, slow, expensive reasoning model, yet agents will default to the most expensive model available to avoid failure. 

Some engineers in the trenches even suspect that in the token economy, bloat is entirely intentional. The theory goes exactly like this: *Bloated code is a feature, not a bug. It spends more tokens creating, spends more tokens refactoring, and makes it harder for a human to take over, thus locking you to the AI.* Whether by malicious design or mere architectural inefficiency, the result is identical. 

## The Case for Deterministic Control

There is a pragmatic engineering answer to this financial hemorrhage. 

Autonomous agents have their place. If the goal is prototyping a greenfield application from absolute scratch, throwing $50 of API credits at an agent to scaffold the architecture can be money well spent. 

But for maintaining, extending, and debugging complex, existing codebases, deterministic tools are vastly superior to agentic harnesses. The most cost-effective development paradigm relies on agentless control and precise manual file scoping. Instead of letting an AI arbitrarily crawl a codebase, developers must select exact files to build the prompt context. Utilizing fast, intuitive manual file selection—like a dedicated workspace treeview or ultra-fast fuzzy search—prevents context window bloat entirely. 

Furthermore, deterministic workflows allow you to strategically route tasks. You can offload 80% of your scaffolding and boilerplate generation to fast, free local models (like Qwen 3.8 or GLM-5.2) and only ping the expensive API endpoints for complex, deep-reasoning tasks. 

| Paradigm | Cost Predictability | Context Scope | Execution Model |
|---|---|---|---|
| **Traditional SaaS AI** | High ($20-$50 flat rate) | Implicit (IDE tab-based) | Single-turn autocomplete |
| **Agentic Harness** | Low (Pay-per-token meter) | Autonomous (Crawls directories) | Multi-turn self-prompting |
| **Deterministic BYOK** | High (Strict control) | Explicit (Manual selection) | Single-turn Git diff |

Replacing autonomous, multi-step execution loops with standard Git diffs restores sanity to the development cycle. The AI generates a strict Search/Replace block. The developer reviews the diff. The code is applied and committed. No autonomous self-prompting. Clear tracking of precise project API costs. Absolute control.

## The Pushback: "But doesn't this save time?"

The most common defense of agentic loops is that developer time is the most expensive resource of all. If an agent saves you an hour of work, spending $12 on tokens is theoretically a massive ROI.

In reality, it rarely plays out this way outside of synthetic benchmarks. While agents excel at generating boilerplate for fresh projects, the time spent babysitting an agent, undoing its autonomous hallucinations in a complex legacy codebase, and reverting broken commits often negates the initial speed boost. You end up wasting both time *and* tokens. 

As token costs drop, agentic frameworks aren't getting cheaper for the end user—they are simply increasing their looping complexity and context sweeps, consuming vastly more tokens and keeping your final bill exactly where it was.

## The Grim Trajectory of AI Pricing

The current economics of artificial intelligence are fundamentally unstable. AI vendors have spent the last few years burning venture capital to subsidize model usage. As that subsidy ends, prices will inevitably rise. 

Corporate management often refuses to approve a $70/year license for a standard SQL productivity tool, yet happily approves spending massive amounts on enterprise-wide AI agent tooling. It is a misalignment of priorities driven by hype rather than unit economics. Until agentic harnesses stop relying on brute-force context sweeps and start employing actual semantic precision, operating open-ended agentic loops on a pay-per-token basis is a reckless allocation of your engineering budget.

The ultimate luxury in software engineering isn't infinite automation—it's absolute, predictable control over your tools. 

I'm sticking to deterministic tools and local models where I can. How are you managing the token burn in your teams?
