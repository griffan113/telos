---
id: 014
title: "014: Orchestrator routing + Diagnosis section in STATE.md"
kind: ticket
status: ready-for-agent
created: 2026-09-12
blocked_by: ["013: Diagnosis agent"]
---

# 014: Orchestrator routing + Diagnosis section in STATE.md

**What to build:** The flow end-to-end from the user's perspective. The orchestrator routes every incoming request: a report that the software is broken, throwing, failing, slow, or regressed goes to Diagnosis; a request for new behavior or a behavior change goes to the feature pipeline; when the classification is ambiguous it asks exactly one clarifying question and never guesses. "diagnose <report>" is the explicit shortcut. On dispatch it sends only `{bug, report}`. It then runs the flow's single gate — a plain conversational message with the agent's summary (symptoms, winning hypothesis, planned fix) and what approval advances; approve lets the agent apply the fix; request changes loops the same dispatch with the feedback at the same gate; there is no closing gate after the fix, only the agent's verification evidence reported conversationally. `STATE.md` gains a Diagnosis section — a table with columns `| bug | symptom | status | confirmed hypothesis |`, statuses `diagnosing → awaiting approval → fixing → fixed` — rewritten wholesale on every status change; `fixed` rows are removed (the commit is the durable record). Session resume reads open bugs from this section alongside feature state. No tracker operations ever for bugs (no issues, no assign, no close), and no hard-stop on missing PROJECT.md/ROADMAP.md. When the agent's summary carries a discovery report, the orchestrator bridges to the existing cascade: mark the named artifact and its downstream chain stale and re-run them through their gates, treating the discovery report as revision feedback. Seam-absence findings are recorded in STATE.md's decisions & blockers.

**Blocked by:** 013: Diagnosis agent.

**Status:** ready-for-agent

- [ ] A user reporting "X is broken/slow/throwing" is routed to Diagnosis without invoking the feature pipeline; an ambiguous request triggers exactly one clarifying question
- [ ] The pre-fix gate is presented conversationally (no popups/interactive tools), approve applies the fix, request changes loops at the same gate with the feedback, nothing is ever approved on the user's behalf
- [ ] No closing gate: after the fix the orchestrator reports verification evidence and marks the bug `fixed`, removing the row
- [ ] STATE.md's Diagnosis section follows the four-column schema and status lifecycle, is rewritten on every change, and `fixed` rows are gone
- [ ] Session start resumes open bugs from the Diagnosis section; feature pipeline resume behavior is unchanged
- [ ] A discovery report in the agent's summary triggers the existing staleness cascade on the named upstream artifact and its downstream chain
- [ ] Zero tracker operations for bugs in local, github, and azure modes
- [ ] Diagnosis works on a repo where `start telos` init has never run
