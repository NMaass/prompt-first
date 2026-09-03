# Prompt First engineering rules

Prompt First teaches product judgment around autonomous software agents. Optimize for the learner's product experience, evidence quality, and bounded consequences rather than exposure to implementation details.

## Product invariants

- The learner owns intent, tradeoffs, risk tolerance, and the release decision.
- The builder may act immediately on reversible implementation work.
- Do not add forced plan approval, prompt-writing lessons, Blockly, or programming-syntax curriculum.
- Every important requirement should be able to point to evidence or remain visibly unverified.
- Real external effects must pass through the trusted host boundary and exact-scope approval.
- Model output is never a safety boundary.
- The learner experience is language-agnostic; runtime profiles may be deliberately bounded.

## UI invariants

- Preserve focus, drafts, scroll position, and panel geometry across non-spatial state changes.
- Use native controls and correct semantic roles.
- Keep persistent controls mounted when temporarily unavailable.
- Do not use `transition: all`.
- Do not hide consequential state behind animation or ephemeral toasts.
- Mobile layouts must remain fully operable.

## Code conventions

- TypeScript is strict. Do not introduce `any` in product code.
- Prefer small typed modules with explicit domain types.
- Do not add explanatory comments when the code can be made self-describing.
- Keep runtime-provider, sandbox-provider, browser-runner, and effect-gateway interfaces replaceable.
- Do not add dependencies without a concrete product requirement.

## Verification

Before merging, run `bun run check`.

For changes affecting agent behavior or safety, also run the relevant benchmark missions with `bun run eval` and inspect the generated run receipts rather than relying on the agent's self-report.
