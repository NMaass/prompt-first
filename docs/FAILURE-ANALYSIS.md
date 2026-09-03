# Failure analysis of the original prototype

The previous prototype failed for product reasons and concrete implementation reasons. The reset removes both rather than preserving compatibility.

## Product-level contradictions

### Blockly contradicted the thesis

The project argued that agentic software changes what learners need to practice, but then constrained the builder to a simplified programming representation. That kept traditional programming as the real task and made the agent solve a translation problem instead of building the best product.

### The learner did not have a durable job

When the agent writes the implementation, a learner can easily become a spectator, a prompt typist, or somebody guessing the tutorial's preferred answer. The new responsibility split gives the learner ownership of intent, tradeoffs, verification, consequences, and release judgment.

### Completion was confused with learning

A finished screen does not show that a learner can direct or verify an autonomous system. The previous prompt/plan/spec lifecycle measured process compliance. The reset uses product artifacts, evidence coverage, transfer missions, and learner decisions.

### Builder and coach objectives were conflated

A builder should finish useful reversible work aggressively. A coach sometimes needs to preserve a decision for the learner. One agent trying to optimize both will either interrupt too much or silently make educationally important decisions. The reset separates these roles.

## Concrete implementation defects found during the reset

### Browser API calls bypassed the development proxy

The frontend defaulted its SDK base URL to `http://localhost:4096` even though Vite had same-origin proxy rules. That exposed the browser to unnecessary cross-origin behavior and made the proxy largely irrelevant.

### The SDK was called with the wrong request shape

The session hook called `client.session.prompt({ sessionID, parts })`. The generated SDK expects request path/body fields, including `path: { id }` and `body: { parts }`. This could prevent the core builder loop from functioning at all.

### SSE payloads were parsed using the wrong schema

The frontend treated `message.updated.properties` as the message and `message.part.updated.properties` as the part. OpenCode emits nested `info` and `part` fields. Tool activity was also modeled as `tool-call` / `tool-result` instead of OpenCode's `tool` part with a state object.

### Browser code referenced `process.cwd()`

The Vite frontend attempted to construct the event URL from `process.cwd()`, which is not a browser API. This was another failure path in the session event loop.

### Optimistic messages could not reconcile cleanly

The client generated a local user-message ID but did not submit the same message ID to OpenCode. When server events arrived, the optimistic message and server message could become separate entries.

### The agent's working directory was not a learner workspace contract

The backend was launched from the vendored OpenCode package, while the web client did not explicitly create sessions in a dedicated learner workspace. Even if the session succeeded, the product did not have a reliable boundary separating product code from its own infrastructure.

### Safeguarding added latency without enforcing a boundary

The old safeguard performed a serial model call, failed open, and only logged unsafe classifications. It imposed latency while providing neither process isolation nor consequence control.

### Regex jargon replacement distorted rather than taught

Replacing words such as API, component, state, and commit after generation made agent output less precise and could change meaning. The new interface summarizes product activity directly and leaves technical details available when useful.

## Reset response

The new architecture makes each failure independently testable:

- agent runtime is a dependency behind a client boundary;
- every session has an explicit workspace directory;
- the UI consumes typed SDK event shapes;
- model behavior is benchmarked separately from UI behavior;
- mock/live effects go through a host gateway;
- browser verification is host-executed and receipted;
- education is represented by missions and evidence instead of a hard-coded lifecycle state machine.
