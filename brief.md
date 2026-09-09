# Telos Framework — Implementation Brief

## Context

We are building **Telos** ("coding with purpose"), a harness engineering framework that merges the strengths of two existing frameworks we currently use separately:

- **TLC (spec-driven framework)**: strong at structured, automatic internal flow, and at parallelizing work by breaking features down into independent tasks with explicit dependencies.
- **Matt Pocock's skills framework (AI Hero)**: strong at automatically syncing generated tasks into external tools (GitHub Issues, Azure DevOps), but its skills are invoked manually — there's no automatic orchestration between them.

Neither framework integrates with Agile concepts (sprints, capacity, epics/stories). That gap is out of scope for this first implementation pass but should be kept in mind architecturally (don't design anything that would block adding it later).

**Goal of this task**: implement Telos as a multi-agent system that takes TLC's structured, parallel, automatic flow and combines it with Matt Pocock's external-tool sync and skill modularity — but resolves the "manual invocation" weakness by making the whole pipeline orchestrator-driven, while still allowing every individual agent to be called standalone.

## Multi-agent architecture requirements

- **One orchestrator agent** that drives the pipeline phase by phase, manages state, and enforces approval gates.
- **One specialized agent per phase** (Specification, Contracts, Design, Tasks, Implementation), each with a narrow, phase-specific system prompt/context rather than one generalist agent handling everything.
- Every agent must be usable **two ways**:
  - **Orchestrated**: invoked by the orchestrator as part of the full pipeline run.
  - **Standalone**: invoked directly by the user for just that phase (e.g., only regenerating the Design artifact). In standalone mode, the agent must read the relevant prior artifact(s) from disk to reconstruct context; if a prior artifact is missing, it should prompt the user or generate a stub rather than fail silently.

## State & artifacts

- All phase artifacts live in a predictable location in the project, e.g .telos folder

## Approval gates

- The orchestrator must pause and require **explicit human approval at every phase transition** — no phase auto-advances to the next without confirmation.
- If the user requests changes instead of approving, the current phase's agent revises and re-presents the artifact for the same gate; it does not advance.

## Cascade reprocessing

- If a previously **approved** phase's artifact is edited and re-approved, all downstream artifacts that already exist must be marked `status: stale` in their frontmatter.
- The orchestrator must then automatically trigger reprocessing of every downstream phase in order, re-running through their own approval gates again — this should happen automatically, not require the user to manually re-invoke each phase.

## Deliverable for this task

Implement the orchestrator and the four remaining phase agents (Contracts, Design, Tasks, Implementation), following the same structural pattern as the existing Specification agent:

1. Phase-specific elicitation/generation logic.
2. Output written to the corresponding `.telos/*.md` file with the frontmatter schema above.
3. Approval gate behavior (draft → approved, re-present on requested changes).
4. Standalone invocation support (read prior artifacts from disk, handle missing dependencies gracefully).
5. For the Tasks agent specifically: generate a dependency graph enabling parallel execution, and implement the external sync integration (GitHub Issues / Azure DevOps task creation), following Matt Pocock's framework as the reference for that integration.
6. Orchestrator: sequencing logic, gate enforcement, and cascade-reprocessing logic as described above.
