# Telos Tracker — Azure DevOps

Tasks sync into Azure DevOps as Task work items through the `az boards` CLI.

- Each task becomes a Task work item titled `telos: <feature> NN <slug>`.
- Blocking edges use native dependency links (Predecessor/Successor).
- The tracker is authoritative for task status in this mode: work items close when
  a task is verified, and STATE.md mirrors their status.
- Cascade re-plan diffs the old vs new task set: unchanged tasks keep their work
  items, new tasks get work items, removed tasks are closed with a "superseded"
  comment.
- Gate approvals (spec / contracts / design / tasks) stay local-only; they are
  never synced.
