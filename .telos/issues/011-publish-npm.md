---
id: 011
title: "011: Publish to npm + README"
kind: ticket
status: ready-for-agent
created: 2026-09-09
blocked_by: ["010: Dogfood the pipeline on this repo"]
---

# 011: Publish to npm + README

**Note (2026-09-09):** npm rejected the bare `telos` name (similarity policy,
403 vs teajos/tebs/tslog). Package renamed to `use-telos` by user decision;
the installed binary command stays `telos`.

**What to build:** The framework ships: publish to npm so `npx telos init` works for anyone (the package name was verified unregistered at spec time — claim it early if a hold is wanted), plus a README telling the story: what Telos is, the `npx telos init` entry point, the harness matrix with the single-context note for Copilot/Codex, and the three tracker options. The TLC source material copied into this repo remains history, not shipped content.

**Blocked by:** 010: Dogfood the pipeline on this repo.

**Status:** in-progress

- [ ] Package published; `npx telos init` works on a clean machine in an empty repo
- [x] README covers the pipeline, the five phases and gates, the four harnesses, and the three trackers
- [x] The four-harness render outputs are all produced by the published package (verified against the packed tarball via `npx file:telos-0.0.1.tgz init --harness opencode,claude-code,copilot,codex` in an empty temp repo: 24 agents across all four native dirs)
- [x] TLC's copied root files are superseded and not shipped in the package (moved to `prior-art/TLC-README.md` / `prior-art/TLC-SKILL.md`; `files` field excludes `prior-art/`)
