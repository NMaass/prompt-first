# Prompt First

Prompt First is an experimental browser workspace for learning **agentic product engineering**: defining what software should accomplish, delegating implementation to an autonomous coding agent, and deciding whether the resulting evidence is good enough to ship.

The project deliberately does **not** teach programming syntax first. The learner works at the level of users, requirements, product behavior, quality attributes, integrations, consequences, and verification while the builder works in a real but bounded software environment.

## What the learner owns

- the user and problem;
- the desired outcome and acceptance criteria;
- product tradeoffs and consequential decisions;
- quality expectations such as accessibility, responsive behavior, performance, reliability, and privacy;
- whether the evidence is sufficient to release.

The autonomous builder owns implementation. The platform owns containment, trusted receipts, and consequence boundaries. A separate coach role is available to surface high-value product decisions without turning the experience into a scripted tutorial.

## Core workspace

The learner-facing workspace is organized around four persistent surfaces:

1. **Preview** — the running product at desktop, tablet, and mobile sizes.
2. **Mission Contract** — users, problem, outcome, acceptance criteria, quality requirements, constraints, and consequences.
3. **Product Map** — actors, surfaces, data, integrations, critical flows, and permissions.
4. **Evidence Ledger** — each important requirement marked passed, failed, testing, or unverified, with provenance that distinguishes builder-reported checks from host-verified receipts.

Skills and tool calls remain visible as product activity. Raw chain-of-thought is not part of the interface.

## Architecture

Prompt First is no longer an OpenCode fork. The repository owns only the product-specific layers:

```text
browser workspace
      │
      ├── OpenCode SDK client ──► pinned OpenCode runtime
      │                              │
      │                              └── learner workspace + curated skills/tools
      │
      └── studio control plane
             ├── workspace + preview capability
             ├── browser verification
             └── mock/live effect gateway
```

OpenCode is a replaceable agent runtime behind the session boundary. The initial runtime profile is a React/TypeScript web app, but implementation language is intentionally invisible to the learner.

Trusted Playwright checks can only target the preview origin registered for that workspace. In the local research profile, preview host and port are explicitly allowlisted so the agent cannot repurpose the trusted browser to query the OpenCode server, control plane, or another local service.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/SAFETY.md](docs/SAFETY.md).

## Initial model

The default builder profile is `openrouter/z-ai/glm-5.3-flash`. Model selection is configuration, not product architecture. Benchmark runs can override the model and provider so behavior can be compared against stronger or newer models without changing the learner experience.

## Running locally

Requirements:

- Bun 1.3.11
- an OpenRouter API key for the default model
- a Chromium installation available to Playwright for browser checks

```bash
cp .env.example .env
bun install
bunx playwright install chromium
bun run dev
```

The web app runs on `http://localhost:3000`, the studio control plane on `http://127.0.0.1:4100`, the pinned OpenCode server on `http://127.0.0.1:4096`, and generated `web-react` previews on port `5173`.

## Evaluation

The repository includes 25 canonical missions and a deterministic scorer. A run records model/provider, latency milestones, tool use, evidence provenance and coverage, session output, cost/tokens when available, and the product diff.

```bash
bun run eval -- --mission shelter-shifts --repetitions 3
```

The benchmark is intentionally separate from the learner missions. Hidden checks belong to evaluation, not to the builder prompt. A builder-reported `passed` claim cannot satisfy a hidden evidence-proof check by default; those checks require host provenance.

See [docs/EVALUATION.md](docs/EVALUATION.md).

## Safety model

Reversible project work is allowed to run automatically. External consequences are handled separately:

- mock email/payment/webhook/identity effects run automatically and produce receipts;
- live effects require an exact-scope, one-time approval token issued by the trusted host;
- secrets stay in the host process and are never copied into learner workspaces or model context;
- browser verification is performed by the host only against the workspace's registered preview origin;
- builder-reported evidence remains visibly distinct from host-verified receipts;
- the included local directory provider is for development only and is **not** a production sandbox.

A production deployment must supply a remote sandbox provider with filesystem, process, resource, and network isolation before allowing untrusted learners.

## Project status

The repository contains the complete first research implementation for phases 0–3:

- **Phase 0:** benchmark catalog, runner, provenance-aware scoring, and run receipts;
- **Phase 1:** agentic workspace vertical slice with real sessions, structured product artifacts, registered previews, browser verification, and consequence UI;
- **Phase 2:** three progressive learning missions plus freeform building;
- **Phase 3:** mock-first integration gateway with a live-capable, approval-gated host boundary.

See [docs/PHASES.md](docs/PHASES.md) for the implementation-completion criteria and explicit non-goals.

Production deployment is intentionally not claimed. Remote sandbox infrastructure, classroom identity/administration, production integration providers, and validated learning outcomes remain deployment/research work rather than hidden assumptions.

## Upstream

Prompt First uses the published [OpenCode](https://github.com/anomalyco/opencode) runtime and SDK. OpenCode is a separate project and retains its own licensing and attribution requirements.
