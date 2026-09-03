# Product

## Goal

Prompt First should give a learner the real experience of directing an autonomous software-building agent while keeping the environment safe enough for education. The product teaches judgment over software outcomes rather than source-code syntax.

## Non-goals

Prompt First is not:

- a Blockly or Scratch replacement;
- a prompt-writing course;
- an IDE tutorial;
- a one-shot app generator;
- a system that hides all technical concepts from the learner;
- a wrapper whose primary value is the underlying coding model.

## Learner competencies

A successful learner should be able to transfer these skills to a different agent, model, or coding workspace:

### Product framing

Define the user, problem, outcome, constraints, acceptance criteria, quality requirements, and exclusions.

### Delegation

Choose when specialist skills or tools are appropriate and understand what evidence each capability can produce.

### Verification

Require observable evidence instead of accepting fluent claims of completion.

### Quality attributes

Reason about accessibility, responsive behavior, loading/empty/error states, performance, reliability, privacy, authorization, and recovery.

### Consequences

Distinguish reversible local work from external effects such as communication, payments, publishing, credential use, and production mutation.

### Calibrated trust

Recognize that a polished preview or confident agent message is not proof that requirements are satisfied.

## Core artifacts

### Mission Contract

A living product agreement inferred from conversation and edited throughout the mission. It should include:

- target user and problem;
- desired outcome;
- primary journeys;
- acceptance criteria;
- quality requirements;
- constraints and exclusions;
- consequential actions;
- unresolved decisions.

The contract must not become a long form that blocks the first useful preview. Reversible implementation can begin while assumptions remain provisional.

### Product Map

A learner-readable model of the system:

- screens;
- actors and roles;
- data objects;
- integrations;
- permissions;
- critical flows;
- consequential actions.

This preserves the useful inspectability of the old block-based idea without forcing implementation into an artificial programming language.

### Evidence Ledger

Each important requirement has a status and evidence.

Recommended states:

- `proven` — supported by reproducible evidence;
- `failed` — evidence shows the requirement is not satisfied;
- `inferred` — believed true from implementation or inspection but not directly verified;
- `unverified` — no sufficient evidence yet;
- `not_applicable` — explicitly removed from scope.

Evidence can include browser traces, screenshots, deterministic tests, state inspection, network/console observations, accessibility checks, or mock-integration receipts.

## Agent roles

### Builder

Optimized to create a high-quality working product quickly. It can implement, test, repair, invoke skills, and collect evidence autonomously within capability policy.

### Coach

Optimized for learning. It should intervene when the learner needs to make a product decision, interpret evidence, or notice an important gap. It should not block implementation merely to force participation.

These roles may initially share an underlying model but must have separate prompts, context, and success criteria.

## Interaction principles

- Start doing useful reversible work immediately.
- Ask high-value questions only when they materially affect intent, consequences, or architecture.
- Do not force a plan-approval ritual before ordinary implementation.
- Suggestion chips may reduce blank-page anxiety, but freeform intent is primary.
- Tutorials are contextual and optional whenever possible.
- Technical concepts should be explained when relevant, not hidden through word substitution.
- Tool and skill activity should be visible enough to build a correct mental model without exposing private reasoning.
- Every consequential action should make its consequence legible before approval.

## Initial specialist skills

The first vertical slice should support four explicit review skills:

1. **Requirements reviewer** — checks Mission Contract completeness and testability.
2. **Responsive/mobile reviewer** — exercises key journeys at defined viewport sizes.
3. **Accessibility reviewer** — combines automated checks with keyboard/interaction verification.
4. **Consequential-flow reviewer** — identifies and tests destructive, financial, identity, communication, and production-like paths using simulations.

Later skills can cover performance, privacy, security, data integrity, integration contracts, and release review.

## First vertical slice

The first slice should prove the complete learning loop with one bounded responsive-web runtime and mock integrations. It should include:

- a learner-entered product idea;
- immediate agent activity;
- a working preview;
- continuously updated Mission Contract;
- Product Map;
- Evidence Ledger;
- skill/tool receipts;
- browser verification;
- rollback/snapshots;
- release review.

Do not broaden into multiple runtimes, arbitrary MCP servers, arbitrary skills, real payments, or broad curriculum content until this loop is demonstrably good.
