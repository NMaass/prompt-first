# Prompt First

Prompt First is an experimental browser workspace for learning **agentic product engineering**: defining what software should do and feel like, delegating implementation to an autonomous coding agent, and deciding whether the result is actually good enough to ship.

The learner is not expected to program. The agent writes code. The learner owns product intent, requirements, tradeoffs, verification, and release judgment.

## Product thesis

Modern agentic coding changes the useful beginner skill set. Prompt First therefore teaches learners to:

- define users, problems, outcomes, constraints, and acceptance criteria;
- set quality requirements for accessibility, mobile layouts, performance, reliability, privacy, and security;
- use specialist skills and tools intentionally;
- distinguish mocks from real integrations and reversible actions from consequential ones;
- inspect previews, browser traces, tests, screenshots, state changes, and other evidence;
- challenge unsupported agent claims and iterate from observed product behavior;
- make an explicit release decision based on what is proven, failed, or still unverified.

This is deliberately **not** a Blockly/Scratch-style programming environment and not a conventional coding course with AI assistance.

## Core product artifacts

The learner-facing workspace is organized around three durable artifacts:

1. **Mission Contract** — who the product is for, what outcome matters, acceptance criteria, quality requirements, consequential actions, constraints, and unresolved decisions.
2. **Product Map** — screens, actors, data, integrations, permissions, critical flows, and consequential actions.
3. **Evidence Ledger** — every important requirement linked to evidence such as a browser run, screenshot, test, state inspection, or an explicit `unverified` status.

The builder can begin reversible implementation immediately while these artifacts are refined in parallel.

## Responsibilities

### Learner

Owns intent, tradeoffs, risk tolerance, and the release decision.

### Builder agent

Owns implementation, tests, repairs, tool use, and evidence collection inside an approved runtime profile.

### Coach

Owns learning interventions. It should surface missing product reasoning and transfer responsibility to the learner without turning the experience into a quiz or blocking useful autonomous work.

### Platform

Owns containment, permissions, consequence boundaries, auditability, deterministic checks, and truthful status reporting.

## Safety model

Prompt First is designed for authentic auto mode, not constant approval prompts.

Safety should be enforced primarily at capability and consequence boundaries:

- project-local file edits, approved commands, tests, previews, screenshots, and mock-data mutations can run automatically;
- approved package installs and metered tools can run automatically but must be recorded;
- email, SMS, payments, OAuth, destructive account actions, and similar effects are simulated by default;
- real credentials, real communication, money movement, public publishing, production data mutation, and other irreversible external effects require explicit approval;
- sandbox filesystem, network, secret, compute, and spend boundaries must remain enforceable even if the model behaves incorrectly.

Input classification may run in parallel with model work, but it is not the primary security boundary.

See [docs/SAFETY.md](docs/SAFETY.md).

## Runtime strategy

The learner experience should be language-agnostic. The first runtime should not be.

The initial vertical slice should use one bounded, reproducible web-app profile with known build, test, browser, database, and integration behavior. Additional language/runtime profiles can be added only when they have equivalent containment and verification support.

The coding engine is intentionally replaceable. OpenCode is currently retained as the inner agent runtime, but Prompt First-specific product concepts should live outside OpenCode internals wherever possible.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Model strategy

Model choice is an evaluation variable, not a product identity. The first benchmark target is GLM-5.3-Flash through OpenRouter because it is inexpensive enough for repeated agentic runs and supports tool use and multimodal review. The system must keep a model adapter and compare against stronger reference models before relying on any single model in production.

## Current scope

This repository is being reset around a single polished vertical slice:

- freeform learner conversation;
- immediate autonomous implementation;
- live product preview;
- Mission Contract, Product Map, and Evidence Ledger surfaces;
- visible skill/tool activity;
- bounded runtime and mock integrations;
- browser-based verification;
- requirements, responsive/mobile, accessibility, and consequential-flow review skills;
- release review that separates proven, failed, inferred, and unverified claims.

Anything that exists only to support the previous Blockly, forced plan-approval, prompt-crafting lesson, output-jargon rewriting, or serial safeguard design is legacy and should not be revived.

## Evaluation before curriculum expansion

Before building a broad course, Prompt First should maintain a canonical benchmark of product missions and measure:

- time to first visible action and useful preview;
- tool-call validity and build success;
- hidden critical-flow success;
- unsupported completion claims;
- policy-boundary attempts;
- recovery after failures;
- evidence coverage;
- cost and latency;
- learner transfer to a new mission with less coaching.

See [docs/EVALUATION.md](docs/EVALUATION.md).

## Development

Requirements:

- Bun 1.3.11

Run the OpenCode backend:

```bash
bun install
bun run dev
```

Run the learner-facing web app in another terminal:

```bash
bun run dev:web
```

Typecheck:

```bash
bun run typecheck
```

The web package also supports:

```bash
bun --cwd packages/web run build
bun --cwd packages/web run typecheck
```

## Repository map

- `packages/web` — learner-facing React workspace.
- `packages/opencode` — retained OpenCode agent runtime.
- `packages/sdk/js` — client SDK used by the web workspace.
- `packages/plugin`, `packages/util`, `packages/script` — upstream runtime support required by OpenCode.
- `docs/` — product, architecture, safety, and evaluation decisions.

## Status

Research prototype. The next milestone is a verified vertical slice, not feature breadth.

## Upstream

Prompt First is derived from [OpenCode](https://github.com/anomalyco/opencode). OpenCode is a separate project and retains its own licensing and attribution requirements.
