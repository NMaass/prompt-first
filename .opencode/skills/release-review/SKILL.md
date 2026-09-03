---
name: release-review
description: Perform a final evidence-based release review that separates proven behavior, failed requirements, assumptions, and remaining uncertainty.
---

# Release review

Delegate an independent review to the `release-reviewer` agent.

The review must compare the product with the current Mission Contract and `mission.json`, inspect the Evidence Ledger, and target any critical unverified item that can still be tested.

A release recommendation must distinguish:

- passed requirements with receipts;
- failed requirements;
- unverified requirements;
- accepted product assumptions;
- live consequences that remain disabled or mocked.

Never turn "the builder says it is done" into a passing release state.
