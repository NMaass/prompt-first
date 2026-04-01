---
name: iteration-strategy
description: Teaches learners how to iterate on their product effectively through focused feedback cycles
---

# Iterating on Your Product

Building a great product is never one-and-done. The best products are built through cycles of building, reviewing, and improving. Here's how to make each cycle count.

## The Iteration Cycle

1. **Review** — Look at what exists and compare it to your spec
2. **Identify** — Pick the most important gap or problem
3. **Describe** — Tell the builder what needs to change (and why)
4. **Verify** — Check that the change actually solved the problem
5. **Repeat** — Move on to the next most important thing

## Choosing What to Fix First

Not all problems are equal. Prioritize in this order:

### Priority 1: Things that are broken
Features that don't work at all. Buttons that do nothing. Screens that can't be reached.

### Priority 2: Things that are confusing
Features that work but users wouldn't understand. Unclear labels. Missing instructions. Confusing flows.

### Priority 3: Things that are missing
Features from the spec that haven't been built yet. Empty states. Edge cases.

### Priority 4: Things that could be better
Polish, visual improvements, nicer animations, better wording. These matter, but fix the fundamentals first.

## Writing Good Iteration Prompts

### Focus on one thing at a time
"Fix the add habit flow — when I tap Add, nothing happens" is better than a list of 10 things.

### Describe what you see vs what you expect
"When I check off a habit, the streak count stays at 0. I expected it to update to 1."

### Include the user context
"A first-time user opening the app would see an empty screen with no explanation. They should see a welcome message and a prompt to add their first habit."

## When to Update the Spec

Sometimes during iteration you'll realize the spec itself needs to change:
- You discover a feature that seemed good on paper doesn't work well in practice
- You have a new idea that improves the product
- You realize two features conflict with each other

That's normal. Tell the builder: "I want to update the spec — instead of X, let's do Y because..."

## Knowing When You're Done

Your product is ready when:
- All acceptance criteria in the spec are passing
- You've tested every main user flow
- A new user could figure out how to use it without help
- You're proud to show it to someone
