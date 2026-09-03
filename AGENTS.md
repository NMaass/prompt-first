# Agent instructions

Prompt First is a research prototype for teaching agentic product engineering. Read `README.md` and `docs/` before making architectural changes.

## Product invariants

- The learner owns product intent, tradeoffs, and release judgment. The builder owns implementation.
- Do not reintroduce Blockly, block-based source representations, forced plan-approval workflows, or prompt-crafting lessons as the core experience.
- Start useful reversible work quickly. Ask questions only when they materially affect product intent, consequences, or an architectural constraint.
- Mission Contract, Product Map, and Evidence Ledger are first-class product state, not prose conventions hidden in chat history.
- A requirement is not complete because an agent says it is. Prefer reproducible evidence.
- Distinguish `proven`, `failed`, `inferred`, and `unverified` states in product-facing logic.
- Safety belongs at capability and consequence boundaries. Input moderation is supplemental, not the primary sandbox boundary.
- Real external effects require explicit, concrete approval. Mock integrations are the default for learner missions.
- Keep the learner experience language-agnostic while keeping runtime profiles bounded and reproducible.
- Keep model, agent-runtime, and sandbox-provider choices behind adapters where practical.

## Code rules

- TypeScript/React code must stay typed. Do not introduce `any` when a concrete or `unknown` type is feasible.
- Prefer explicit interfaces at stable boundaries: agent events, sandbox providers, evidence, requirements, permissions, and integration contracts.
- Keep UI geometry stable during async work. Do not replace controls with differently sized loading states or cause avoidable layout shift.
- Use semantic controls and preserve keyboard accessibility.
- Do not hide technical concepts through regex word replacement. Explain them contextually when they matter.
- Do not add code comments that merely narrate obvious implementation. Prefer clear naming and structure.
- Avoid speculative framework layers. Add an abstraction when there are at least two implementations planned or when it enforces a critical boundary.
- Do not tightly couple Prompt First pedagogy to OpenCode internals without documenting why an external adapter is insufficient.

## Scope discipline

The current milestone is one polished responsive-web vertical slice with mock integrations. Do not expand into arbitrary languages, arbitrary MCP servers, arbitrary third-party skills, live payments, or broad curriculum content unless the task explicitly requires it.

When removing legacy code, delete it rather than retaining compatibility shims unless a current path still depends on it.

## Verification

For touched packages, run the narrowest relevant checks first, then broader checks when practical:

```bash
bun --cwd packages/web run typecheck
bun --cwd packages/web run build
bun --cwd packages/opencode run typecheck
```

From the repository root:

```bash
bun run typecheck
```

When behavior is consequential, add or update deterministic tests and capture evidence rather than relying on manual inspection alone.
