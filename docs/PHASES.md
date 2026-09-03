# Phase completion status

This file distinguishes implementation completion from production readiness.

## Phase 0 — benchmark and eval harness

Implemented:

- 25 canonical missions;
- fresh workspace per run;
- provider/model override;
- event-driven first-action and first-preview timing;
- tool/evidence/diff/cost/token receipts;
- evidence provenance (`agent` versus `host`);
- deterministic hidden trace/policy scoring that requires host evidence for proof checks by default;
- repeated-run support.

Not claimed:

- validated correlation between benchmark score and learner outcomes;
- full semantic black-box correctness for every generated product.

## Phase 1 — polished vertical slice

Implemented:

- mission launcher and freeform mission;
- dedicated learner workspace creation;
- real OpenCode session and event stream;
- autonomous `studio-builder` profile;
- stop control and learner redirects;
- Preview / Mission Contract / Product Map / Evidence surfaces;
- desktop/tablet/mobile preview controls;
- structured artifact tools;
- specialist skills;
- host Playwright verification receipts;
- workspace-bound preview registration with explicit host/port policy;
- explicit unverified states and visible evidence provenance;
- mock/live effect queue.

Production blocker:

- replace local workspace provider with a true remote sandbox before untrusted use.

## Phase 2 — learning missions

Implemented:

1. Shelter Shift Board — capacity, cancellation, responsive QA, accessibility.
2. Appointment Desk — roles, exclusivity, privacy, failure consistency.
3. Community Fundraiser — mock payments/confirmations, idempotency, effect receipts.

A freeform mission remains available with baseline quality/evidence requirements.

## Phase 3 — real integration boundary

Implemented:

- common effect request contract for mock/live modes;
- automatic deterministic mock execution;
- exact-scope short-lived live approval;
- one-time approval consumption;
- idempotent execution receipts;
- fixed host-side live executor interface;
- optional generic live webhook executor using host-only credentials.

Not claimed:

- a production Stripe, email, SMS, or identity provider is configured;
- classroom learners should be allowed to activate live mode without additional policy/identity controls.

The point of Phase 3 is that a real provider can be added behind the host interface without teaching the model a new secret-bearing path.

## Completion criterion

Phases 0–3 are implementation-complete when install, typecheck, production build, unit/eval tests, and browser tests pass on the slim repository and the two core trust boundaries are enforced:

1. a trusted browser check can only target the registered preview origin for its workspace;
2. a builder-reported `passed` claim cannot be presented or scored as host-verified proof.

Production readiness remains a separate milestone and requires a remote sandbox plus deployment/classroom controls described in the safety documentation.
