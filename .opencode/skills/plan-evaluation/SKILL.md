---
name: plan-evaluation
description: Teaches learners how to evaluate an AI-generated implementation plan before approving it
---

# Evaluating a Plan

Before the builder starts making changes, it will show you a plan — a list of steps it intends to take. Your job is to review this plan and decide whether to approve it, ask questions, or request changes.

## What to Look For

### 1. Does it match your spec?
Go through each point in your product spec. Does the plan cover all of them? If the spec says "users should see weekly streaks" but the plan doesn't mention anything about streaks, that's a gap.

### 2. Does the order make sense?
The builder will do things in a specific sequence. Ask yourself: does this order make sense? For example, it should set up the basic screens before adding detailed features to them.

### 3. Is anything missing?
Think about the user experience. The plan might cover the main features but forget about:
- What happens the first time someone uses the app (empty states)
- What happens when something goes wrong (error messages)
- What happens on different screen sizes (mobile vs desktop)

### 4. Is it too much at once?
If the plan has many steps, consider asking the builder to break it into smaller chunks. It's easier to review and catch problems in smaller batches.

### 5. Do you understand every step?
If a step doesn't make sense to you, ask about it. A good plan should be understandable without technical knowledge. If the builder is using jargon, ask it to explain in simpler terms.

## How to Respond

### Approve
If the plan looks good and covers your spec: "This plan looks good, go ahead"

### Ask Questions
If something isn't clear: "What do you mean by step 3? How will that look to the user?"

### Request Changes
If something is missing or wrong: "The plan doesn't mention the weekly view — can you add that?" or "I'd rather you start with the home screen before the settings page"

### Reject
If the plan is way off: "This isn't what I described. Let me clarify what I need..." and then re-describe your intent.

## Red Flags

- The plan doesn't mention something from your spec
- Steps are described in technical language you don't understand
- The plan is trying to build everything at once instead of incrementally
- The plan adds features you didn't ask for
