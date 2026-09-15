---
id: 013
title: "013: Diagnosis agent"
kind: ticket
status: ready-for-agent
created: 2026-09-12
blocked_by: ["012: Diagnosis discipline reference"]
---

# 013: Diagnosis agent

**What to build:** The seventh agent, rendered into all four harnesses from the existing harness-neutral source with zero adapter changes. Dispatched by the orchestrator with only `{bug, report}` — the slug plus the user's literal bug report; everything else reconstructed from disk (telos.json for language, fallback English; the live codebase; the repo's own AGENTS.md/CLAUDE.md; relevant ADRs). Works before `start telos` init has ever run: no PROJECT.md/ROADMAP.md requirement. Scope: functional bugs, performance regressions, and flakiness ("broken/throwing/failing/slow"). Runs the discipline from its required reference end-to-end in one agent run and produces **zero artifacts**. Returns a summary of at most 10 lines carrying exactly what the orchestrator needs: the confirmed symptoms, the winning hypothesis, and the planned fix (the content for the single pre-fix gate); a discovery report when the diagnosis reveals an approved upstream artifact (spec/design) was wrong; the seam-absence finding when no correct seam for the regression test exists. The confirmed hypothesis travels in the `fix:` commit/PR message (Conventional Commits), per the cleanup checklist.

**Blocked by:** 012: Diagnosis discipline reference.

**Status:** done

- [x] The agent renders on OpenCode, Claude Code, Copilot, and Codex from the single neutral source, as a subagent-equivalent on each, with its required reference injected into the body
- [x] Dispatch contract is `{bug, report}` only; the agent never asks the orchestrator to inline code, artifacts, or other context
- [x] Language: conversational replies in the telos.json language, English fallback when telos.json is absent; instructions stay in English
- [x] No artifacts written under `.telos/` at any point of the run; regression tests land in the codebase at the correct seam, or the seam-absence finding is returned in the summary
- [x] The summary returned to the orchestrator is ≤10 lines and contains symptoms + winning hypothesis + planned fix, plus discovery report and seam finding when applicable

**Verification evidence:** `npm test` — 43/43 passing, including the new `renders all seven agents` (all 4 harness paths) and `diagnosis agent carries its contract and required reference` tests.
