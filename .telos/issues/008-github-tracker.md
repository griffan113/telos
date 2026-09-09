---
id: 008
title: "008: GitHub tracker sheet"
kind: ticket
status: ready-for-agent
created: 2026-09-09
blocked_by: ["006: Implementation phase + parallel fan-out + close-on-verify"]
---

# 008: GitHub tracker sheet

**What to build:** The GitHub adapter of the uniform tracker interface, verified against a real GitHub repository: one issue per task created at Tasks approval with the feature label; blocking expressed via the body convention (GitHub has no native blocking); and comment, assign, list-open, fetch-status, and close-on-verify operations all working through the same interface the orchestrator and sync layer call. The tracker sheet's operations section documents the exact commands for maintainers and users.

**Blocked by:** 006: Implementation phase + parallel fan-out + close-on-verify.

**Status:** ready-for-agent

- [ ] Task creation, blocking, comment, assign, list-open, fetch-status, and close operations all pass through the uniform tracker interface
- [ ] One issue per task, labeled per feature; blocking rendered in issue bodies
- [ ] Issues close on task verification during a live pipeline run
- [ ] The tracker sheet template's operations section documents the GitHub mapping
