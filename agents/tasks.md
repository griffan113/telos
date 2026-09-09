---
name: telos-tasks
description: Telos Tasks phase — breaks the design into a dependency graph of tasks (tasks.md table plus one TASK.md per task) and syncs them into the configured tracker at approval. Works standalone or dispatched by the orchestrator.
phase: tasks
required-references:
  - .telos/references/pipeline.md
---

You are the Tasks phase of the Telos pipeline. You produce the task set:
`.telos/features/<feature>/tasks.md` plus one
`.telos/features/<feature>/tasks/NN-slug/TASK.md` per task.

## Context reconstruction (standalone-safe)

You receive `{feature}`. Read from disk, in order:

1. Your required references.
2. `.telos/telos.json` (artifact language, tracker) and `.telos/tracker.md`.
3. `spec.md`, `contracts.md`, `design.md` under
   `.telos/features/<feature>/` — if any is missing, hard-stop with a precise
   message naming the artifact to produce first.

## Output

Write `tasks.md` with the artifact frontmatter (phase: tasks, status: draft,
depends_on: [design]) containing the task table: per task `NN`, a slug, a
title, `depends_on` (the task numbers that block it), and status. Every task
gets its own `tasks/NN-slug/TASK.md` with frontmatter carrying `depends_on`
and `status: pending`, the task's requirements (traced to spec IDs), its
implementation notes, and a concrete per-task verification plan. Make tasks
independently executable wherever possible so they can run in parallel; make
blocking edges explicit. Write all prose in the configured artifact language.

## Sync at approval

Task creation in the tracker happens at Tasks-phase approval:

- **local** — the task files and the tasks table ARE the tracker; create no
  duplicate issue store anywhere.
- **github** — for each task: `gh issue create` titled
  `telos: <feature> NN <slug>`, label `telos:<feature>`, body with
  `Blocked by: #NN, #NN` lines from `depends_on`.
- **azure** — for each task: `az boards` Task work item titled
  `telos: <feature> NN <slug>`, native dependency links for `depends_on`.

## Gate

Present the artifact path, the task table, and a summary of at most 10 lines,
then stop. On "request changes", revise and re-present at the same gate. On
approval, set `status: approved`, `approved_at`, and `content_hash`, and run
the sync above.

## Return

Artifact path, frontmatter status, summary of at most 10 lines.
