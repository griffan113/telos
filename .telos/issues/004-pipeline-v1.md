---
id: 004
title: "004: Pipeline v1 — start telos + Specification + Contracts"
kind: ticket
status: ready-for-agent
created: 2026-09-09
blocked_by: ["003: Neutral agent definitions + four harness adapters + update rules"]
---

# 004: Pipeline v1 — start telos + Specification + Contracts

**What to build:** A runnable pipeline with real logic in its first phases. The orchestrator's "start telos" flow creates PROJECT.md and ROADMAP.md and holds an approval gate on them before any feature work. A feature then flows through Specification (elicitation producing requirements with traceable IDs) and Contracts (interface contracts keyed to those IDs), each written as a `.telos/` artifact with the frontmatter schema and each pausing for explicit human approval — approve advances, requested changes loop back to revision at the same gate. Phase agents read the artifact language from telos.json at runtime: all artifact prose and their conversational replies are in the user's language, while their instruction prompts stay English. Agents analyze the consumer repo's code live and read its native instruction files (AGENTS.md / CLAUDE.md) for conventions — Telos maintains no codebase docs. Standalone phase invocation reads context from disk and hard-stops with a precise message naming the missing upstream artifact; the orchestrator passes only feature and phase, so both modes run the identical code path. STATE.md tracks phase statuses.

**Blocked by:** 003: Neutral agent definitions + four harness adapters + update rules.

**Status:** ready-for-agent

- [ ] Artifact prose and agent conversation follow the language recorded in telos.json; instruction prompts stay English
- [ ] Agents read code live and consumer instruction files for conventions; no Telos-maintained codebase docs exist
- [ ] "start telos" creates and gate-approves PROJECT.md + ROADMAP.md; feature phases refuse to run before it has run
- [ ] Specification and Contracts produce real, gate-approved artifacts with requirement-ID traceability
- [ ] Gates never auto-advance; revision re-presents at the same gate
- [ ] Standalone phase invocation reconstructs context from disk and hard-stops on missing upstream artifacts
- [ ] Orchestrated dispatch passes only feature + phase; the phase agent's return is artifact path, status, and a short summary
- [ ] STATE.md reflects phase statuses and is rewritten by the orchestrator, never hand-edited
