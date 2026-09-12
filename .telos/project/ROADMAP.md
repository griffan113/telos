---
phase: roadmap
status: approved
approved_at: 2026-09-12T14:36:44Z
content_hash: be1c8da8dbfeedc83218cd7797007447
depends_on: []
---

# ROADMAP.md — Telos

Ordered milestones. No task-level detail — that lives in per-feature specs.

## M1 — Correctness of the orchestration flow (current)

Make the orchestrator's conversational flow behave as documented:

- **Post-initialization pause (issue #1)** — after PROJECT.md + ROADMAP.md are
  approved, the orchestrator reports state, ends its turn, and asks whether to
  start specifying a feature; no Specification elicitation without explicit
  user confirmation. Touches `agents/orchestrator.md`,
  `.telos/references/pipeline.md`, and the public mirror
  `references/pipeline.md`.

## M2 — Pipeline hardening

Close gaps in gate/cascade semantics as they surface: precise hard-stop
messages for unapproved upstream artifacts, discovery-cascade re-plan diffs
against the tracker, STATE.md mirror fidelity in all three tracker modes.

## M3 — Harness parity

Verify identical pipeline semantics across OpenCode, Claude Code, Copilot
chatmodes, and Codex skills; strengthen the single-context sequential
dispatch emulation where it drifts from the subagent path.

## M4 — Ecosystem fit

Keep architecturally open for (but do not build): Agile concepts (sprints,
epics/stories), additional trackers, additional harness renderers.
