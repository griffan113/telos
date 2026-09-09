---
id: 007
title: "007: Cascade staleness"
kind: ticket
status: ready-for-agent
created: 2026-09-09
blocked_by: ["006: Implementation phase + parallel fan-out + close-on-verify"]
---

# 007: Cascade staleness

**What to build:** The framework's signature behavior, end to end. The user edits an already-approved artifact out-of-band; at the next resume the orchestrator detects the content-hash mismatch recorded in frontmatter, marks every downstream artifact stale, and automatically re-runs each downstream phase in order through its own approval gate — no manual re-invocation. When the cascade reaches the Tasks phase, re-approval triggers a re-plan diff against the tracker: unchanged tasks keep their issues, new tasks get issues, removed tasks are closed with a superseded comment; issue numbers are never silently reused or deleted.

**Blocked by:** 006: Implementation phase + parallel fan-out + close-on-verify.

**Status:** done

- [x] Content-hash mismatch on an approved artifact triggers stale marking of the entire downstream chain
- [x] The orchestrator re-runs every downstream phase in order, each through its own gate
- [x] The user never needs to announce an edit or manually re-invoke a phase
- [x] Task re-plan diffing keeps issues for unchanged tasks, creates for new, closes removed with a superseded comment
- [x] Cross-session resume detects edited approved artifacts on session start
