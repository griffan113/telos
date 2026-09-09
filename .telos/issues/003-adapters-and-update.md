---
id: 003
title: "003: Neutral agent definitions + four harness adapters + update rules"
kind: ticket
status: ready-for-agent
created: 2026-09-09
blocked_by: ["002: Package skeleton + telos init core"]
---

# 003: Neutral agent definitions + four harness adapters + update rules

**What to build:** The framework ships six harness-neutral agent definition files (orchestrator + Specification, Contracts, Design, Tasks, Implementation) with frontmatter. Init renders them through thin adapters into each selected harness's native location: OpenCode agent dir, Claude Code agents dir, Copilot chat modes, Codex skills (writing only to the Codex skills dir to avoid the duplicate-registration quirk where Codex also reads `.agents/skills/`). `telos update` re-renders: generated files carry a generated-marker comment and are overwritten unconditionally; files lacking the marker are treated as user-owned, warned about, and skipped. Initial prompts are skeletons — the pipeline runs end-to-end shallow, with real phase logic arriving in later tickets.

**Blocked by:** 002: Package skeleton + telos init core.

**Status:** done

- [x] Init renders all six agents into every selected harness's native directory, multi-select supported
- [x] Each generated file carries the generated-marker comment with the framework version
- [x] Update overwrites marker-carrying files and warns-and-skips unmarked (user-owned) files
- [x] Update never touches `.telos/` content outside additive migrations with a printed changelog
- [x] The CLI test suite asserts renders for all four harnesses, including the marker overwrite/skip rules
