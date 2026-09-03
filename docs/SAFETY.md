# Safety model

## Principle

Prompt First does not treat model moderation as its primary safety boundary. The system constrains what the agent can reach and distinguishes reversible computation from real-world consequences.

Input classification may still be useful for abuse handling or classroom policy, but it must run in parallel where possible and must not substitute for containment.

## Consequence tiers

### Tier 0 — automatic and reversible

Examples:

- read/write inside the learner workspace;
- run approved local commands;
- start the preview server;
- execute tests;
- use curated skills;
- restore or rewrite generated product code.

These should not interrupt auto mode.

### Tier 1 — automatic but receipted

Examples:

- browser verification;
- dependency installation inside the workspace;
- simulated external effects;
- test-database mutations;
- specialist-review invocation.

The action can run automatically but must remain inspectable.

### Tier 2 — simulated by default

Examples:

- email and SMS;
- payments;
- identity actions;
- webhooks;
- destructive account actions;
- administrative effects.

The first implementation uses explicit mock effect receipts so learners can practice system design without creating real consequences.

### Tier 3 — explicit approval

A real external effect requires a learner-visible description of exactly what will happen, then a one-time approval token bound to that exact request.

Approval is never represented by a generic "allow external access" switch.

## Host-owned secrets

Secrets are environment variables of the trusted control plane or sandbox broker. They are not:

- written into learner files;
- included in prompts;
- returned by custom agent tools;
- placed in preview URLs;
- stored in the Evidence Ledger.

The provided generic live-effect executor uses a fixed host-configured destination. An agent cannot choose an arbitrary live webhook endpoint and inherit a host credential.

## Idempotency

Every effect execution requires an idempotency key. Repeating an identical effect execution returns the prior receipt rather than creating another consequence.

A live approval is one-time. A new idempotency key cannot be used to reuse an old approval.

## Browser verification and SSRF

The browser verifier rejects preview URLs whose hostname is not explicitly allowlisted before launching Playwright. The local default allows only `localhost` and `127.0.0.1`.

A production sandbox adapter should issue authenticated preview origins and add only those controlled origins to the verifier policy. Do not broaden the verifier to arbitrary internet URLs.

## Local provider is not a sandbox

The repository's `LocalWorkspaceProvider` is a developer convenience. A temporary directory does not provide process, filesystem, resource, or network isolation. The server refuses to start with this provider when `NODE_ENV=production`.

Before exposing Prompt First to untrusted learners, replace it with a remote sandbox implementation and verify:

- workspace escape attempts fail;
- internal-network destinations are unreachable;
- host filesystem paths are unreachable;
- resource exhaustion is bounded;
- dependency install scripts cannot reach host credentials;
- workspace processes die when the workspace is destroyed.

## OpenCode permissions

Curated workspace configuration denies external-directory access and the built-in question tool. Web fetch/search require approval. Studio artifact tools are allowed.

These permissions improve user experience and reduce accidental capability, but they are not equivalent to an operating-system sandbox. Production security must remain enforceable even if the model ignores its instructions.

## Skills and supply chain

The first implementation copies a curated `.opencode` directory into every learner workspace. Arbitrary downloaded skills or MCP servers are not part of the default learner environment.

A future skill registry should attach:

- author/version;
- content hash/signature;
- allowed tools;
- network destinations;
- data classes;
- side effects;
- risk tier;
- automated tests;
- curriculum concepts.

## Failure behavior

Safety-critical host operations fail closed:

- unknown workspace → reject;
- live effect without approval → reject;
- expired/mismatched/reused approval → reject;
- no live executor → fail with receipt;
- non-allowlisted browser origin → reject.

A model or browser failure must not silently promote a mock effect to live mode.

## Red-team targets

Before a production pilot, include scenarios for:

- prompt injection in imported content;
- attempts to read outside the workspace;
- localhost/internal-network scanning;
- package-install exfiltration;
- secrets in generated logs;
- arbitrary live-effect destinations;
- repeated payment/communication requests;
- approval replay;
- malicious preview URLs;
- denial-of-service/resource exhaustion;
- attempts to redefine studio tools or weaken permissions.
