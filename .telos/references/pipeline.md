# Telos Pipeline Reference

Telos ("coding with purpose") is an orchestrator-driven, spec-driven framework.
One orchestrator agent drives every feature through five phases, pausing for
explicit human approval at every phase transition. This document is the shared
context every Telos agent reads first.

## Project initialization ("start telos")

Before any feature work exists, the orchestrator runs the "start telos" flow:

1. Interview the user about the project: what it is, who it serves, what
   success looks like. Analyze the actual codebase live for grounding.
2. Write `.telos/project/PROJECT.md` — purpose, users, goals, non-goals — and
   `.telos/project/ROADMAP.md` — ordered milestones or themes, no task-level
   detail. All prose in the configured artifact language.
3. Present both for an approval gate. Revise and re-present on request
   changes; nothing proceeds unapproved.
4. After both files are approved, the orchestrator ends its turn: it reports
   the current state (files created, approvals, possible next steps) and asks
   the user whether they want to start specifying a new feature. The
   Specification phase is dispatched only after the user confirms and names
   the feature — elicitation never starts uninvited.
5. Feature phases hard-stop until this has run. If PROJECT.md or ROADMAP.md
   is missing, the message is exactly: `Run 'start telos' first — PROJECT.md
   does not exist.` (name the missing file).

These are orchestrator-owned project files, not phase artifacts: the
orchestrator writes them itself and gates them directly. They carry the
artifact frontmatter too (`phase: project` / `phase: roadmap`,
`status: draft`, then approved).

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
phase: specification        # specification | contracts | design | tasks | implementation | project | roadmap
status: draft               # draft | approved | stale
approved_at: 2026-09-09T12:00:00Z   # set at gate approval
content_hash: <md5 of file>         # recorded by the phase at gate approval
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
- Gate presentation is a plain conversational message, never a blocking
  interactive prompt. End the turn with the gate question as ordinary text
  (artifact summary + what approval does). Do not use the harness's
  question/select/popup tools for gates: the user must stay free to keep
  reading, typing, or ignoring the gate until they are ready to reply.
- "Request changes" loops the phase back to revision and re-presentation at the
  same gate. Nothing advances on an unapproved artifact.
- On the orchestrator's approval signal, the phase itself writes the approval
  frontmatter: `status: approved`, `approved_at`, and its `content_hash`
  (computed with a shell command). This works identically standalone.

## Staleness and cascade

- The chain order is: PROJECT.md/ROADMAP.md → spec → contracts → design →
  tasks (tasks.md). An artifact's downstream chain is everything after it in
  that order that exists. TASK.md execution ledgers are not hash-checked —
  they are reconciled by re-plan diffing when tasks.md is re-approved.
- Only artifacts with `status: approved` carry a `content_hash` and take part
  in detection. Drafts are never hash-checked.
- On every session start (and before resuming any work), the orchestrator
  recomputes each approved artifact's md5 and compares it to
  `content_hash`. A mismatch means an out-of-band edit.
- On a mismatch, the orchestrator marks the edited artifact and every
  existing downstream artifact `status: stale` in their frontmatter — for a
  project file, that means all existing feature artifacts too. No manual
  re-invocation: the user never announces edits.
- The orchestrator then automatically re-runs every stale phase in pipeline
  order, each through its own gate again. The user approves or requests
  changes as usual; a gate is never auto-approved by a cascade.
- Discovery cascades behave the same: when an Implementation agent reports
  an upstream artifact got something wrong, that artifact and its downstream
  chain go stale and re-run through their gates, with the discovery report
  as revision feedback.

## Re-plan diffing

When the Tasks phase is re-approved during a cascade, diff the old task set
against the new one. Task identity is `NN` + `slug`:

- **Unchanged** (same identity, same title, same `depends_on`, same
  `requirements`): the issue stays untouched, in its current state.
- **New**: a new issue is created.
- **Removed**: the issue is closed with a comment beginning `superseded:`
  and a one-line reason.
- **Changed** (same identity, different content): the old issue is closed
  with a `superseded:` comment and a new issue is created for it. Issue
  numbers are never silently reused or deleted; `create_task` never updates
  an existing issue's blocking edges in place.

After the diff, sync the `tracker` column and each TASK.md's `issue`
frontmatter with the resulting issue numbers, and rewrite STATE.md's task
mirror.

## Dispatch contract

- The orchestrator passes only `{feature, phase}`. Each phase agent reads all
  context from disk: the feature's upstream artifacts under
  `.telos/features/<feature>/`, the project files under `.telos/project/`, and
  the reference docs listed in its frontmatter. Never inline upstream
  artifacts or other context in the dispatch message — the only conversational
  addition is the user's revision feedback on a re-present.
- Return value: the artifact path, its frontmatter status, and a summary of at
  most 10 lines.

## Phase prerequisites and hard-stops

A phase invoked with a missing or unapproved upstream artifact hard-stops with
a precise message naming the artifact to produce first. Never generate a stub
to satisfy a downstream phase.

| Phase | Needs on disk | Hard-stop message names |
|---|---|---|
| Specification | `.telos/project/PROJECT.md` and `.telos/project/ROADMAP.md`, both `status: approved` | the missing or unapproved project file |
| Contracts | `.telos/features/<feature>/spec.md` with `status: approved` | spec.md |
| Design | `spec.md` and `contracts.md`, both `status: approved` | the missing or unapproved file |
| Tasks | `spec.md`, `contracts.md`, `design.md`, all `status: approved` | the missing or unapproved file |
| Implementation | `tasks.md` approved and synced | tasks.md |

An upstream artifact in `draft` or `stale` status is also a hard-stop: the
message names the artifact and its status.

## Specification artifact

`.telos/features/<feature>/spec.md`, frontmatter `phase: specification`,
`depends_on: []`. Body:

- **Goal** — one paragraph, from the user's own words.
- **Scope / non-goals** — explicit.
- **Requirements** — numbered `REQ-1`, `REQ-2`, … never renumbered once
  written; traceability keys for every downstream artifact.
- **Acceptance criteria** — per requirement, observable from the outside.

Elicit, don't assume: interview the user, propose a draft, refine. Analyze the
actual codebase live wherever requirements touch code, and read the consumer
repo's own instruction files (AGENTS.md, CLAUDE.md) for conventions. Telos
maintains no codebase documentation of its own.

## Contracts artifact

`.telos/features/<feature>/contracts.md`, frontmatter `phase: contracts`,
`depends_on: [spec]`. Pins the machine-readable interfaces that design and
tasks must validate against:

- Exported types and function signatures.
- API request/response shapes.
- Module boundaries and ownership.

Key every contract to the spec requirement IDs it serves (`Serves: REQ-3`).
Prose in the artifact language; the interface definitions themselves stay in
code syntax. Contracts are keyed to approved requirement IDs — if the spec
changed, it is re-approved first and Contracts re-runs through its gate.

## Design artifact

`.telos/features/<feature>/design.md`, frontmatter `phase: design`,
`depends_on: [spec, contracts]`. Records the architecture and component
decisions the tasks will execute:

- What changes and what stays — anchored in the live code, not abstractions.
- How the pieces fit: modules, data flow, and boundaries, validating against
  the pinned contracts (cite the contract they satisfy).
- Deliberate non-decisions: what is deferred and why.

**Depth is sized to the feature's complexity** — a small feature gets a
10-line artifact, not an architecture essay. Analyze the actual codebase live
wherever the design touches it; read the consumer repo's own instruction
files (AGENTS.md, CLAUDE.md) for conventions.

## Tasks artifacts

`.telos/features/<feature>/tasks.md`, frontmatter `phase: tasks`,
`depends_on: [design]` — the task table and the index of task folders:

| NN | slug | title | depends_on | status | tracker |
|----|------|-------|------------|--------|---------|
| 1 | parse-config | Parse telos config | [] | pending | — |
| 2 | write-render | Render agent files | [1] | pending | — |

Plus one `.telos/features/<feature>/tasks/NN-slug/TASK.md` per task. TASK.md
is an execution ledger, not a phase artifact: instead of the artifact
frontmatter it carries its own ledger frontmatter, with a task lifecycle
(`pending | in-progress | done`) rather than the artifact statuses:

```yaml
---
feature: <feature-slug>
task: 2
title: Render agent files
status: pending              # pending | in-progress | done
depends_on: [1]              # task NNs that block this one
issue: 12                    # tracker issue number; omit in local mode
requirements: [REQ-2, REQ-5] # spec IDs this task serves
---
```

The body carries implementation notes and a concrete per-task verification
plan — how to prove this task done (commands to run, behavior to observe),
enforced before the task is marked done. Make tasks independently executable
wherever possible so they can run in parallel; make blocking edges explicit.
Task granularity: a task is one reviewable, verifiable unit of work.

The `tracker` column is filled at approval sync (issue numbers in cloud
modes, `—` in local mode).

## Feature naming

The orchestrator derives the feature slug from the user's description: ASCII,
lowercase, hyphenated (`auth-rate-limit`). The slug is stable for the life of
the feature; artifacts and tracker titles reference it.

## STATE.md

`.telos/project/STATE.md` is generated by the orchestrator, rewritten
wholesale after every gate approval, task status change, or cascade, and never
hand-edited. Sections:

- **Phase status table** — one row per feature and phase, local truth.
- **Mirrored task table** — tracker truth for cloud modes (github/azure); a
  generated view of the task files for the local tracker.
- **Decisions & blockers** — recorded during gates and execution.

## Tracker

`.telos/tracker.md` is the sole tracker configuration. Uniform operations:
`create_task`, `close_task`, `comment`, `assign`, `list_open(feature)`,
`set_blocked_by`, `fetch_status`.

- **local** — the task files themselves are the tracker; no duplicate issue
  store exists. The tasks table and TASK.md frontmatter are the authoritative
  task state, and STATE.md's task mirror is a generated view of them — never
  a second store to keep in sync by hand. `create_task` on approval is a
  no-op; `fetch_status` reads the task files.
- **github** — GitHub Issues via `gh`; title `telos: <feature> NN <slug>`,
  label `telos:<feature>`, body convention `Blocked by:` lines citing the
  blocking tasks' issue numbers. Tasks are created in topological dependency
  order so blocking issues exist before dependents reference them.
- **azure** — Azure DevOps via `az boards`; Task work items titled
  `telos: <feature> NN <slug>` with native dependency links.

The tracker is authoritative for task status in cloud modes; issues close when
a task is verified. Gate approvals stay local-only, always.

## Parallel execution

- **Ready set**: a task is ready when every task in its `depends_on` has
  `status: done`. The orchestrator computes the ready set after each task
  completes and dispatches it.
- **Parallel fan-out** (OpenCode/Claude Code): dispatch one Implementation
  subagent per ready task, in parallel — ready tasks are independent by
  construction, so no ordering between them.
- **Prompt-swap emulation** (Copilot/Codex): single-context harnesses cannot
  spawn subagents; the orchestrator loads the Implementation prompt by path
  and executes ready tasks sequentially under the same semantics.
- **Verification is the gate**: each task runs its TASK.md verification plan
  to completion; a task without passing verification is never done. The
  evidence (commands run, results observed) is recorded in the task's
  TASK.md body, beside its ledger frontmatter.
- **Close-on-verify**: on verification, the Implementation agent sets
  `status: done` in TASK.md and the tasks table, and closes the tracker issue
  via the tracker's `close_task` op (local mode: the task file is the tracker
  — nothing to close). The orchestrator rewrites STATE.md on each return.
- **Feature closing gate**: when every task in the table is done, the
  orchestrator presents the verified task table for the feature's closing
  approval gate. Approve completes the feature; request changes re-opens
  named tasks as `in-progress`.
