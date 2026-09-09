---
id: 001
title: Spec — Telos framework (orchestrator-driven spec-driven framework, npx-distributed)
status: ready-for-agent
kind: spec
created: 2026-09-09
---

# Spec — Telos framework

## Problem Statement

A developer using AI coding agents to plan and build features loses three things as work grows: structure (requirements drift from implementation), parallelism (tasks execute one at a time even when independent), and visibility (task status lives in the chat, invisible to the project's issue tracker). Two existing frameworks each solve half of this: TLC gives a structured, automatic, parallelizable internal flow but keeps all state local; external-tracker skills give cloud visibility but must be invoked manually and never orchestrate anything. Running both together means running two half-systems with no shared state.

## Solution

**Telos** ("coding with purpose"): a harness-agnostic, orchestrator-driven framework installed into any repo via `npx telos init`. One orchestrator agent drives every feature through five phases — Specification → Contracts → Design → Tasks → Implementation — pausing for explicit human approval at every phase transition. Approved artifacts live as markdown under `.telos/`; editing an approved artifact automatically marks downstream artifacts stale and re-runs them through their gates. The Tasks phase syncs into a real issue tracker (GitHub, Azure DevOps, or local markdown, user's choice), and that tracker is authoritative for task status, mirrored into a local STATE.md that is always in sync. The same agents work across OpenCode, Claude Code, VS Code Copilot, and Codex — rendered from one harness-neutral source into each harness's native format at init.

## User Stories

1. As a developer starting a new project, I want to run `npx telos init` in my repo, so that the framework is set up without reading any documentation.
2. As a developer running init, I want the tool to detect which AI harness I use (OpenCode, Claude Code, VS Code Copilot, Codex), so that agents appear where my harness already looks for them.
3. As a developer with multiple harnesses on one repo, I want to select more than one harness during init, so that the same pipeline works from my laptop CLI and my cloud agent.
4. As a developer whose harness isn't detected or who has several installed, I want to be prompted for (or force via `--harness`) the target, so that detection is a convenience, never a gate.
5. As a developer without a cloud tracker, I want a local-markdown tracker that works out of the box with zero auth, so that init never blocks on credentials.
6. As a developer with a GitHub repo, I want tasks synced as GitHub Issues with a `telos:<feature>` label, so that my team sees the work in the tool we already use.
7. As a developer on Azure DevOps, I want tasks synced as Task work items with native dependency links, so that the board reflects the real execution order.
8. As a developer picking a tracker, I want that choice recorded in `.telos/tracker.md`, so that every session reads the same configuration.
9. As a consumer of the framework, I want `npx telos` to say "start telos" next, so that I know the entry point into the pipeline.
10. As a developer starting a project, I want the orchestrator's "start telos" flow to create and gate-approve PROJECT.md and ROADMAP.md, so that goals exist before any feature is specified.
11. As a developer describing a feature, I want the orchestrator to route it into the Specification phase, so that requirements are captured with traceable IDs before anything else happens.
12. As a reviewer of the spec, I want the phase agent to pause and present the artifact for approval, so that nothing advances without my explicit sign-off.
13. As a reviewer rejecting an artifact, I want my change requests to send the phase back to revision and re-presentation at the same gate, so that the pipeline never advances on an unapproved artifact.
14. As a developer with a complex feature, I want a Contracts phase that pins machine-readable interfaces (types, API shapes, module boundaries) after the spec and before design, so that design and tasks validate against fixed interfaces.
15. As a developer reviewing the Design phase, I want depth sized to the feature's complexity, so that small features get 10-line artifacts, not architecture essays.
16. As a developer waiting on task breakdown, I want the Tasks agent to emit a dependency graph with each task's `depends_on`, so that independent work can run in parallel.
17. As a developer whose tasks were just approved, I want each task to become an issue in the chosen tracker with its blocking edges, so that the cloud reflects the plan the moment I approve it.
18. As a developer executing tasks, I want the orchestrator to compute the ready set from `depends_on` and fan out parallel implementation subagents where the harness supports it, so that independent tasks finish concurrently.
19. As a developer whose task is verified, I want its issue closed and STATE.md updated automatically, so that local and cloud state never drift.
20. As a developer who edits an approved artifact, I want the orchestrator to detect the edit by content hash and mark all downstream artifacts stale, so that my change is never silently ignored.
21. As a developer whose edit cascades, I want stale phases to re-run automatically through their gates in order, so that I don't manually re-invoke five agents.
22. As a developer whose re-plan changes the task set, I want unchanged tasks to keep their issues, new tasks to get issues, and removed tasks closed with a "superseded" comment, so that tracker history stays truthful.
23. As a developer returning next session, I want the orchestrator to resume from STATE.md exactly where the gates left off, so that cross-session work needs no re-explaining.
24. As a solo developer, I want the local tracker to be the tasks files themselves rather than a duplicate issue store, so that there is exactly one source of truth per task.
25. As a developer invoking a single phase directly (e.g., "regenerate design.md"), I want that agent to reconstruct its context from disk, so that standalone and orchestrated runs behave identically.
26. As a developer invoking a phase with a missing upstream artifact, I want a precise hard-stop telling me which artifact to produce first, so that a stub spec never poisons downstream work.
27. As a framework user upgrading, I want `npx telos update` to re-render agent files that carry the generated marker and warn-and-skip files I've hand-modified, so that my customizations are never silently destroyed.
28. As a framework maintainer, I want schema migrations on `update` to be additive with a printed changelog, so that consumer artifacts are never rewritten destructively.
29. As a VS Code Copilot user, I want the pipeline available as custom chat modes, so that I get the same gate/cascade behavior even though my harness can't spawn subagents.
30. As a Codex user, I want the agents installed as skills in `.codex/skills/`, so that they appear as native slash-invocable skills.
31. As a developer reviewing progress, I want STATE.md to show phase statuses, the mirrored task table, and decisions/blockers, so that one file orients any new session.
32. As a contributor to the framework repo itself, I want the pipeline dogfooded on this repo's own local tracker, so that the framework is validated on real work before release.

## Implementation Decisions

- **Distribution**: npm package `telos` (name verified available; claim immediately at 0.0.1). CLI surface is exactly `init` and `update`; `init` is interactive (tracker → harness detection/multi-select), overridable by flags.
- **Architecture**: one orchestrator agent + five phase agents. Phase-specific elicitation/generation logic lives in each agent's prompt; TLC's proven mechanics (requirement IDs, context-loading strategy, task format, verification per task, atomic commits) are carried over but rewritten fresh — no auto-sizing, no quick mode, uniform five-phase flow with depth sized per phase.
- **No codebase documentation**: Telos owns zero durable codebase docs (TLC's codebase doc tree is dropped). Phase agents analyze the actual code live whenever they need codebase context, and read the consumer repo's own native instruction files (AGENTS.md / CLAUDE.md) for conventions instead of maintaining Telos copies. Per-task verification plans in TASK.md replace TLC's TESTING.md role. Accepted cost: repeated code analysis per feature on large repos; "cached codebase context" is a possible future opt-in.
- **Artifact language**: init offers a language selector (common languages + free text, default English when skipped), stored in telos.json and read by agents at runtime — never baked into rendered agent files, so changing it never requires `telos update`. It governs the prose of all generated artifacts (spec, contracts, design, tasks, TASK.md, PROJECT.md, ROADMAP, STATE.md), tracker issue bodies, and the agents' conversational replies. It never governs agent instruction prompts (English), CLI strings (English in v1), or code/comments. One language per repo, no per-artifact overrides; a language change applies only to content written afterwards — existing artifacts are never rewritten. The `telos:` tracker title convention and structural patterns are ASCII-fixed; only descriptive prose localizes, because cascade re-plan diffing machine-parses titles.
- **Contracts phase**: interface contracts between Specification and Design; artifact keyed to spec requirement IDs.
- **Agent source format**: six harness-neutral markdown agent definitions with frontmatter (name, description, phase, required-references) in the package; thin per-harness adapters render them at init/update. Targets: OpenCode → `.opencode/agent/`, Claude Code → `.claude/agents/`, Copilot → `.github/chatmodes/*.chatmode.md`, Codex → `.codex/skills/` (Codex slash prompts are deprecated upstream; skills are the supported surface).
- **Single-context harnesses**: Copilot/Codex cannot spawn subagents; the orchestrator emulates dispatch by loading each phase's prompt file by path in one session. True subagent isolation is an OpenCode/Claude Code capability. Pipeline semantics, gates, and cascade are file-based and therefore identical everywhere.
- **Artifacts & frontmatter**: `.telos/features/<feature>/` holds `spec.md`, `contracts.md`, `design.md`, `tasks.md`, and `tasks/NN-slug/TASK.md`. `implementation.md` is deliberately dropped — `tasks.md` + TASK.md frontmatter is the execution ledger. Frontmatter schema: `phase`, `status: draft|approved|stale`, `approved_at`, `content_hash`, `depends_on`.
- **Gates**: orchestrator-only. Explicit reply-based (approve / request changes + feedback). Revision loops re-present at the same gate. Editing an approved file out-of-band is detected at next resume by content-hash mismatch → auto-stale cascade; the user never has to announce edits.
- **Dispatch contract**: orchestrator passes only `{feature, phase}`; phase agents read all context from disk. Return value: artifact path + frontmatter status + ≤10-line summary. This makes standalone invocation literally the same code path.
- **Project initialization**: "start telos" orchestrator flow creates PROJECT.md + ROADMAP.md with an approval gate; feature phases hard-stop until it has run. `init` scaffolds the empty tree and tells the user to run "start telos" with their agent.
- **`.telos/` layout**: `telos.json` (framework version, harness list, tracker choice), `references/` (framework reference docs copied at init), `project/` (PROJECT.md, ROADMAP.md, STATE.md), `features/<feature>/…`, `tracker.md` (sole tracker config; no Matt Pocock `docs/agents/` mirroring — Telos replaces those skills).
- **STATE.md**: generated, rewritten wholesale, never hand-edited. Sections: phase-status table (local truth), mirrored task table (tracker truth for cloud modes), decisions & blockers.
- **Tracker interface**: uniform ops — `create_task`, `close_task`, `comment`, `assign`, `list_open(feature)`, `set_blocked_by`, `fetch_status`. GitHub: `gh` CLI, label `telos:<feature>`, body-convention blocking (`Blocked by: #NN`). Azure: `az boards`, Task work items, title `telos: <feature> NN <slug>`, native dependency links. Local: tasks-as-tracker (no duplicate store); STATE.md's task mirror collapses to a view of the task files.
- **Sync semantics**: tracker authoritative for task status in cloud modes; tasks created at Tasks-phase approval; issues closed on task verification; cascade re-plan diffs old vs new task set — unchanged keep issues, new get issues, removed close with a superseded comment, never silent reuse. Gate approvals stay local-only.
- **Parallel execution**: orchestrator computes the ready set from `depends_on` and dispatches Implementation subagents in parallel (where the harness allows), enforcing per-task verification before marking done.
- **Update rules**: generated files carry a `<!-- telos:generated vX.Y.Z -->` marker; `update` overwrites marked files unconditionally, warns and skips unmarked ones (treated as user-owned), never touches `.telos/` content except additive migrations with a printed changelog.
- **Framework repo packaging**: `bin/` (CLI), `agents/` (neutral definitions), `adapters/{opencode,claude-code,copilot,codex}/`, `references/`, `templates/` (STATE.md, tracker sheets, telos.json, PROJECT.md). TLC's copied root files (`SKILL.md`, `README.md`, `references/`) are superseded source material, not shipped content.

## Testing Decisions

- **One seam only: the CLI.** Tests execute `telos init` / `telos update` against disposable temp directories and assert observable output — the generated file tree, renders for all four harnesses, detection and multi-select behavior, `--harness` override, marker-based overwrite/warn/skip rules, and `telos.json` contents. No internals are tested; if a test needs an internal, it's a sign the CLI output isn't covering it.
- The agent prompts themselves (gate behavior, elicitation quality, cascade interpretation) are not automatable: they are verified by dogfooding the pipeline on real features, starting with this framework's own work.
- No prior-art tests exist in this repo (it's a fresh framework); the temp-directory CLI test suite is the founding pattern and should stay the only pattern.

## Out of Scope

- Agile concepts: sprints, capacity, epics/stories (architecturally must not be blocked later, but not built now).
- Cached/curated codebase context docs (possible future opt-in; v1 re-reads code live).
- Per-artifact or per-feature language overrides; localized CLI strings.
- Matt Pocock skills compatibility (`docs/agents/`, triage labels) — Telos replaces them.
- `telos status` / `doctor` commands.
- Cursor, Gemini CLI, or any harness beyond the four listed.
- Alternative npm names or scoped packages.
- Automated testing of agent prompt behavior.

## Further Notes

- The `ready-for-agent` status in this issue's frontmatter is the local-tracker analogue of the triage label; tickets generated from this spec carry the same status convention.
- Codex also reads `.agents/skills/`; the Codex adapter must write only to `.codex/skills/` to avoid duplicate skill registration (a known upstream quirk).
- VS Code Copilot renders agents as custom chat modes; docs should tell consumers these run single-context by design, not as a bug.
- The npm `telos` name was verified unregistered at spec time; publish immediately to hold it.
