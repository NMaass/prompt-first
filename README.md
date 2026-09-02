# Prompt First

An experimental web workspace for teaching people how to build software with agentic AI by working at the product level rather than learning programming syntax first.

Prompt First is built on the OpenCode backend, but replaces the stock interface with a guided learner experience. The goal is to let a learner describe, review, test, and iterate on a product while the coding agent handles implementation.

## What this repository explores

- **Prompt-first product development** — learners express intent, constraints, and acceptance criteria instead of manipulating code directly.
- **Agentic workflows** — the system can plan, implement, inspect, and iterate rather than stopping at one-shot code generation.
- **Educational scaffolding** — skills and learner-mode rules teach prompt crafting, plan review, product evaluation, and iteration strategy in context.
- **Visible agent activity** — the UI surfaces messages, tool activity, streaming state, product output, and supporting artifacts without exposing unnecessary implementation noise.
- **Safety without blocking the core loop** — the prototype includes model-based input/output classification while keeping the primary coding workflow responsive.

## Interface

The custom frontend follows a split-workspace model:

```text
┌─────────────────────────────┬──────────────────────────────────────────────┐
│ Chat / coaching             │ Product output                               │
│                             │                                              │
│ learner ↔ agent             │ Preview · Spec · Blocks · Guide             │
│ tool activity               │                                              │
│ prompt input                │ generated product + supporting artifacts     │
└─────────────────────────────┴──────────────────────────────────────────────┘
```

The frontend is React 19 + Vite + Tailwind CSS and communicates with the OpenCode server through `@opencode-ai/sdk` and an SSE-backed session layer.

## Educational layer

The `.opencode/` configuration adds reusable guidance around:

- prompt crafting;
- evaluating an agent's plan before implementation;
- reviewing a generated product against its specification;
- giving high-value iteration feedback;
- understanding the available product-building vocabulary.

Custom plugins track lifecycle stages, simplify technical agent output for learners, and provide safeguard hooks.

## Development

This repository began as a deliberately stripped fork of OpenCode. The stock application surfaces were removed while retaining the backend, SDK, plugin system, and supporting packages needed to build the learner-facing workspace.

See the repository history for the exact fork point and the subsequent Prompt First changes.

## Status

Prototype / research project. The architecture and educational interaction model are the primary subject of the work; this is not an official OpenCode distribution.

## Upstream

Prompt First builds on [OpenCode](https://github.com/anomalyco/opencode). OpenCode is a separate project and retains its own licensing and attribution requirements.
