# Telos Tracker — GitHub Issues

Tasks sync into GitHub Issues through the `gh` CLI.

- Each task becomes an issue titled `telos: <feature> NN <slug>`, labelled
  `telos:<feature>`.
- Blocking edges use a body convention: a line reading `Blocked by: #NN, #NN`.
- The tracker is authoritative for task status in this mode: issues close when a
  task is verified, and STATE.md mirrors their status.
- Cascade re-plan diffs the old vs new task set: unchanged tasks keep their issues,
  new tasks get issues, removed tasks are closed with a "superseded" comment.
- Gate approvals (spec / contracts / design / tasks) stay local-only; they are
  never synced.
