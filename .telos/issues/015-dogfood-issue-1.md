---
id: 015
title: "015: Dogfood — diagnose and fix issue #1 via the new flow"
kind: ticket
status: ready-for-agent
created: 2026-09-12
blocked_by: ["014: Orchestrator routing + Diagnosis section in STATE.md"]
---

# 015: Dogfood — diagnose and fix issue #1 via the new flow

**What to build:** Proof that the whole flow works, on Telos itself. Issue #1 on the tracker (open bug: the orchestrator starts eliciting a feature's Specification immediately after the "start telos" initialization flow, without asking the user — the post-initialization pause and consent step is missing) is diagnosed and fixed end-to-end through the new flow: routed, dispatched with `{bug, report}`, repro loop built and tightened, hypotheses ranked and tested, fix approved at the single gate, applied with a regression test at a correct seam, cleanup checklist passed, commit carrying `fix:` with the confirmed hypothesis in the message. This dogfoods the exact experience a Telos user will have, and validates the ADR's promises (artifact-free, single-gate, pre-init availability, no tracker ops) against reality.

**Blocked by:** 014: Orchestrator routing + Diagnosis section in STATE.md.

**Status:** ready-for-agent

- [ ] The bug is diagnosed via the new flow with a named red-capable feedback loop shown before any hypothesis testing
- [ ] The fix was approved at the pre-fix gate before any code was changed
- [ ] A regression test at a correct seam exists (or the seam-absence finding is recorded in decisions & blockers)
- [ ] Cleanup checklist fully passed: original repro green, `[DEBUG-…]` instrumentation gone, throwaways deleted
- [ ] The commit follows Conventional Commits (`fix:`) with the winning hypothesis stated in the message
- [ ] No artifacts were created under `.telos/` for the bug; the only trace is the STATE.md row (now removed) and the commit
