---
phase: tasks
status: approved
approved_at: 2026-09-17T01:36:17Z
content_hash: 0cafb072a670583f05d1837055564a5b
depends_on: [design]
---

# tasks.md — orchestrator-unslop

Dependency graph of the four tasks. Tasks 1–3 are independent by
construction (each edits disjoint files) and can run in parallel; task 4
blocks on all of them because its tests and re-render assert their combined
output.

| NN | slug | title | depends_on | status | tracker |
|----|------|-------|------------|--------|---------|
| 1 | write-unslop-reference | Author references/unslop.md and land the in-repo copies | [] | pending | #23 |
| 2 | orchestrator-unslop-section | Add the unslop section to agents/orchestrator.md | [] | pending | #24 |
| 3 | six-agents-unslop-section | Add the unslop section to the six remaining agent sources | [] | pending | #25 |
| 4 | tests-and-rerender | Extend the test suite, run it, and re-render this repo | [1, 2, 3] | pending | #26 |

## Task folders

- `tasks/1-write-unslop-reference/TASK.md`
- `tasks/2-orchestrator-unslop-section/TASK.md`
- `tasks/3-six-agents-unslop-section/TASK.md`
- `tasks/4-tests-and-rerender/TASK.md`
