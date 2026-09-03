# Architecture

## Design constraint

Prompt First must preserve authentic autonomous agent behavior while keeping the learner and external world inside hard capability boundaries.

The architecture should therefore separate four concerns:

1. learner experience;
2. agent runtime;
3. sandbox/capability enforcement;
4. product evidence and learning state.

Do not encode product pedagogy deep inside a fork of the coding agent unless there is no stable external seam.

## High-level system

```text
Learner browser
  |
  v
Prompt First application
  |-- Coach context
  |-- Mission Contract
  |-- Product Map
  |-- Evidence Ledger
  |-- Capability policy
  |-- Skill registry
  |
  v
Agent adapter
  |
  +--> OpenCode today
  +--> other coding agents/models later
  |
  v
Sandbox adapter
  |-- filesystem boundary
  |-- process/compute limits
  |-- network egress policy
  |-- secret broker
  |-- snapshots / rollback
  |-- preview exposure
  |
  v
Bounded project runtime
```

## Learner-facing application

`packages/web` should remain the product surface. It should not mirror an IDE.

Primary surfaces:

- conversation and contextual coaching;
- live preview;
- Mission Contract;
- Product Map;
- Evidence Ledger;
- skill/tool activity and receipts;
- release review.

Raw code may exist behind an advanced/debug surface later, but source inspection is not the core learning interaction.

## Agent adapter

The application should depend on a narrow agent interface instead of OpenCode-specific behavior throughout the UI.

Conceptually:

```ts
interface AgentRuntime {
  createSession(input: SessionInput): Promise<Session>
  send(input: AgentInput): Promise<void>
  subscribe(sessionId: string, onEvent: (event: AgentEvent) => void): () => void
  stop(sessionId: string): Promise<void>
}
```

Normalize agent events into product-level event types such as:

- message;
- tool_started;
- tool_completed;
- skill_started;
- skill_completed;
- evidence_created;
- approval_requested;
- preview_changed;
- failure.

The current OpenCode SDK is an implementation detail behind this boundary.

## Sandbox adapter

The first implementation may use E2B, Cloudflare Sandbox, Daytona, or another provider, but product code should target an internal interface.

Required capabilities:

```ts
interface SandboxProvider {
  create(profile: RuntimeProfile): Promise<Sandbox>
  exec(command: ApprovedCommand): Promise<ExecutionResult>
  readFile(path: WorkspacePath): Promise<string>
  writeFile(path: WorkspacePath, content: string): Promise<void>
  exposePreview(port: number): Promise<Preview>
  snapshot(): Promise<SnapshotId>
  restore(snapshot: SnapshotId): Promise<void>
  configureEgress(policy: EgressPolicy): Promise<void>
  destroy(): Promise<void>
}
```

The provider must be replaceable. Safety policy belongs above provider-specific APIs.

## Runtime profiles

The learner experience can be language-agnostic while execution remains profile-based.

The initial profile should be a reproducible responsive web application environment with:

- a known framework and build tool;
- fixed preview behavior;
- browser automation;
- a managed test database or fixture layer;
- mock identity, email, payment, storage, and webhook adapters;
- curated package policy;
- deterministic quality checks.

Do not allow arbitrary language/runtime selection in the first milestone.

## Skills

Skills are versioned, inspectable capability packages. The application should keep a registry with metadata beyond the skill instructions themselves:

- id, name, author, and version;
- content hash/signature;
- allowed tools;
- allowed network destinations;
- accessible data classes;
- expected side effects;
- risk tier;
- automated tests;
- curriculum concepts covered.

The first release should use only curated skills. Arbitrary downloaded skills or MCP servers are out of scope.

## Product-state services

Mission Contract, Product Map, and Evidence Ledger should be explicit structured application data rather than inferred only from chat history or agent files.

Every update needs provenance:

- learner decision;
- builder inference;
- coach suggestion;
- tool evidence;
- deterministic check.

This lets the UI distinguish facts, assumptions, and evidence without parsing prose.

## Evidence model

A requirement should link to one or more evidence records.

Conceptually:

```ts
type EvidenceStatus = "proven" | "failed" | "inferred" | "unverified" | "not_applicable"

interface RequirementEvidence {
  requirementId: string
  status: EvidenceStatus
  evidenceIds: string[]
  checkedAt?: string
}
```

Evidence records should be immutable receipts where possible. New evidence supersedes old evidence rather than silently rewriting history.

## Model routing

Models are selected through an adapter. Record for every run:

- model and provider;
- model/provider version where available;
- routing mode;
- parameters;
- token usage and cost;
- latency;
- tool-call outcomes.

Initial experiments may use GLM-5.3-Flash through OpenRouter, but benchmark results determine whether it is suitable for each role.

## Migration rule

When touching retained OpenCode code, prefer adapters or upstream-compatible changes. Fork-only changes inside the runtime need a documented reason because they increase merge and maintenance cost.
