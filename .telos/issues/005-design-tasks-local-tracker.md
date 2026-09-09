---
id: 005
title: "005: Design + Tasks phases + local tracker semantics"
kind: ticket
status: ready-for-agent
created: 2026-09-09
blocked_by: ["004: Pipeline v1 — start telos + Specification + Contracts"]
---

# 005: Design + Tasks phases + local tracker semantics

**What to build:** The pipeline completes its planning half. Design produces architecture/component artifacts sized to the feature's complexity (a small feature gets a short artifact, not an essay). Tasks emits the dependency graph: each task as a task folder with frontmatter carrying `depends_on`, indexed by the tasks table. Tasks-phase approval is the sync point. The local tracker is tasks-as-tracker: the task files and table are themselves the issue store — no duplicate issue files anywhere — and STATE.md's task mirror is a generated view of them.

**Blocked by:** 004: Pipeline v1 — start telos + Specification + Contracts.

**Status:** ready-for-agent

- [ ] Design artifacts are produced and gate-approved, depth sized to feature complexity
- [ ] Tasks phase emits the full task set with `depends_on` dependency graph in the tasks table and per-task frontmatter
- [ ] Tasks approval runs through the same gate mechanics as every other phase
- [ ] Local tracker mode introduces no separate issue store; task files are the tracker
- [ ] STATE.md's task mirror is a generated view of the task files in local mode
