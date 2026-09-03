# Architecture

## Design objective

Prompt First should feel like a real autonomous software workspace while keeping product-specific logic independent from any one coding-agent runtime, model provider, or sandbox vendor.

The repository therefore owns orchestration contracts and evidence, not the coding engine.

## System diagram

```text
┌──────────────────────────────── browser ────────────────────────────────┐
│                                                                         │
│  mission launcher                                                       │
│       │                                                                 │
│       ▼                                                                 │
│  conversation ─────────── product artifacts ───────── preview iframe    │
│       │                    │                                             │
│       │                    ├── Mission Contract                          │
│       │                    ├── Product Map                               │
│       │                    └── Evidence Ledger                           │
│       │                                                                 │
│       ├──────── OpenCode SDK client ────────────────┐                   │
│       │                                             │                   │
│       └──────── studio control API ───────┐         │                   │
└───────────────────────────────────────────┼─────────┼───────────────────┘
                                            │         │
                         ┌──────────────────┘         │
                         ▼                            ▼
                studio control plane          OpenCode runtime
                ├── workspace provider        ├── studio-builder
                ├── browser verifier          ├── studio-coach
                └── effect gateway            ├── release-reviewer
                                              ├── curated skills
                                              └── structured tools
                                                     │
                                                     ▼
                                               learner workspace
```

## Runtime boundary

The web client speaks the published `@opencode-ai/sdk` API. The local control plane launches the pinned `opencode-ai` binary. OpenCode source is not vendored.

This is deliberate:

- upgrading or replacing the coding engine should not rewrite product UI;
- model/provider experiments remain benchmark configuration;
- security boundaries live outside model instructions;
- Prompt First does not inherit unrelated TUI, release, provider, or community infrastructure.

The current package versions are pinned so benchmark comparisons are reproducible.

## Workspace provider

`WorkspaceProvider` is the abstraction that owns lifecycle and directory identity.

The repository includes `LocalWorkspaceProvider` for development. It creates a fresh temporary directory, copies the selected runtime profile and curated `.opencode` configuration, initializes Git, and records the mission. It is intentionally labeled `development-only`.

A production provider must replace it with an isolated environment that enforces:

- filesystem isolation;
- process isolation;
- CPU/memory/disk limits;
- controlled outbound network access;
- secret isolation;
- authenticated preview exposure;
- lifecycle cleanup and kill controls.

The learner UI must not change when the provider changes.

## Runtime profiles

A runtime profile is a bounded implementation environment with known operations:

- create;
- install/warm;
- run;
- preview;
- test;
- snapshot/restore;
- destroy.

Only `web-react` ships in the first implementation. This makes the learner experience language-invisible without pretending arbitrary runtimes are equally safe or measurable.

## Agent roles

### `studio-builder`

The primary autonomous implementer. It can perform reversible project work without plan approval, use specialist skills, run local commands, and publish artifacts. External directory access is denied. External web access requires approval.

### `studio-coach`

A non-implementing subagent. It identifies at most one product decision the learner should own. It is not a tutorial state machine.

### `release-reviewer`

A read-only implementation reviewer that may run verification. It checks evidence and unresolved risk independently from the builder.

## Structured artifact tools

Agent/UI communication uses stable product-level tools:

- `studio-contract`;
- `studio-map`;
- `studio-preview`;
- `studio-evidence`;
- `studio-browser-check`;
- `studio-effect-request`.

The UI derives state from completed tool parts in the session trace. This has several advantages over parsing prose:

- artifact updates are typed;
- evidence can be distinguished from explanation;
- activity remains inspectable;
- models can change without changing UI parsing;
- benchmark runners can score the same trace without rendering the app.

## Browser verification

Browser checks execute in the trusted control plane with Playwright. The agent submits a preview URL and check kind through `studio-browser-check`; the host checks that the origin is allowlisted before launching a browser.

Initial checks are deliberately narrow:

- smoke/navigation + console errors;
- responsive horizontal-overflow checks across three viewports;
- keyboard focus reachability;
- baseline semantic accessibility checks;
- initial-load performance measurement.

These checks create receipts. They do not claim complete accessibility, production performance, or semantic correctness.

## External effect gateway

Email, payment, webhook, and identity effects are modeled as effects rather than arbitrary network calls.

1. Agent calls `studio-effect-request`.
2. UI registers the exact effect with the control plane.
3. Mock effects execute automatically and return a receipt.
4. Live effects remain pending.
5. Learner explicitly approves the displayed live effect.
6. Host issues a short-lived one-time token bound to the exact effect fingerprint.
7. Host executes through a trusted live executor with an idempotency key.
8. UI displays the receipt.

The model never receives the live credential or approval token.

## Session flow

1. Learner chooses or defines a mission.
2. Control plane creates a dedicated workspace.
3. Browser subscribes to OpenCode events scoped to that directory.
4. Browser creates a session scoped to the same directory.
5. Browser submits the starter message with a stable message ID.
6. Builder edits and runs the product immediately.
7. Typed tool parts update learner artifacts.
8. Host browser/effect operations attach receipts.
9. Learner redirects or stops the builder at any time.
10. Ending the mission aborts the session and destroys the development workspace.

## Deployment shape

The current repo is a research implementation, not a hosted classroom deployment. A production deployment should put the web app and control plane behind one authenticated origin, move the agent workspace to a remote sandbox provider, broker previews through authenticated URLs, and introduce classroom identity/retention policy without exposing sandbox credentials to the browser.
