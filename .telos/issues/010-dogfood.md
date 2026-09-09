---
id: 010
title: "010: Dogfood the pipeline on this repo"
kind: ticket
status: ready-for-agent
created: 2026-09-09
blocked_by: ["007: Cascade staleness"]
---

# 010: Dogfood the pipeline on this repo

**What to build:** Run a real feature of this framework start-to-finish through Telos's own pipeline using the local tracker — "start telos", spec, contracts, design, tasks, implementation, all gates and (at least once) a cascade re-run. This is the only verification of gate behavior, elicitation quality, and cascade interpretation in live use; findings become fix tickets before anything ships.

**Blocked by:** 007: Cascade staleness.

**Status:** ready-for-agent

- [ ] A real feature completes all five phases through the pipeline with real gate pauses
- [ ] At least one approved-artifact edit triggers the full stale cascade in practice
- [ ] The local tracker mode carries the whole run without a duplicate issue store
- [ ] All friction or defects found are filed as follow-up tickets
