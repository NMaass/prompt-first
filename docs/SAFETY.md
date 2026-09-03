# Safety

## Principle

Prompt First should feel autonomous because ordinary reversible work is autonomous. Safety is enforced at capability and consequence boundaries rather than by serially interrupting every model response.

Input moderation can run in parallel as one signal. It is not sufficient as the security boundary.

## Why input-only safety is insufficient

A benign request can still lead an agent or dependency to:

- access files outside the project;
- contact unintended network destinations;
- expose credentials;
- execute malicious install scripts;
- follow prompt injection from imported content;
- send real communication;
- mutate production data;
- create a real charge;
- consume excessive compute, network, or model spend.

These risks must remain constrained even when the model is wrong.

## Consequence tiers

### Tier 0 — automatic and silent

- project-local reads/writes;
- approved commands;
- development server startup;
- deterministic tests;
- browser interaction against the test product;
- screenshots and traces;
- mock-data mutation;
- snapshot and rollback.

### Tier 1 — automatic but explicitly recorded

- approved package installation;
- test-schema changes;
- specialist skill invocation;
- import of external reference content;
- metered model/tool calls.

### Tier 2 — simulated by default

- email and SMS;
- payments and refunds;
- OAuth and account linking;
- webhooks;
- destructive account actions;
- analytics events;
- administrator operations.

Simulation must produce realistic receipts so the learner can verify behavior without causing real effects.

### Tier 3 — explicit learner approval

- exposing or using a real credential;
- communicating with a real person;
- charging, refunding, or transferring money;
- publishing publicly;
- attaching a real domain;
- mutating a production data store;
- any irreversible or materially external action.

Approvals should describe the concrete effect, target, scope, and reversibility. Generic `Allow` prompts are insufficient.

## Sandbox requirements

The production sandbox must enforce:

- filesystem isolation;
- process isolation;
- CPU, memory, disk, and duration limits;
- network egress policy;
- authenticated preview exposure;
- secret brokering outside model context where possible;
- spend limits;
- snapshots/rollback;
- complete tool receipts.

The model should not be capable of granting itself additional permissions.

## Network policy

Outbound access should be deny-by-default for the learner runtime, then opened narrowly by profile or tool.

Credentials should be injected by a broker only for an approved destination and operation. Avoid writing durable secrets into project files or exposing raw secret values to the model.

## Skills and MCP

The first release should not allow arbitrary third-party skills or MCP servers.

Curated capabilities need:

- version and provenance;
- declared tools and network access;
- declared side effects;
- risk tier;
- tests;
- revocation capability.

Imported content should be treated as untrusted input even when the learner requested it.

## Moderation

Input classification should be lightweight and parallelizable. It may block clearly unsafe or out-of-scope learner requests, but the builder should not wait on expensive output classification for ordinary reversible actions.

Output safety should be achieved through:

- capability enforcement;
- deterministic validation;
- consequence approvals;
- evidence requirements;
- content filters only where the product surface specifically requires them.

## Failure behavior

Security-relevant infrastructure should fail closed. For example, if the permission service cannot determine whether a real payment is authorized, the payment must not happen.

Non-security learning aids may fail open when doing so cannot create an external consequence. The distinction must be explicit in code.

## Red-team targets

Before classroom use, test at minimum:

- prompt injection in webpages, files, package metadata, and skill content;
- attempts to escape project filesystem boundaries;
- access to metadata/internal network ranges;
- secret exfiltration;
- dependency install hooks;
- command obfuscation;
- excessive resource/spend requests;
- fake evidence and unsupported completion claims;
- bypassing simulation to reach real integrations;
- social-engineering approval prompts;
- cross-session data leakage.

Safety results belong in the benchmark, not in an informal checklist.
