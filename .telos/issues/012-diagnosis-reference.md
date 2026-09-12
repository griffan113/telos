---
id: 012
title: "012: Diagnosis discipline reference"
kind: ticket
status: ready-for-agent
created: 2026-09-12
blocked_by: []
---

# 012: Diagnosis discipline reference

**What to build:** The harness-neutral reference file that carries the bug-diagnosis discipline into every repo Telos is initialized in — distilled from the `diagnosing-bugs` skill into the same register as `pipeline.md`. A user of any harness, reading only `.telos/references/`, has the complete discipline: redact secrets before showing anything (`<REDACTED>`, loops against env vars); build a tight red-capable feedback loop before any theorizing (failing test → curl → CLI snapshot → headless browser → trace replay → throwaway harness → fuzz → bisect/differential → HITL script as last resort) and tighten it (faster, sharper signal, deterministic); Phase 1 completion = one named command, already run once, that is red-capable, deterministic, fast, agent-runnable — no loop, no hypothesis; reproduce the user's exact symptom, then minimise until every remaining element is load-bearing; generate 3–5 ranked falsifiable hypotheses with stated predictions before testing any; instrument one variable at a time with tagged `[DEBUG-…]` logs (perf branch: baseline measurement + bisect, not logs); write the regression test before the fix at a correct seam, and when no correct seam exists treat that as an architectural finding to report, not a skipped step; finish only when the cleanup checklist passes — original repro green, regression test passing or seam-absence documented, all `[DEBUG-…]` gone, throwaways deleted, winning hypothesis stated in the commit/PR message.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] The file covers all six internal steps with their completion criteria, redaction rules, non-deterministic-bug guidance (raise reproduction rate, don't chase clean repro), the perf branch, and the "no red-capable command, no Phase 2" stop rule
- [ ] Written harness-neutral: no skill invocation, no harness-specific tool names required to follow it
- [ ] The file lands in `.telos/references/` on `init` via the existing reference-copy mechanism, verified by running `init` and checking the copied tree
