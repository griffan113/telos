# Telos Pipeline Reference

Telos ("coding with purpose") is an orchestrator-driven, spec-driven framework.
One orchestrator agent drives every feature through five phases, pausing for
explicit human approval at every phase transition. This document is the shared
context every Telos agent reads first.

## The five phases

1. **Specification** — capture requirements with traceable IDs (`REQ-NN`) into
   `.telos/features/<feature>/spec.md`.
2. **Contracts** — pin machine-readable interfaces (types, API shapes, module
   boundaries) into `contracts.md`, keyed to the spec's requirement IDs.
3. **Design** — architecture and components, depth sized to the feature's
   complexity, into `design.md`.
4. **Tasks** — break the work into tasks with an explicit dependency graph into
   `tasks.md`, one `tasks/NN-slug/TASK.md` per task; sync tasks into the
   configured tracker at approval.
5. **Implementation** — execute tasks in dependency order (in parallel where the
   harness allows), verifying each task before marking it done.

## Artifact frontmatter

Every artifact carries:

```yaml
---
phase: specification        # specification | contracts | design | tasks | implementation
status: draft               # draft | approved | stale
approved_at: 2026-09-09T12:00:00Z   # set at gate approval
content_hash: <md5 of file>         # recorded by the orchestrator at approval
depends_on: []              # artifact keys this one derives from
---
```

Artifact language: read `.telos/telos.json` → `language`. Write the prose of
every artifact, TASK.md, tracker issue body, and your conversational replies in
that language. Agent instructions (like this document) stay in English. The
`telos:` tracker title convention is fixed ASCII and is never localized.

## Gates

- Gates are enforced by the orchestrator only. A phase presents its artifact
  and stops: **approve** or **request changes** (+ feedback).
- "Request changes" loops the phase back to revision and re-presentation at the
  same gate. Nothing advances on an unapproved artifact.
- An approved artifact's frontmatter becomes `status: approved` with
  `approved_at` set, and the orchestrator records its `content_hash`.

## Staleness and cascade

- If an approved artifact is edited out of band, the next resume detects a
  mismatch between its content and `content_hash` and marks it — and every
  downstream artifact that exists — `status: stale`.
- The orchestrator then re-runs every stale phase in pipeline order, each
  through its own gate again. The user never re-invokes phases manually.

## Dispatch contract

- The orchestrator passes only `{feature, phase}`. Each phase agent reads all
  context from disk: the feature's upstream artifacts under
  `.telos/features/<feature>/`, the project files under `.telos/project/`, and
  the reference docs listed in its frontmatter.
- A phase invoked with a missing upstream artifact hard-stops with a precise
  message naming the artifact to produce first. Never generate a stub spec to
  satisfy a downstream phase.
- Return value: the artifact path, its frontmatter status, and a summary of at
  most 10 lines.

## Tracker

`.telos/tracker.md` is the sole tracker configuration. Uniform operations:
`create_task`, `close_task`, `comment`, `assign`, `list_open(feature)`,
`set_blocked_by`, `fetch_status`.

- **local** — the task files themselves are the tracker; no duplicate issue
  store exists. STATE.md's task mirror is a generated view of the task files.
- **github** — GitHub Issues via `gh`; title `telos: <feature> NN <slug>`,
  label `telos:<feature>`, body convention `Blocked by: #NN, #NN`.
- **azure** — Azure DevOps via `az boards`; Task work items titled
  `telos: <feature> NN <slug>` with native dependency links.

The tracker is authoritative for task status in cloud modes; issues close when
a task is verified. Gate approvals stay local-only, always.

## Parallel execution

The orchestrator computes the ready set from each task's `depends_on` and
dispatches Implementation subagents in parallel where the harness supports it.
Single-context harnesses run tasks sequentially. Every task's verification plan
is enforced before its issue is closed.
