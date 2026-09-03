# Product model

## Purpose

Prompt First is a flight simulator for agentic product engineering. A learner gets the real experience of directing an autonomous software builder while the environment makes professional product reasoning visible and consequential actions safe enough to practice.

The educational target is not prompt cleverness or syntax recall. It is calibrated product judgment.

## Responsibility split

### Learner

The learner owns:

- who the product is for;
- what problem matters;
- what success means;
- important behavior and tradeoffs;
- acceptable risk;
- whether the result should ship.

### Builder

The builder owns:

- implementation choices inside the selected runtime profile;
- code changes;
- dependency use inside policy;
- local tests and repair loops;
- invoking specialist skills;
- producing evidence instead of unsupported completion claims.

### Coach

The coach exists to transfer judgment, not to maximize completion. It should surface one high-value learner decision when the builder would otherwise silently decide product intent. It must not turn the experience into a question wizard.

### Platform

The platform owns:

- workspace and network boundaries;
- credentials and external effects;
- action receipts;
- deterministic evaluation;
- clear distinction between tested and unverified claims.

## Core artifacts

### Mission Contract

A living product agreement with:

- user;
- problem;
- desired outcome;
- acceptance criteria;
- quality requirements;
- constraints;
- consequential actions;
- unresolved decisions.

The contract is inferred and updated during normal product conversation. It is not a mandatory pre-build form.

### Product Map

A product-level system model containing:

- actors and roles;
- user-facing surfaces;
- important data;
- integrations;
- critical journeys;
- permissions and consequential edges.

This preserves the inspectability that Blockly was trying to provide without forcing the learner to manipulate a fake programming language.

### Evidence Ledger

Every important requirement has a status:

- `unverified`;
- `testing`;
- `passed`;
- `failed`.

Evidence records the verification method, result, and receipt. Agent prose alone is not evidence.

## Learner competencies

1. **Problem framing** — identify users, outcomes, constraints, and meaningful definitions of done.
2. **Delegation** — use builders, skills, and tools for the right jobs without micromanaging implementation.
3. **Verification** — demand observable evidence and distinguish a polished screen from a correct system.
4. **Quality specification** — reason about responsive behavior, accessibility, performance, reliability, privacy, and error states.
5. **Consequence awareness** — distinguish local changes, test data, simulated effects, and real external effects.
6. **Calibrated trust** — understand what the agent proved, what it inferred, and what remains unknown.

## Interaction principles

- Deliver a working product surface before demanding substantial curriculum effort.
- Reversible implementation should begin as soon as intent is sufficient to make progress.
- Ask a learner question only when a product decision matters or the builder is genuinely blocked.
- Suggestion chips may reduce blank-page anxiety but must never become the primary conversational grammar.
- Tutorials are just-in-time explanations attached to a concrete evidence gap.
- Technical implementation details are available on request; they are not forbidden vocabulary.
- Skills and tool calls should be legible enough for a learner to understand what capability was used and why.

## Runtime philosophy

The learner experience is language-agnostic. The runtime is intentionally bounded.

The initial `web-react` profile provides one known build/test/preview contract so model quality, pedagogy, and safety can be measured without arbitrary toolchain variance. Future profiles can add Python services, mobile applications, or other environments through the same sandbox-provider interface.

## First-run target

A successful first session should feel like this:

1. Learner describes a useful product.
2. The builder starts reversible work immediately.
3. A preview appears while the Mission Contract is still being refined.
4. The learner observes a real product behavior or gap.
5. A specialist skill tests a quality property or consequential flow.
6. Evidence appears in the ledger.
7. The learner makes a meaningful product decision.
8. The agent repairs and re-verifies the product.
9. Release review distinguishes proven behavior from remaining uncertainty.
