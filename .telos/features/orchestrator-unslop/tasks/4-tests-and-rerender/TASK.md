---
feature: orchestrator-unslop
task: 4
title: Extend the test suite, run it, and re-render this repo
status: pending
issue: 26
depends_on: [1, 2, 3]
requirements: [REQ-1, REQ-4, REQ-5, REQ-6]
---

## Implementation notes

Blocked by tasks 1–3: the tests and re-render assert their combined output.

1. Extend `test/init.test.js` (C-2 test contract): after `telos init` in a
   temp repo, assert `.telos/references/unslop.md` exists and matches:
   `/scan/ + /rewrite/ + /self-audit|self-auditing/` (three steps),
   `/R-\d+/` (stable rule IDs), `/any language|não apenas|Espero que isso
   ajude/` (scope + Portuguese examples), the coverage list (≥ PROJECT.md,
   TASK.md, tracker, AGENTS.md), and the scope guard (prose/technical
   boundary).

2. Extend `test/agents.test.js` (REQ-5/REQ-6 shared test): the per-agent
   loop over `AGENT_NAMES` (all four harnesses) asserts every rendered file
   carries the unslop required reference and the three-step process
   wording:

   `/## Required references/ + /- \.telos\/references\/unslop\.md/`
   `/scan|scan the draft/ + /self-audit/`

3. Run the whole suite: `npm test` (Test contract 4). Fix only failures
   caused by this feature's changes; anything else is a discovery report.

4. Re-render this repo (REQ-5): `node bin/telos.js update` — regenerates
   the opencode renders from the edited sources. The `telos:generated`
   marker is present in all rendered files, so they regenerate; user-owned
   files without the marker stay untouched (`src/render.js:48-69`).

Constraint: only `test/init.test.js` and/or `test/agents.test.js` change in
this task's diff beyond the upstream tasks' files — no `src/` or
`adapters/` changes (C-5).

## Verification plan

1. `npm test` — the whole suite passes.
2. `node bin/telos.js update` exits 0; `.opencode/agent/telos-*.md` files
   carry the `telos:generated` marker, list
   `- .telos/references/unslop.md` under `## Required references`, and name
   the three-step process.
3. `.telos/references/unslop.md` exists in this repo (landed by task 1), so
   every rendered agent's required reference resolves at runtime.
4. `git diff --stat` against the feature base shows exactly: new
   `references/unslop.md`, seven `agents/*.md` modified, test files
   modified — and nothing under `src/` or `adapters/` (C-5).
