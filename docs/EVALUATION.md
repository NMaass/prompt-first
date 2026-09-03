# Evaluation

## Purpose

Prompt First should be evaluated as both an agentic software system and a learning environment. A polished demo is not enough.

The first milestone is a canonical benchmark of product missions that can be replayed across models, prompts, sandbox providers, and product changes.

## Mission set

Start with roughly 25 missions spanning:

- static interactive product;
- responsive CRUD application;
- authentication;
- roles and authorization;
- booking or limited inventory;
- mock email;
- mock payment;
- file upload;
- dashboard;
- accessibility-sensitive form;
- unreliable network;
- export and deletion flows.

Each mission should define:

- learner request;
- hidden acceptance criteria;
- seeded edge cases;
- consequential actions;
- expected capability boundaries;
- required evidence;
- adversarial inputs where appropriate.

## Agent-system metrics

Record at minimum:

- time to first visible action;
- time to first useful preview;
- valid tool-call rate;
- successful build rate;
- hidden critical-flow pass rate;
- unsupported completion claims;
- unnecessary broad rewrites;
- policy-boundary attempts;
- successful recovery after a failed action;
- total model/tool cost;
- total wall-clock latency.

Do not rely on self-reported agent success.

## Product-quality metrics

Track requirement evidence coverage and failures across:

- core behavior;
- accessibility;
- responsive/mobile layouts;
- loading, empty, and error states;
- data integrity;
- authorization;
- consequential flows;
- performance expectations;
- privacy/security requirements defined by the mission.

## Learning metrics

The learner should not be rewarded for number of prompts, amount of generated code, or finishing scripted steps.

Measure whether learners can:

- state useful requirements;
- identify important missing requirements;
- choose appropriate skills/tools;
- interpret evidence correctly;
- reject unsupported agent claims;
- distinguish mocks from live effects;
- recognize consequential actions;
- recover from an agent mistake;
- make a defensible release decision.

## Transfer test

The strongest learning evaluation is transfer.

Give the learner a new product mission with reduced coaching and, when practical, a different underlying model. Check whether they still establish requirements, delegate appropriately, inspect evidence, identify unverified behavior, and avoid premature live consequences.

## Model evaluation

For every candidate model, run repeated trials from identical snapshots. Pin provider routing during comparisons when possible.

Record:

- model;
- provider;
- routing mode;
- context and output limits;
- parameters;
- token usage;
- cost;
- latency;
- tool-call failures;
- benchmark outcomes.

GLM-5.3-Flash via OpenRouter is the first low-cost candidate, not the permanent default by assumption. Compare it against at least one stronger reference model.

## Release gates

The first vertical slice is ready for learner testing only when:

- the benchmark can run reproducibly;
- ordinary reversible work does not require repeated approvals;
- blocked capabilities remain blocked under adversarial attempts;
- mock integrations cannot accidentally reach live systems;
- evidence states are derived from real receipts rather than agent prose;
- the learner can recover from a failed build or bad agent change;
- the UI clearly distinguishes proven, failed, inferred, and unverified requirements.
