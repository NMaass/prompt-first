---
name: consequential-flow
description: Identify and verify flows that change scarce state, permissions, money, communications, identity, or other external consequences.
---

# Consequential flow verification

Map the consequential state transition before testing it. Verify both the happy path and the negative condition that prevents an invalid consequence.

Use mocks for email, payments, webhooks, and identity effects unless the learner explicitly chooses a real effect. Request those effects through `studio-effect-request`; never call a live service directly from product code or a shell command.

Verify idempotency for repeatable external actions. Verify capacity, authorization, or exclusivity constraints at the state layer rather than only checking that a button was clicked.

Publish evidence for every consequential acceptance criterion and keep missing negative-path coverage unverified.
