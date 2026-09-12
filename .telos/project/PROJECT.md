---
phase: project
status: approved
approved_at: 2026-09-12T14:36:44Z
content_hash: 263c236737cb7e8a41c8a90d4b27ef6f
depends_on: []
---

# PROJECT.md — Telos

## Purpose

Telos ("coding with purpose") is a harness-agnostic, orchestrator-driven,
spec-driven framework for building software with AI coding agents. One
orchestrator agent drives every feature through five phases — Specification →
Contracts → Design → Tasks → Implementation — pausing for explicit human
approval at every phase transition. It merges TLC's structured, parallel,
automatic flow with Matt Pocock's skills-framework external-tool sync
(GitHub Issues, Azure DevOps), resolving the manual-invocation weakness by
making the whole pipeline orchestrator-driven while keeping every phase agent
usable standalone.

## Users

- **Developers using AI coding harnesses** (OpenCode, Claude Code, VS Code
  Copilot, Codex) who want spec-driven, gate-enforced feature work installed
  into any repo via `npx use-telos init`.
- **Framework contributors** working on this repo itself (the agents,
  adapters, templates, and CLI that render Telos into each harness).

## Goals

1. One orchestrator drives every feature through the five phases, enforcing
   explicit approval gates — nothing advances unapproved.
2. Every phase agent works both orchestrated (dispatched by the orchestrator)
   and standalone (reading prior artifacts from disk, hard-stopping precisely
   on missing/unapproved upstream artifacts — never stubbing).
3. Out-of-band edits of approved artifacts are detected via content hashes and
   cascade staleness downstream, automatically re-running affected phases
   through their gates.
4. Tasks sync into the configured tracker (local / GitHub Issues via `gh` /
   Azure DevOps via `az boards`); the tracker is authoritative for task status
   in cloud modes; verified tasks close their issues.
5. Independent tasks execute in parallel where the harness supports subagents;
   single-context harnesses emulate dispatch sequentially with identical
   pipeline semantics.
6. Init-time configurability: harness detection/selection, tracker choice,
   artifact language (read at runtime from `.telos/telos.json`).

## Non-goals

- No Agile concepts (sprints, story points, epics/stories, capacity) in this
  pass — architecturally nothing should block adding them later.
- No durable codebase documentation: phase agents analyze the live code and
  read the repo's own AGENTS.md/CLAUDE.md instead.
- No auto-approval of gates, ever; no interactive popups for gates.
- No manual `package.json` version bumps — releases come from release-please
  on Conventional Commits.

## Current state

Version 0.0.3, published as `use-telos` on npm. The six agents (orchestrator +
five phases), the pipeline reference, tracker templates, and the `init`/
`update` CLI exist. Issue #1 (open, bug) reports that the orchestrator starts
eliciting a feature's Specification immediately after the "start telos"
initialization flow, without asking the user — the post-initialization pause
and consent step is missing.
