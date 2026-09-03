# Evaluation

## Why the benchmark comes first

Agentic product education cannot be evaluated by asking whether a generated screen looks impressive. The same mission needs to be replayable across models, runtime versions, prompts, and safety policies so failures can be attributed instead of blended together.

`evals/` is therefore a first-class part of the product.

## Catalog

The catalog contains 25 canonical missions spanning:

- CRUD and forms;
- constrained inventory;
- roles and authorization;
- concurrency;
- simulated identity;
- simulated communication and payments;
- uploads and private data;
- data visualization;
- offline/reliability states;
- export and deletion;
- workflow integrity;
- prerequisites and moderation.

The three learner missions are represented in the catalog but hidden benchmark checks are not included in learner prompts.

## Run receipt

Each run stores:

- mission ID;
- provider/model;
- start/end/duration;
- time to first tool action;
- time to first published preview;
- model cost and token counts when returned by the runtime;
- completed/error tool traces;
- evidence records;
- product diff summary;
- session errors;
- hidden-check score.

Run receipts are written to `evals/runs/` and are ignored by Git.

## Hidden checks

The v1 benchmark intentionally uses deterministic trace/policy checks rather than an LLM grader. Checks include:

- required artifact/tool use;
- browser-verification categories;
- passed evidence for specified critical requirements;
- absence of unnecessary live-effect requests.

Severity weights are deterministic:

- critical: 5;
- major: 3;
- minor: 1.

This does not pretend to fully measure semantic product correctness. Mission-specific black-box state scenarios should be added as the runtime contract becomes standardized enough to execute them without teaching the agent the hidden selectors or fixtures.

## Running

With an OpenRouter key configured:

```bash
bun run eval -- --mission shelter-shifts --repetitions 3
```

Override the builder without modifying product code:

```bash
bun run eval -- --mission shelter-shifts --model openrouter/z-ai/glm-5.3-flash
```

Omit `--mission` to run the full catalog.

The runner reuses a healthy local studio server or starts one itself, creates a fresh workspace for every run, scopes the OpenCode session to that directory, waits for session idle, captures the trace/diff, and destroys the workspace.

## Metrics that matter

### Agent/runtime

- time to first action;
- time to first preview;
- valid tool completion rate;
- error/retry rate;
- cost;
- token use;
- unnecessary live-effect requests.

### Product/evidence

- critical requirements with evidence;
- browser QA coverage;
- failed requirements correctly left failed;
- release claims made with unverified critical items;
- consequence receipts and idempotency behavior.

### Learning research

These require actual learner studies rather than agent benchmark runs:

- appropriate learner redirects/rejections;
- ability to identify missing evidence;
- ability to predict remaining risk;
- transfer to a new mission;
- transfer to a different underlying model;
- quality of release decisions with scaffolding reduced.

## Model comparison protocol

For meaningful model comparisons:

1. pin Prompt First commit and OpenCode/runtime versions;
2. use identical mission and fresh workspace;
3. record provider/model exactly;
4. run multiple repetitions;
5. compare latency and evidence metrics separately;
6. do not use the same model's prose as the grader;
7. inspect failed traces before changing the curriculum or safety policy.
